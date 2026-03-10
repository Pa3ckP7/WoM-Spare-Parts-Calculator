<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import InfoTooltip from '@/components/ui/InfoTooltip.vue'
import BreakEvenTable from './BreakEvenTable.vue'
import type { MarketOffer, PartType, EquipmentQuality } from '@/types/calculator'
import { getQualityRangeForPartType } from '@/data/series'
import { EQUIPMENT_DATA } from '@/data/equipment'
import { formatNumber } from '@/utils/calculations'

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
  'clear-all-offers': []
}>()

// Form state
const quality = ref<number | undefined>(undefined)
const price = ref<number>(0)
const link = ref<string>('')

// Get valid quality range for current part type
const qualityRange = computed(() => {
  return getQualityRangeForPartType(props.partType, props.seriesId)
})

// Validation errors
const qualityError = computed(() => {
  if (quality.value === undefined || quality.value === null) return ''
  if (quality.value < qualityRange.value.min || quality.value > qualityRange.value.max) {
    return `Quality must be between ${qualityRange.value.min}% and ${qualityRange.value.max}%`
  }
  return ''
})

const priceError = computed(() => {
  if (!price.value) return ''
  if (price.value <= 0) {
    return 'Price must be greater than 0'
  }
  return ''
})

const linkError = computed(() => {
  if (!link.value || !link.value.trim()) return ''
  try {
    new URL(link.value)
    return ''
  } catch {
    return 'Please enter a valid URL'
  }
})

