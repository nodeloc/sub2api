import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'
import { usePaymentStore } from '@/stores/payment'
import { paymentAPI } from '@/api/payment'
import { extractApiErrorMessage, extractI18nErrorMessage } from '@/utils/apiError'
import { isMobileDevice } from '@/utils/device'
import { formatPaymentAmount, normalizePaymentCurrency } from '@/components/payment/currency'
import { METHOD_ORDER, getPaymentPopupFeatures } from '@/components/payment/providerConfig'
import {
  PAYMENT_RECOVERY_STORAGE_KEY,
  buildCreateOrderPayload,
  clearPaymentRecoverySnapshot,
  decidePaymentLaunch,
  getVisibleMethods,
  normalizeVisibleMethod,
  readPaymentRecoverySnapshot,
  writePaymentRecoverySnapshot,
  type PaymentRecoverySnapshot,
} from '@/components/payment/paymentFlow'
import type { PaymentMethodOption } from '@/components/payment/PaymentMethodSelector.vue'
import type { CheckoutInfoResponse, CreateOrderResult } from '@/types/payment'
import { buildPaymentErrorToastMessage, describePaymentScenarioError } from '@/views/user/paymentUx'

interface WeixinJSBridgeLike {
  invoke(
    action: string,
    payload: Record<string, unknown>,
    callback: (result: Record<string, unknown>) => void,
  ): void
}

interface CreateOrderOptions {
  openid?: string
  wechatResumeToken?: string
  paymentType?: string
  isResume?: boolean
  mobileQrFallbackAttempted?: boolean
}

function emptyPaymentState(): PaymentRecoverySnapshot {
  return {
    orderId: 0,
    amount: 0,
    qrCode: '',
    expiresAt: '',
    paymentType: '',
    payUrl: '',
    outTradeNo: '',
    clientSecret: '',
    intentId: '',
    currency: '',
    countryCode: '',
    paymentEnv: '',
    payAmount: 0,
    orderType: '',
    paymentMode: '',
    resumeToken: '',
    createdAt: 0,
  }
}

function getWeixinJSBridge(): WeixinJSBridgeLike | undefined {
  return (window as Window & { WeixinJSBridge?: WeixinJSBridgeLike }).WeixinJSBridge
}

function waitForWeixinJSBridge(timeoutMs = 4000): Promise<WeixinJSBridgeLike | null> {
  const existing = getWeixinJSBridge()
  if (existing) return Promise.resolve(existing)
  return new Promise((resolve) => {
    let settled = false
    const finish = (bridge: WeixinJSBridgeLike | null) => {
      if (settled) return
      settled = true
      document.removeEventListener('WeixinJSBridgeReady', handleReady)
      document.removeEventListener('onWeixinJSBridgeReady', handleReady)
      window.clearTimeout(timer)
      resolve(bridge)
    }
    const handleReady = () => finish(getWeixinJSBridge() ?? null)
    const timer = window.setTimeout(() => finish(getWeixinJSBridge() ?? null), timeoutMs)
    document.addEventListener('WeixinJSBridgeReady', handleReady, false)
    document.addEventListener('onWeixinJSBridgeReady', handleReady, false)
  })
}

async function invokeWechatJsapiPayment(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const bridge = await waitForWeixinJSBridge()
  if (!bridge) {
    throw new Error('WECHAT_JSAPI_UNAVAILABLE')
  }
  return new Promise((resolve) => {
    bridge.invoke('getBrandWCPayRequest', payload, (result) => resolve(result || {}))
  })
}

