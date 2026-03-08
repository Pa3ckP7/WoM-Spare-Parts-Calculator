<script setup lang="ts">
interface Props {
  title?: string
  padding?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: true,
})
</script>

<template>
  <div class="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
    <div v-if="title" class="px-4 py-3 border-b border-dark-border">
      <h3 class="text-lg font-semibold text-gray-100">{{ title }}</h3>
    </div>
    <div :class="{ 'p-4': padding }">
      <slot />
    </div>
  </div>
</template>
