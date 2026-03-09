<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import BreakEvenTable from './BreakEvenTable.vue'
import type { MarketOffer, PartType, EquipmentQuality } from '@/types/calculator'
import { getQualityRangeForPartType } from '@/data/series'
import { EQUIPMENT_DATA } from '@/data/equipment'

interface Props {
  partType: PartType
  seriesId?: string
  partPrice: number
  filteredEquipment: EquipmentQuality[]
  marketOffers: MarketOffer[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-offer': [offer: MarketOffer]
  'remove-offer': [id: string]
}>()

// Form state
const quality = ref<number | undefined>(undefined)
const price = ref<number>(0)
const link = ref<string>('')

// Get valid quality range for current part type
const qualityRange = computed(() => {
  return getQualityRangeForPartType(props.partType, props.seriesId)
})

// Check if form is valid
const isValid = computed(() => {
  return quality.value !== undefined && price.value > 0
})

// Get disassembly yield for selected quality
const selectedDisassembly = computed(() => {
  if (!quality.value) return null
  const equipment = EQUIPMENT_DATA.find(eq => eq.quality === quality.value)
  return equipment?.disassembly || null
})

function handleAdd() {
  if (!isValid.value || !quality.value) return

  const offer: MarketOffer = {
    id: `${Date.now()}-${Math.random()}`, // Simple unique ID
    quality: quality.value,
    price: price.value,
    timestamp: Date.now(),
    link: link.value.trim() || undefined,
  }

  emit('add-offer', offer)

  // Reset form
  quality.value = undefined
  price.value = 0
  link.value = ''
}

function handleRemove(id: string) {
  emit('remove-offer', id)
}

function getDisassembly(offerQuality: number): number {
  const equipment = EQUIPMENT_DATA.find(eq => eq.quality === offerQuality)
  return equipment?.disassembly || 0
}

function getTimeRemaining(timestamp: number): string {
  const EXPIRY_MS = 15 * 60 * 1000 // 15 minutes
  const elapsed = Date.now() - timestamp
  const remaining = EXPIRY_MS - elapsed

  if (remaining <= 0) return 'Expired'

  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function isExpiringSoon(timestamp: number): boolean {
  const EXPIRY_MS = 15 * 60 * 1000
  const elapsed = Date.now() - timestamp
  const remaining = EXPIRY_MS - elapsed
  return remaining < 60000 // Less than 1 minute
}

// Force re-render every second to update time remaining
const forceUpdate = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  intervalId = setInterval(() => {
    forceUpdate.value++
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="w-full max-w-6xl mx-auto">
    <div class="flex flex-row gap-6">
      <!-- Left: Break-Even Price Guide -->
      <div class="w-[280px] flex-shrink-0">
        <BreakEvenTable
          :part-type="partType"
          :series-id="seriesId"
          :part-price="partPrice"
          :equipment-data="filteredEquipment"
        />
      </div>

      <!-- Right: Market Offers Input -->
      <div class="flex-1 min-w-0">
        <Card title="Add Market Offers">
        <div class="space-y-6">
      <!-- Add Offer Form -->
      <div class="border border-dark-border rounded-lg p-4 bg-dark-bg/50">
        <h3 class="text-sm font-semibold text-gray-200 mb-4">Add Market Offer</h3>
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              v-model="quality"
              type="number"
              :min="qualityRange.min"
              :max="qualityRange.max"
              label="Quality Level (%)"
              placeholder="0"
              :hint="`Valid range: ${qualityRange.min}-${qualityRange.max}%`"
            />
            <Input
              v-model="price"
              type="number"
              :min="0"
              label="Price"
              placeholder="0"
              hint="Total price in minecoins"
            />
          </div>
          <Input
            v-model="link"
            type="text"
            label="Trade Link (optional)"
            placeholder="https://minesweeper.online/trade/4095913"
            hint="Optional link to the trade offer"
          />
        </div>

        <!-- Disassembly Preview -->
        <div v-if="selectedDisassembly" class="mt-3 text-sm text-gray-400">
          Will yield <span class="text-blue-400 font-medium">{{ selectedDisassembly }} parts</span> when disassembled
        </div>

        <!-- Add Button -->
        <div class="mt-4">
          <Button
            :disabled="!isValid"
            @click="handleAdd"
            class="w-full md:w-auto"
          >
            Add Offer
          </Button>
        </div>
      </div>

      <!-- Offers List -->
      <div v-if="marketOffers.length > 0" class="space-y-3" :key="forceUpdate">
        <h3 class="text-sm font-semibold text-gray-200">
          Current Offers ({{ marketOffers.length }})
        </h3>
        <div class="space-y-2">
          <div
            v-for="offer in marketOffers"
            :key="offer.id"
            class="
              flex items-center justify-between
              p-3 rounded-lg border border-dark-border
              bg-dark-card hover:bg-dark-hover transition-colors
            "
          >
            <div class="flex items-center gap-3 flex-1">
              <Badge variant="info">Market</Badge>
              <div class="text-sm flex-1">
                <span class="font-semibold text-gray-200">{{ offer.quality }}%</span>
                <span class="text-gray-400 mx-2">•</span>
                <span class="text-gray-300">{{ offer.price.toLocaleString() }} MC</span>
                <span class="text-gray-400 mx-2">•</span>
                <span class="text-blue-400">{{ getDisassembly(offer.quality) }} parts</span>
                <template v-if="offer.link">
                  <span class="text-gray-400 mx-2">•</span>
                  <a
                    :href="offer.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-400 hover:text-blue-300 underline"
                  >
                    View Trade
                  </a>
                </template>
                <span class="text-gray-400 mx-2">•</span>
                <span
                  class="text-xs"
                  :class="isExpiringSoon(offer.timestamp) ? 'text-red-400 font-medium' : 'text-gray-500'"
                >
                  {{ getTimeRemaining(offer.timestamp) }}
                </span>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              @click="handleRemove(offer.id)"
            >
              Remove
            </Button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="
          text-center py-8 px-4
          border border-dashed border-dark-border rounded-lg
          text-gray-400
        "
      >
        <p class="text-sm">No market offers added yet</p>
        <p class="text-xs mt-1">Add offers to compare them with workshop crafting</p>
        </div>
        </div>
      </Card>
      </div>
    </div>
  </div>
</template>
