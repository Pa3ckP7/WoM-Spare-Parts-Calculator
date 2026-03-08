<script setup lang="ts">
interface Option {
  value: string
  label: string
}

interface Props {
  modelValue: string
  options: Option[]
  label?: string
  placeholder?: string
  disabled?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select...',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-200">
      {{ label }}
    </label>
    <div class="relative">
      <select
        :value="modelValue"
        :disabled="disabled"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        class="
          w-full px-3 py-2 rounded-md appearance-none
          bg-dark-card border border-dark-border
          text-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors cursor-pointer
        "
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          class="bg-dark-card text-gray-100"
        >
          {{ option.label }}
        </option>
      </select>
      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
    </div>
  </div>
</template>
