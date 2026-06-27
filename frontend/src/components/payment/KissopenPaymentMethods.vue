<template>
  <div class="kpm">
    <div class="kpm__label">{{ t('payment.paymentMethod') }}</div>
    <div class="kpm__grid">
      <button
        v-for="m in sorted"
        :key="m.type"
        type="button"
        class="kpm__opt"
        :class="{ 'kpm__opt--on': selected === m.type, 'kpm__opt--off': !m.available }"
        :disabled="!m.available"
        @click="m.available && emit('select', m.type)"
      >
        <img :src="methodIcon(m.type)" :alt="t(`payment.methods.${m.type}`)" class="kpm__icon" />
        <span class="kpm__text">
          <span class="kpm__name">{{ t(`payment.methods.${m.type}`) }}</span>
          <span v-if="m.fee_rate > 0" class="kpm__fee">{{ t('payment.fee') }} {{ m.fee_rate }}%</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { METHOD_ORDER } from './providerConfig'
import alipayIcon from '@/assets/icons/alipay.svg'
import wxpayIcon from '@/assets/icons/wxpay.svg'
import stripeIcon from '@/assets/icons/stripe.svg'
import airwallexIcon from '@/assets/icons/airwallex.svg'
import type { PaymentMethodOption } from './PaymentMethodSelector.vue'

const props = defineProps<{
  methods: PaymentMethodOption[]
  selected: string
}>()
const emit = defineEmits<{ select: [type: string] }>()

const { t } = useI18n()

const METHOD_ICONS: Record<string, string> = {
  alipay: alipayIcon,
  wxpay: wxpayIcon,
  stripe: stripeIcon,
  airwallex: airwallexIcon,
}
function methodIcon(type: string): string {
  if (type.includes('alipay')) return METHOD_ICONS.alipay
  if (type.includes('wxpay')) return METHOD_ICONS.wxpay
  if (type === 'airwallex') return METHOD_ICONS.airwallex
  return METHOD_ICONS[type] || alipayIcon
}

const sorted = computed(() => {
  const order: readonly string[] = METHOD_ORDER
  return [...props.methods].sort((a, b) => {
    const ai = order.indexOf(a.type)
    const bi = order.indexOf(b.type)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })
})
</script>

<style scoped>
.kpm__label {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
  margin-bottom: 8px;
}
.kpm__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.kpm__opt {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 52px;
  padding: 0 12px;
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out),
    background var(--dur-fast) var(--ease-out);
}
.kpm__opt:hover {
  border-color: var(--border-strong);
}
.kpm__opt--on {
  border-color: var(--brand);
  background: var(--coral-50);
  box-shadow: var(--shadow-xs);
}
.kpm__opt--off {
  opacity: 0.45;
  cursor: not-allowed;
}
.kpm__icon {
  width: 24px;
  height: 24px;
  flex: none;
  object-fit: contain;
}
.kpm__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.kpm__name {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.kpm__fee {
  font: var(--weight-medium) var(--text-2xs) var(--font-sans);
  color: var(--text-faint);
}
</style>
