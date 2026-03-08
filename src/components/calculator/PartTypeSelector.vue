<script setup lang="ts">
import { computed } from 'vue'
import Card from '@/components/ui/Card.vue'
import { getAllPartTypes } from '@/data/series'
import { useLocalStorage } from '@/composables/useLocalStorage'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { hasMarketOffers, clearMarketOffers } = useLocalStorage()

const partTypeOptions = computed(() => getAllPartTypes())

const baseTypes = computed(() => partTypeOptions.value.slice(0, 3))
const perfectTypes = computed(() => partTypeOptions.value.slice(3))

function handleChange(value: string) {
  // Check if market offers exist and warn user
  if (hasMarketOffers() && value !== props.modelValue) {
    const offersCount = hasMarketOffers() ? 'your' : '0'
    const confirmed = confirm(
      `Changing part type will clear ${offersCount} market offers. Continue?`
    )

    if (!confirmed) {
      return
    }

    clearMarketOffers()
  }

  emit('update:modelValue', value)
}
</script>

<template>
  <Card title="Select Part Type" class="w-full max-w-5xl mx-auto">
    <div class="space-y-6">
      <!-- Base Part Types -->
      <div>
        <h3 class="text-sm font-semibold text-gray-300 mb-3">Standard Parts</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            v-for="option in baseTypes"
            :key="option.value"
            @click="handleChange(option.value)"
            class="
              p-4 rounded-lg border-2 text-left transition-all
              hover:border-blue-500 hover:bg-dark-hover
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            :class="
              modelValue === option.value
                ? 'border-blue-500 bg-blue-600/10'
                : 'border-dark-border bg-dark-card'
            "
          >
            <div class="font-semibold text-gray-200">{{ option.label.split(' (')[0] }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ option.label.match(/\(([^)]+)\)/)?.[1]?.replace('Q', '') }}%</div>
          </button>
        </div>
      </div>

      <!-- Perfect Part Types -->
      <div>
        <h3 class="text-sm font-semibold text-gray-300 mb-3">Perfect Parts</h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            v-for="option in perfectTypes"
            :key="option.value"
            @click="handleChange(option.value)"
            class="
              p-4 rounded-lg border-2 text-left transition-all
              hover:border-blue-500 hover:bg-dark-hover
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            :class="
              modelValue === option.value
                ? 'border-blue-500 bg-blue-600/10'
                : 'border-dark-border bg-dark-card'
            "
          >
            <div class="font-semibold text-gray-200">{{ option.label.split(' Parts')[0].replace('Perfect ', '') }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ option.label.match(/\(([^)]+)\)/)?.[1]?.replace('Q', '') }}%</div>
          </button>
        </div>
      </div>
    </div>
  </Card>
</template>
