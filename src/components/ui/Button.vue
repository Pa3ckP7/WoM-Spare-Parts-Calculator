<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="
      inline-flex items-center justify-center rounded-md font-medium
      transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95 hover:shadow-lg
    "
    :class="[
      // Size
      {
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-base': size === 'md',
        'px-6 py-3 text-lg': size === 'lg',
      },
      // Variant
      {
        'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
        'bg-dark-hover text-gray-200 hover:bg-gray-700 focus:ring-gray-500 border border-dark-border': variant === 'secondary',
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
      }
    ]"
  >
    <slot />
  </button>
</template>
