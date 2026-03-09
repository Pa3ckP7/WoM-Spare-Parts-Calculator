<script setup lang="ts">
import { computed, ref } from 'vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import type { PartType, EquipmentQuality } from '@/types/calculator'
import { getQualityRangeForPartType } from '@/data/series'
import { formatNumber } from '@/utils/calculations'

interface Props {
  partType: PartType
  seriesId?: string
  partPrice: number
  equipmentData: EquipmentQuality[]
}

const props = defineProps<Props>()

// Filter for quality search
const searchQuality = ref<string>('')

// Get valid quality range
const qualityRange = computed(() => {
  return getQualityRangeForPartType(props.partType, props.seriesId)
})

// Get equipment data filtered by quality range
const validEquipment = computed(() => {
  const range = qualityRange.value
  return props.equipmentData
    .filter(eq => eq.quality >= range.min && eq.quality <= range.max)
    .sort((a, b) => a.quality - b.quality)
})

// Calculate break-even entries
const breakEvenEntries = computed(() => {
  return validEquipment.value.map(eq => ({
    quality: eq.quality,
    disassembly: eq.disassembly,
    maxPrice: eq.disassembly * props.partPrice,
  }))
})

// Filtered entries based on search
const filteredEntries = computed(() => {
  if (!searchQuality.value) return breakEvenEntries.value

  const search = searchQuality.value.trim()
  return breakEvenEntries.value.filter(entry =>
    entry.quality.toString().includes(search)
  )
})

</script>

<template>
  <Card title="Price Guide">
    <div class="space-y-3">
      <!-- Description -->
      <div class="text-xs text-gray-400 bg-dark-bg/50 border border-dark-border rounded p-2">
        <p class="font-medium text-gray-300">Only add offers below these prices</p>
      </div>

      <!-- Search -->
      <Input
        v-model="searchQuality"
        type="text"
        label="Search"
        placeholder="e.g., 25"
        class="text-sm"
      />

      <!-- Table -->
      <div class="border border-dark-border rounded-md overflow-hidden">
        <div class="overflow-y-auto max-h-[500px]">
          <table class="w-full text-xs">
            <thead class="bg-dark-hover border-b border-dark-border sticky top-0">
              <tr>
                <th class="px-3 py-1.5 text-left font-semibold text-gray-200">Quality</th>
                <th class="px-3 py-1.5 text-right font-semibold text-gray-200">Max Price</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in filteredEntries"
                :key="entry.quality"
                class="border-b border-dark-border hover:bg-dark-hover transition-colors"
              >
                <td class="px-3 py-1.5 font-semibold text-gray-200">
                  {{ entry.quality }}%
                </td>
                <td class="px-3 py-1.5 text-right font-medium text-gray-300">
                  {{ formatNumber(entry.maxPrice) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Stats -->
      <div class="text-xs text-gray-500 text-center">
        {{ filteredEntries.length }} of {{ breakEvenEntries.length }}
      </div>
    </div>
  </Card>
</template>
