<script setup lang="ts">
import { computed } from 'vue'
import { Label } from 'reka-ui'

interface Props {
  modelValue: number | string
  label?: string
  placeholder?: string
  type?: 'text' | 'number'
  min?: number
  disabled?: boolean
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | string]
}>()

// Display empty string for 0 values in number inputs
const displayValue = computed(() => {
  if (props.type === 'number' && (props.modelValue === 0 || props.modelValue === '')) {
    return ''
  }
  return props.modelValue
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (props.type === 'number') {
    const value = target.value === '' ? 0 : Number(target.value)
    emit('update:modelValue', value)
  } else {
    emit('update:modelValue', target.value)
  }
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <Label v-if="label" class="text-sm font-medium text-gray-200">
      {{ label }}
    </Label>
    <input
      :value="displayValue"
      :type="type"
      :placeholder="placeholder"
      :min="min"
      :disabled="disabled"
      @input="handleInput"
      class="
        w-full px-3 py-2 rounded-md
        bg-dark-card border border-dark-border
        text-gray-100 placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        [&::-webkit-inner-spin-button]:appearance-none
        [&::-webkit-outer-spin-button]:appearance-none
      "
      :class="{ 'border-red-500 focus:ring-red-500': error }"
    />
    <p v-if="hint && !error" class="text-xs text-gray-400">
      {{ hint }}
    </p>
    <p v-if="error" class="text-xs text-red-400">
      {{ error }}
    </p>
  </div>
</template>
