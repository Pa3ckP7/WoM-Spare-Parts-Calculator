<script setup lang="ts">
interface Props {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full font-medium"
    :class="[
      // Size
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      // Variant
      {
        'bg-gray-700 text-gray-200': variant === 'default',
        'bg-green-900/50 text-green-300 border border-green-700': variant === 'success',
        'bg-yellow-900/50 text-yellow-300 border border-yellow-700': variant === 'warning',
        'bg-red-900/50 text-red-300 border border-red-700': variant === 'error',
        'bg-blue-900/50 text-blue-300 border border-blue-700': variant === 'info',
      }
    ]"
  >
    <slot />
  </span>
</template>
