<template>
  <div class="ko-code">
    <div class="ko-code__bar">
      <span class="ko-code__lang">{{ lang }}</span>
      <button class="ko-code__copy" @click="copy">{{ copied ? 'Copied' : 'Copy' }}</button>
    </div>
    <pre class="ko-code__pre">{{ code }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ lang: string; code: string }>()
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // clipboard may be unavailable; ignore in the demo
  }
}
</script>

<style scoped>
/* Self-contained so the block is styled on any route (the demo pages also
   load these rules globally via kit-components.css — harmless duplication). */
.ko-code {
  background: var(--warm-900);
  color: #f4edea;
  border-radius: var(--radius-md);
  padding: 14px 16px;
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-size: 13px;
  line-height: 1.55;
  overflow-x: auto;
  position: relative;
}
.ko-code__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.ko-code__lang {
  font: var(--weight-medium) var(--text-2xs) var(--font-mono);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--warm-400);
}
.ko-code__copy {
  font: var(--weight-medium) var(--text-2xs) var(--font-sans);
  color: var(--pink-300);
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: var(--radius-sm);
  padding: 4px 9px;
  cursor: pointer;
}
.ko-code__copy:hover {
  background: rgba(255, 255, 255, 0.12);
}
.ko-code__pre {
  margin: 0;
  white-space: pre;
  font-family: inherit;
  font-size: inherit;
}
</style>