// WeChat in-app payments require an OAuth round-trip. The authorize URL redirects
// back to /purchase, where the existing resume flow finishes the payment — so the
// rare WeChat-in-app case degrades gracefully to the dedicated checkout page.
function buildWechatOAuthAuthorizeUrl(
  authorizeUrl: string,
  context: { paymentType: string; orderAmount: number },
): string {
  const normalizedUrl = authorizeUrl.trim()
  if (!normalizedUrl || typeof window === 'undefined') {
    return normalizedUrl
  }
  try {
    const targetUrl = new URL(normalizedUrl, window.location.origin)
    const redirectPath = targetUrl.searchParams.get('redirect') || '/purchase'
    const redirectUrl = new URL(redirectPath, window.location.origin)
    const paymentType = normalizeVisibleMethod(context.paymentType) || context.paymentType.trim() || 'wxpay'
    redirectUrl.searchParams.set('payment_type', paymentType)
    redirectUrl.searchParams.set('order_type', 'balance')
    redirectUrl.searchParams.delete('plan_id')
    if (context.orderAmount > 0) {
      redirectUrl.searchParams.set('amount', String(context.orderAmount))
    } else {
      redirectUrl.searchParams.delete('amount')
    }
    targetUrl.searchParams.set('redirect', `${redirectUrl.pathname}${redirectUrl.search}`)
    return targetUrl.toString()
  } catch {
    return normalizedUrl
  }
}

