<template>
  <div class="ko-tabs">
    <button
      v-for="item in items"
      :key="item.value"
      class="ko-tab"
      :aria-selected="item.value === modelValue"
      @click="$emit('update:modelValue', item.value)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  items: { value: string; label: string }[]
}>()
defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>
