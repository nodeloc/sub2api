/**
 * Local prompt presets — a named (model + system prompt + temperature) config
 * the user can save and reuse in the Playground.
 *
 * Persistence is client-side (localStorage), scoped per user id. This keeps the
 * feature fully fork-local: no backend table / Ent migration to conflict with
 * upstream sync. Upgrade to a server-side store later if cross-device sync is
 * needed.
 */
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores'

export interface Preset {
  id: string
  name: string
  model: string
  system: string
  temperature: number | null
  updatedAt: number
}

const STORAGE_PREFIX = 'kissopen.presets.'

function storageKey(): string {
  let uid = 'anon'
  try {
    const auth = useAuthStore()
    if (auth.user?.id != null) uid = String(auth.user.id)
  } catch {
    /* store not ready (e.g. called outside setup) — fall back to anon */
  }
  return STORAGE_PREFIX + uid
}

function read(): Preset[] {
  try {
    const raw = localStorage.getItem(storageKey())
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(list: Preset[]): void {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(list))
  } catch {
    /* quota / private mode — ignore */
  }
}

/** Read a single preset by id (works outside of a component too). */
export function getPreset(id: string): Preset | null {
  return read().find((p) => p.id === id) || null
}

function genId(): string {
  return 'p_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3)
}

export function usePresets() {
  const presets = ref<Preset[]>(read())

  function reload() {
    presets.value = read()
  }

  function create(data: Partial<Preset>): Preset {
    const p: Preset = {
      id: genId(),
      name: data.name?.trim() || 'untitled',
      model: data.model || '',
      system: data.system || '',
      temperature: data.temperature ?? null,
      updatedAt: Date.now(),
    }
    presets.value = [p, ...presets.value]
    return p
  }

  function update(id: string, data: Partial<Preset>): void {
    presets.value = presets.value.map((p) =>
      p.id === id ? { ...p, ...data, id: p.id, updatedAt: Date.now() } : p
    )
  }

  function remove(id: string): void {
    presets.value = presets.value.filter((p) => p.id !== id)
  }

  // Persist on any change.
  watch(presets, (v) => write(v), { deep: true })

  return { presets, reload, create, update, remove, getPreset }
}