// Check if form is valid
const isValid = computed(() => {
  return quality.value !== undefined &&
         price.value > 0 &&
         !qualityError.value &&
         !priceError.value &&
         !linkError.value
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

function handleClearAll() {
  if (confirm('Remove all market offers?')) {
    emit('clear-all-offers')
  }
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

// GSAP animation hooks
function onBeforeEnter(el: Element) {
  gsap.set(el, {
    opacity: 0,
    y: -10
  })
}

function onEnter(el: Element, done: () => void) {
  const index = (el as HTMLElement).dataset.index ? parseInt((el as HTMLElement).dataset.index!) : 0
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.3,
    delay: index * 0.03,
    ease: 'power2.out',
    onComplete: done
  })
}

function onLeave(el: Element, done: () => void) {
  const index = (el as HTMLElement).dataset.index ? parseInt((el as HTMLElement).dataset.index!) : 0
  gsap.to(el, {
    opacity: 0,
    y: 10,
    duration: 0.2,
    delay: index * 0.02,
    ease: 'power2.in',
    onComplete: done
  })
}
</script>

<template>
  <div class="w-full max-w-6xl mx-auto">
    <div class="flex flex-col lg:flex-row gap-4 sm:gap-6">
      <!-- Left: Break-Even Price Guide -->
      <div class="w-full lg:w-[280px] flex-shrink-0">
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
      <div class="border border-dark-border rounded-lg p-3 sm:p-4 bg-dark-bg/50">
        <h3 class="text-xs sm:text-sm font-semibold text-gray-200 mb-3 sm:mb-4">Add Market Offer</h3>
        <div class="space-y-3 sm:space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Input
                v-model="quality"
                type="number"
                :min="qualityRange.min"
                :max="qualityRange.max"
                label="Quality Level (%)"
                placeholder="0"
                :hint="qualityError || `Valid range: ${qualityRange.min}-${qualityRange.max}%`"
                :class="qualityError ? 'border-red-500' : ''"
              />
              <p v-if="qualityError" class="text-red-400 text-xs mt-1">{{ qualityError }}</p>
            </div>
            <div>
              <Input
                v-model="price"
                type="number"
                :min="0"
                label="Price"
                placeholder="0"
                :hint="priceError || 'Total price in minecoins'"
                :class="priceError ? 'border-red-500' : ''"
              />
              <p v-if="priceError" class="text-red-400 text-xs mt-1">{{ priceError }}</p>
            </div>
          </div>
          <div>
            <Input
              v-model="link"
              type="text"
              label="Trade Link (optional)"
              placeholder="https://minesweeper.online/trade/XXXXXXX"
              :hint="linkError || 'Optional link to the trade offer'"
              :class="linkError ? 'border-red-500' : ''"
            />
            <p v-if="linkError" class="text-red-400 text-xs mt-1">{{ linkError }}</p>
          </div>
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
      <div class="space-y-2 sm:space-y-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <h3 class="text-xs sm:text-sm font-semibold text-gray-200">
              Current Offers ({{ marketOffers.length }})
            </h3>
            <InfoTooltip text="Market offers expire after 15 minutes. The timer shows remaining time before automatic removal." />
          </div>
          <Button v-if="marketOffers.length > 0" variant="danger" size="sm" @click="handleClearAll" class="text-xs">
            Clear All
          </Button>
        </div>

        <!-- Offers Grid (styled as table) -->
        <div class="border border-dark-border rounded-md overflow-hidden">
          <!-- Header -->
          <div v-if="marketOffers.length > 0" class="grid grid-cols-[1.2fr_1fr_0.8fr_2fr_1.5fr_1.3fr] bg-dark-hover border-b border-dark-border text-xs sm:text-sm">
            <div class="px-1 py-1 sm:px-2 sm:py-2 text-left font-semibold text-gray-200">Source</div>
            <div class="px-1 py-1 sm:px-2 sm:py-2 text-center font-semibold text-gray-200">Quality</div>
            <div class="px-1 py-1 sm:px-2 sm:py-2 text-right font-semibold text-gray-200">Parts</div>
            <div class="px-1 py-1 sm:px-2 sm:py-2 text-right font-semibold text-gray-200">Price</div>
            <div class="px-1 py-1 sm:px-2 sm:py-2 text-center font-semibold text-gray-200">Link</div>
            <div class="px-1 py-1 sm:px-2 sm:py-2 text-center font-semibold text-gray-200">Action</div>
          </div>

          <!-- Data Rows (Scrollable) -->
          <div class="overflow-y-auto h-[300px]">
            <!-- Empty State -->
            <div v-if="marketOffers.length === 0" class="flex items-center justify-center h-full text-gray-400">
              <div class="text-center">
                <p class="text-sm">No market offers added yet</p>
                <p class="text-xs mt-1">Add offers to compare them with workshop crafting</p>
              </div>
            </div>
              <TransitionGroup
                tag="div"
                @before-enter="onBeforeEnter"
                @enter="onEnter"
                @leave="onLeave"
                :css="false"
              >
              <div
                v-for="(offer, index) in marketOffers"
                :key="offer.id"
                :data-index="index"
                class="grid grid-cols-[1.2fr_1fr_0.8fr_2fr_1.5fr_1.3fr] border-b border-dark-border hover:bg-dark-hover transition-colors text-xs sm:text-sm"
              >
                <div class="px-1 py-1 sm:px-2 sm:py-2">
                  <Badge variant="info" class="text-[10px] sm:text-xs">Market</Badge>
                </div>
                <div class="px-1 py-1 sm:px-2 sm:py-2 text-center font-semibold text-gray-200">
                  {{ offer.quality }}%
                </div>
                <div class="px-1 py-1 sm:px-2 sm:py-2 text-right text-blue-400">
                  {{ getDisassembly(offer.quality) }}
                </div>
                <div class="px-1 py-1 sm:px-2 sm:py-2 text-right text-gray-300">
                  {{ formatNumber(offer.price) }} MC
                </div>
                <div class="px-1 py-1 sm:px-2 sm:py-2 text-center">
                  <a
                    v-if="offer.link"
                    :href="offer.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-400 hover:text-blue-300 underline text-[10px] sm:text-xs"
                  >
                    View
                  </a>
                  <span v-else class="text-gray-500 text-[10px] sm:text-xs">-</span>
                </div>
                <div class="px-1 py-1 sm:px-2 sm:py-2 text-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    @click="handleRemove(offer.id)"
                    class="text-[10px] sm:text-xs px-2 py-1"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>
        </div>
      </Card>
      </div>
    </div>
  </div>
</template>
