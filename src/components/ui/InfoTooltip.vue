<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  text: string
}

defineProps<Props>()

const isVisible = ref(false)
</script>

<template>
  <div class="relative inline-block">
    <button
      type="button"
      @mouseenter="isVisible = true"
      @mouseleave="isVisible = false"
      @focus="isVisible = true"
      @blur="isVisible = false"
      class="
        inline-flex items-center justify-center
        w-4 h-4 rounded-full
        bg-gray-700 hover:bg-gray-600
        text-gray-400 hover:text-gray-300
        text-xs font-bold
        transition-colors
        cursor-help
      "
      aria-label="More information"
    >
      ?
    </button>
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isVisible"
        class="
          absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
          w-64 px-3 py-2
          bg-gray-800 border border-gray-700 rounded-lg shadow-xl
          text-xs text-gray-300 leading-relaxed
          pointer-events-none
        "
      >
        {{ text }}
        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
          <div class="border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </Transition>
  </div>
</template>
