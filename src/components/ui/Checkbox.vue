<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'

interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label class="flex items-center gap-2 cursor-pointer">
    <CheckboxRoot
      :checked="modelValue"
      :disabled="disabled"
      @update:checked="emit('update:modelValue', $event)"
      class="
        w-4 h-4 rounded border border-dark-border bg-dark-card
        data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600
        focus:ring-2 focus:ring-blue-500 focus:outline-none
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
      "
    >
      <CheckboxIndicator class="flex items-center justify-center text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-3 h-3"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </CheckboxIndicator>
    </CheckboxRoot>
    <span v-if="label" class="text-sm font-medium text-gray-200">
      {{ label }}
    </span>
    <slot />
  </label>
</template>