export function useRechargeFlow() {
  const i18n = useI18n()
  const { t } = i18n
  const router = useRouter()
  const appStore = useAppStore()
  const paymentStore = usePaymentStore()

  const loading = ref(true)
  const submitting = ref(false)
  const errorMessage = ref('')
  const errorHintMessage = ref('')
  const amount = ref<number | null>(null)
  const selectedMethod = ref('')
  const paymentPhase = ref<'select' | 'paying'>('select')
  const paymentState = ref<PaymentRecoverySnapshot>(emptyPaymentState())

  const checkout = ref<CheckoutInfoResponse>({
    methods: {}, global_min: 0, global_max: 0,
    plans: [], balance_disabled: false, balance_recharge_multiplier: 1, recharge_fee_rate: 0,
    help_text: '', help_image_url: '', stripe_publishable_key: '',
  })

  const visibleMethods = computed(() => getVisibleMethods(checkout.value.methods))
  const enabledMethods = computed(() => Object.keys(visibleMethods.value))
  const balanceDisabled = computed(() => checkout.value.balance_disabled === true)
  const validAmount = computed(() => amount.value ?? 0)
  const balanceRechargeMultiplier = computed(() => {
    const multiplier = checkout.value.balance_recharge_multiplier
    return multiplier > 0 ? multiplier : 1
  })
  const creditedAmount = computed(() => Math.round((validAmount.value * balanceRechargeMultiplier.value) * 100) / 100)

  function amountFitsMethod(amt: number, methodType: string): boolean {
    if (amt <= 0) return true
    const ml = visibleMethods.value[methodType]
    if (!ml) return false
    if (ml.single_min > 0 && amt < ml.single_min) return false
    if (ml.single_max > 0 && amt > ml.single_max) return false
    return true
  }

  const globalMinAmount = computed(() => {
    const limits = Object.values(visibleMethods.value)
    if (limits.length === 0) return 0
    if (limits.some((limit) => limit.single_min <= 0)) return 0
    return Math.min(...limits.map((limit) => limit.single_min))
  })
  const globalMaxAmount = computed(() => {
    const limits = Object.values(visibleMethods.value)
    if (limits.length === 0) return 0
    if (limits.some((limit) => limit.single_max <= 0)) return 0
    return Math.max(...limits.map((limit) => limit.single_max))
  })

  const selectedLimit = computed(() => visibleMethods.value[selectedMethod.value])
  const selectedCurrency = computed(() => normalizePaymentCurrency(selectedLimit.value?.currency))
  const localeCode = computed(() => {
    const raw = i18n.locale as unknown
    if (typeof raw === 'string') return raw
    if (raw && typeof raw === 'object' && 'value' in raw) {
      return String((raw as { value?: string }).value || '')
    }
    return undefined
  })

  function formatAmount(value: number): string {
    return formatPaymentAmount(value, selectedCurrency.value, localeCode.value)
  }

  const methodOptions = computed<PaymentMethodOption[]>(() =>
    enabledMethods.value.map((type) => {
      const ml = visibleMethods.value[type]
      return {
        type,
        fee_rate: ml?.fee_rate ?? 0,
        available: ml?.available !== false && amountFitsMethod(validAmount.value, type),
      }
    })
  )

  const feeRate = computed(() => checkout.value?.recharge_fee_rate ?? 0)
  const feeAmount = computed(() =>
    feeRate.value > 0 && validAmount.value > 0
      ? Math.ceil(((validAmount.value * feeRate.value) / 100) * 100) / 100
      : 0
  )
  const totalAmount = computed(() =>
    feeRate.value > 0 && validAmount.value > 0
      ? Math.round((validAmount.value + feeAmount.value) * 100) / 100
      : validAmount.value
  )

  const amountError = computed(() => {
    if (validAmount.value <= 0) return ''
    if (!enabledMethods.value.some((m) => amountFitsMethod(validAmount.value, m))) {
      return t('payment.amountNoMethod')
    }
    const ml = selectedLimit.value
    if (ml) {
      if (ml.single_min > 0 && validAmount.value < ml.single_min) return t('payment.amountTooLow', { min: formatAmount(ml.single_min) })
      if (ml.single_max > 0 && validAmount.value > ml.single_max) return t('payment.amountTooHigh', { max: formatAmount(ml.single_max) })
    }
    return ''
  })

  const canSubmit = computed(() =>
    validAmount.value > 0
      && amountFitsMethod(validAmount.value, selectedMethod.value)
      && selectedLimit.value?.available !== false
  )

  // Auto-switch to a method that can handle the current amount.
  watch(() => [validAmount.value, selectedMethod.value] as const, ([amt, method]) => {
    if (amt <= 0 || amountFitsMethod(amt, method)) return
    const available = enabledMethods.value.find((m) => amountFitsMethod(amt, m))
    if (available) selectedMethod.value = available
  })

  function persistRecoverySnapshot(snapshot: PaymentRecoverySnapshot) {
    if (typeof window === 'undefined' || !snapshot.orderId) return
    writePaymentRecoverySnapshot(window.localStorage, snapshot, PAYMENT_RECOVERY_STORAGE_KEY)
  }
  function removeRecoverySnapshot() {
    if (typeof window === 'undefined') return
    clearPaymentRecoverySnapshot(window.localStorage, PAYMENT_RECOVERY_STORAGE_KEY)
  }

  function resetPayment() {
    paymentPhase.value = 'select'
    paymentState.value = emptyPaymentState()
    removeRecoverySnapshot()
  }

  async function redirectToPaymentResult(state: PaymentRecoverySnapshot): Promise<void> {
    const query: Record<string, string | undefined> = {}
    if (state.orderId > 0) query.order_id = String(state.orderId)
    if (state.outTradeNo) query.out_trade_no = state.outTradeNo
    if (state.resumeToken) query.resume_token = state.resumeToken
    await router.push({ path: '/payment/result', query })
  }

  function applyScenarioError(err: unknown, paymentMethod: string): boolean {
    const descriptor = describePaymentScenarioError(err, {
      paymentMethod,
      isMobile: isMobileDevice(),
      isWechatBrowser: typeof window !== 'undefined' && /MicroMessenger/i.test(window.navigator.userAgent),
    })
    if (!descriptor) {
      errorMessage.value = ''
      errorHintMessage.value = ''
      return false
    }
    errorMessage.value = t(descriptor.messageKey)
    errorHintMessage.value = descriptor.hintKey ? t(descriptor.hintKey) : ''
    appStore.showError(buildPaymentErrorToastMessage(errorMessage.value, errorHintMessage.value))
    return true
  }

  function shouldFallbackToDesktopQr(err: unknown, paymentMethod: string, attempted: boolean): boolean {
    if (attempted || !isMobileDevice()) return false
    const normalizedMethod = normalizeVisibleMethod(paymentMethod) || paymentMethod
    const reason = typeof err === 'object' && err && 'reason' in err && typeof err.reason === 'string' ? err.reason : ''
    const message = err instanceof Error
      ? err.message
      : (typeof err === 'object' && err && 'message' in err && typeof err.message === 'string' ? err.message : '')
    const normalizedMessage = message.toLowerCase()
    if (normalizedMethod === 'wxpay') {
      return reason === 'WECHAT_H5_NOT_AUTHORIZED'
        || reason === 'WECHAT_PAYMENT_MP_NOT_CONFIGURED'
        || reason === 'WECHAT_JSAPI_FAILED'
        || reason === 'PAYMENT_GATEWAY_ERROR'
        || reason === 'UNHANDLED_PAYMENT_SCENARIO'
        || normalizedMessage.includes('weixinjsbridge is unavailable')
        || normalizedMessage.includes('wechat_jsapi_unavailable')
    }
    if (normalizedMethod === 'alipay') {
      return reason === 'PAYMENT_GATEWAY_ERROR' || reason === 'UNHANDLED_PAYMENT_SCENARIO'
    }
    return false
  }

  async function attemptMobileQrFallback(err: unknown, context: { orderAmount: number; paymentType: string; attempted: boolean }): Promise<boolean> {
    if (!shouldFallbackToDesktopQr(err, context.paymentType, context.attempted)) return false
    try {
      const visibleMethod = normalizeVisibleMethod(context.paymentType) || context.paymentType
      const payload = buildCreateOrderPayload({
        amount: context.orderAmount,
        paymentType: visibleMethod,
        orderType: 'balance',
        origin: typeof window !== 'undefined' ? window.location.origin : '',
        isMobile: false,
        isWechatBrowser: false,
      })
      const result = await paymentStore.createOrder(payload) as CreateOrderResult & { resume_token?: string }
      const stripeMethod = visibleMethod === 'wxpay' ? 'wechat_pay' : 'alipay'
      const stripeRouteUrl = result.client_secret
        ? router.resolve({
          path: '/payment/stripe',
          query: {
            order_id: String(result.order_id),
            client_secret: result.client_secret,
            method: stripeMethod,
            resume_token: result.resume_token || undefined,
          },
        }).href
        : ''
      const decision = decidePaymentLaunch(result, {
        visibleMethod,
        orderType: 'balance',
        isMobile: false,
        isWechatBrowser: false,
        stripePopupUrl: stripeRouteUrl,
        stripeRouteUrl,
      })
      if (decision.kind !== 'qr_waiting' || !decision.paymentState.qrCode) return false
      errorMessage.value = ''
      errorHintMessage.value = ''
      paymentState.value = decision.paymentState
      paymentPhase.value = 'paying'
      persistRecoverySnapshot(decision.recovery)
      appStore.showWarning(t('payment.errors.mobilePaymentFallbackToQr'))
      return true
    } catch {
      return false
    }
  }

  async function createOrder(orderAmount: number, options: CreateOrderOptions = {}) {
    submitting.value = true
    errorMessage.value = ''
    errorHintMessage.value = ''
    const requestType = normalizeVisibleMethod(options.paymentType || selectedMethod.value) || options.paymentType || selectedMethod.value
    try {
      const payload = buildCreateOrderPayload({
        amount: orderAmount,
        paymentType: requestType,
        orderType: 'balance',
        origin: typeof window !== 'undefined' ? window.location.origin : '',
        isMobile: isMobileDevice(),
        isWechatBrowser: typeof window !== 'undefined' && /MicroMessenger/i.test(window.navigator.userAgent),
        forceQRCode: !!(checkout.value.alipay_force_qrcode && normalizeVisibleMethod(requestType) === 'alipay'),
      })
      if (options.openid) payload.openid = options.openid
      if (options.wechatResumeToken) payload.wechat_resume_token = options.wechatResumeToken

      const result = await paymentStore.createOrder(payload) as CreateOrderResult & { resume_token?: string }
      const openWindow = (url: string) => {
        const win = window.open(url, 'paymentPopup', getPaymentPopupFeatures())
        if (!win || win.closed) {
          window.location.href = url
        }
      }
      const visibleMethod = normalizeVisibleMethod(requestType) || requestType
      const stripeMethod = visibleMethod === 'stripe'
        ? ''
        : visibleMethod === 'wxpay' ? 'wechat_pay' : 'alipay'
      const stripeRouteUrl = result.client_secret && visibleMethod !== 'airwallex'
        ? router.resolve({
          path: '/payment/stripe',
          query: {
            order_id: String(result.order_id),
            client_secret: result.client_secret,
            method: stripeMethod || undefined,
            resume_token: result.resume_token || undefined,
          },
        }).href
        : ''
      const airwallexRouteUrl = result.client_secret && result.intent_id
        ? router.resolve({
          path: '/payment/airwallex',
          query: {
            order_id: String(result.order_id),
            out_trade_no: result.out_trade_no || undefined,
            resume_token: result.resume_token || undefined,
          },
        }).href
        : ''
      const decision = decidePaymentLaunch(result, {
        visibleMethod,
        orderType: 'balance',
        isMobile: isMobileDevice(),
        isWechatBrowser: typeof window !== 'undefined' && /MicroMessenger/i.test(window.navigator.userAgent),
        forceQRCode: !!(checkout.value.alipay_force_qrcode && visibleMethod === 'alipay'),
        stripePopupUrl: stripeRouteUrl,
        stripeRouteUrl,
        airwallexRouteUrl,
      })

      if (decision.kind === 'wechat_oauth' && decision.oauth?.authorize_url) {
        window.location.href = buildWechatOAuthAuthorizeUrl(decision.oauth.authorize_url, {
          paymentType: visibleMethod,
          orderAmount,
        })
        return
      }
      if (decision.kind === 'unhandled') {
        applyScenarioError({ reason: 'UNHANDLED_PAYMENT_SCENARIO' }, visibleMethod)
        return
      }

      paymentState.value = decision.paymentState
      paymentPhase.value = 'paying'
      persistRecoverySnapshot(decision.recovery)

      if (decision.kind === 'stripe_popup') {
        openWindow(decision.paymentState.payUrl)
        return
      }
      if (decision.kind === 'stripe_route') {
        window.location.href = decision.paymentState.payUrl
        return
      }
      if (decision.kind === 'airwallex_route') {
        window.location.href = decision.paymentState.payUrl
        return
      }
      if (decision.kind === 'wechat_jsapi' && decision.jsapi) {
        try {
          const jsapiResult = await invokeWechatJsapiPayment(decision.jsapi as Record<string, unknown>)
          const errMsg = String(jsapiResult.err_msg || '').toLowerCase()
          if (errMsg.includes('cancel')) {
            appStore.showInfo(t('payment.qr.cancelled'))
            resetPayment()
          } else if (errMsg && !errMsg.includes('ok')) {
            resetPayment()
            const fallbackApplied = await attemptMobileQrFallback(
              { reason: 'WECHAT_JSAPI_FAILED', message: errMsg },
              { orderAmount, paymentType: visibleMethod, attempted: options.mobileQrFallbackAttempted === true },
            )
            if (!fallbackApplied) {
              applyScenarioError({ reason: 'WECHAT_JSAPI_FAILED', message: errMsg }, visibleMethod)
            }
          } else {
            const resultState = { ...decision.paymentState }
            resetPayment()
            await redirectToPaymentResult(resultState)
          }
        } catch (err: unknown) {
          resetPayment()
          const fallbackApplied = await attemptMobileQrFallback(err, {
            orderAmount, paymentType: visibleMethod, attempted: options.mobileQrFallbackAttempted === true,
          })
          if (!fallbackApplied) throw err
        }
        return
      }
      if (decision.kind === 'redirect_waiting' && decision.paymentState.payUrl) {
        if (isMobileDevice()) {
          window.location.href = decision.paymentState.payUrl
          return
        }
        openWindow(decision.paymentState.payUrl)
      }
    } catch (err: unknown) {
      const apiErr = err as Record<string, unknown>
      if (apiErr.reason === 'TOO_MANY_PENDING') {
        const metadata = apiErr.metadata as Record<string, unknown> | undefined
        errorMessage.value = t('payment.errors.tooManyPending', { max: metadata?.max || '' })
        errorHintMessage.value = ''
      } else if (apiErr.reason === 'CANCEL_RATE_LIMITED') {
        errorMessage.value = t('payment.errors.cancelRateLimited')
        errorHintMessage.value = ''
      } else if (await attemptMobileQrFallback(err, {
        orderAmount, paymentType: requestType, attempted: options.mobileQrFallbackAttempted === true,
      })) {
        return
      } else {
        const handled = applyScenarioError(
          err,
          normalizeVisibleMethod(options.paymentType || selectedMethod.value) || selectedMethod.value,
        )
        if (handled) return
        errorMessage.value = extractI18nErrorMessage(err, t, 'payment.errors', extractApiErrorMessage(err, t('payment.result.failed')))
        errorHintMessage.value = ''
      }
      appStore.showError(buildPaymentErrorToastMessage(errorMessage.value, errorHintMessage.value))
    } finally {
      submitting.value = false
    }
  }

  async function submitRecharge() {
    if (!canSubmit.value || submitting.value) return
    await createOrder(validAmount.value)
  }

  function onPaymentDone() {
    resetPayment()
  }
  function onPaymentSuccess(refresh?: () => void) {
    removeRecoverySnapshot()
    refresh?.()
  }
  function onPaymentSettled() {
    removeRecoverySnapshot()
  }

  async function init() {
    try {
      const res = await paymentAPI.getCheckoutInfo()
      checkout.value = res.data
      if (enabledMethods.value.length) {
        const order: readonly string[] = METHOD_ORDER
        const sorted = [...enabledMethods.value].sort((a, b) => {
          const ai = order.indexOf(a)
          const bi = order.indexOf(b)
          return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
        })
        selectedMethod.value = sorted[0]
      }
      // Restore an in-flight payment (e.g. user reloaded while a QR/redirect was open).
      if (typeof window !== 'undefined') {
        const restored = readPaymentRecoverySnapshot(
          window.localStorage.getItem(PAYMENT_RECOVERY_STORAGE_KEY),
          {},
        )
        if (restored && restored.orderType === 'balance') {
          paymentState.value = restored
          paymentPhase.value = 'paying'
          const restoredMethod = normalizeVisibleMethod(restored.paymentType)
          if (restoredMethod) selectedMethod.value = restoredMethod
        }
      }
    } catch (err: unknown) {
      appStore.showError(extractI18nErrorMessage(err, t, 'payment.errors', t('common.error')))
    } finally {
      loading.value = false
    }
  }

  return {
    // state
    loading,
    submitting,
    amount,
    selectedMethod,
    paymentPhase,
    paymentState,
    // checkout-derived
    checkout,
    enabledMethods,
    balanceDisabled,
    methodOptions,
    globalMinAmount,
    globalMaxAmount,
    balanceRechargeMultiplier,
    creditedAmount,
    feeRate,
    feeAmount,
    totalAmount,
    validAmount,
    amountError,
    canSubmit,
    selectedCurrency,
    formatAmount,
    // actions
    init,
    submitRecharge,
    resetPayment,
    onPaymentDone,
    onPaymentSuccess,
    onPaymentSettled,
  }
}
