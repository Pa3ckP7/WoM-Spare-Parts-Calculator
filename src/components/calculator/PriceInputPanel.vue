<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'
import InfoTooltip from '@/components/ui/InfoTooltip.vue'
import { SERIES, type Series } from '@/data/series'
import type { UserPrices, GemPrices, MetalPrices, PartType } from '@/types/calculator'

interface Props {
  partType: PartType
  seriesId?: string
  prices: UserPrices
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:prices': [prices: UserPrices]
}>()

// Initialize from saved state or default to true
const workshopEnabled = ref(props.prices.workshopEnabled ?? true)

const isPerfectType = computed(() => props.partType === 'perfect')

const currentSeries = computed((): Series | undefined => {
  if (isPerfectType.value && props.seriesId) {
    return SERIES.find(s => s.id === props.seriesId)
  }
  return undefined
})

// Label for part price input
const partPriceLabel = computed(() => {
  if (isPerfectType.value && currentSeries.value) {
    return `${currentSeries.value.gemType} Perfect Parts Price`
  }
  return `${props.partType.charAt(0).toUpperCase() + props.partType.slice(1)} Parts Price`
})

// Initialize gem and metal prices
const gemPrices = ref<GemPrices>({
  ruby: 0,
  sapphire: 0,
  topaz: 0,
  amethyst: 0,
  onyx: 0,
  aquamarine: 0,
  emerald: 0,
  garnet: 0,
  jade: 0,
  diamond: 0,
})

const metalPrices = ref<MetalPrices>({
  copper: 0,
  silver: 0,
  gold: 0,
  nickel: 0,
  steel: 0,
  iron: 0,
  palladium: 0,
  titanium: 0,
  zinc: 0,
  platinum: 0,
})

const partPrice = ref(0)

// Map series ID to gem/metal keys
const gemKeyMap: Record<string, keyof GemPrices> = {
  R: 'ruby', S: 'sapphire', T: 'topaz', A: 'amethyst', O: 'onyx',
  Q: 'aquamarine', E: 'emerald', G: 'garnet', J: 'jade', D: 'diamond'
}
const metalKeyMap: Record<string, keyof MetalPrices> = {
  R: 'copper', S: 'silver', T: 'gold', A: 'nickel', O: 'steel',
  Q: 'iron', E: 'palladium', G: 'titanium', J: 'zinc', D: 'platinum'
}

// Computed helpers for Perfect parts to access the specific gem/metal
const currentGemKey = computed(() => currentSeries.value ? gemKeyMap[props.seriesId || ''] : null)
const currentMetalKey = computed(() => currentSeries.value ? metalKeyMap[props.seriesId || ''] : null)

const currentGemPrice = computed({
  get: () => currentGemKey.value ? gemPrices.value[currentGemKey.value] : 0,
  set: (val) => { if (currentGemKey.value) gemPrices.value[currentGemKey.value] = val }
})
const currentMetalPrice = computed({
  get: () => currentMetalKey.value ? metalPrices.value[currentMetalKey.value] : 0,
  set: (val) => { if (currentMetalKey.value) metalPrices.value[currentMetalKey.value] = val }
})

// Flag to prevent reactivity loop
let isUpdatingFromProps = false

// Emit updates (debounced would happen in parent/composable)
function emitUpdate() {
  // Don't emit if we're currently updating from props to avoid infinite loop
  if (isUpdatingFromProps) return

  const prices: UserPrices = {
    partPrice: partPrice.value,
    budgetCap: props.prices.budgetCap, // Pass through budgetCap unchanged
    workshopEnabled: workshopEnabled.value,
    // Always emit gem/metal prices if they exist, regardless of workshopEnabled
    // The calculator will check workshopEnabled to decide whether to use them
    gemPrices: { ...gemPrices.value },
    metalPrices: { ...metalPrices.value },
  }

  emit('update:prices', prices)
}

// Watch for changes
watch([partPrice, workshopEnabled, gemPrices, metalPrices], emitUpdate, { deep: true })

// Initialize from props (but not workshopEnabled or budgetCap - managed elsewhere)
watch(() => props.prices, async (newPrices) => {
  isUpdatingFromProps = true
  partPrice.value = newPrices.partPrice
  // Don't update workshopEnabled from props - it's local state only
  // Don't update budgetCap - it's managed in WorkshopOptions (step 3)
  if (newPrices.gemPrices) gemPrices.value = { ...newPrices.gemPrices }
  if (newPrices.metalPrices) metalPrices.value = { ...newPrices.metalPrices }
  await nextTick()
  isUpdatingFromProps = false
}, { immediate: true })
</script>

<template>
  <Card title="Market Prices" class="w-full max-w-4xl mx-auto">
    <!-- Part Price (always visible) -->
    <div class="space-y-4">
      <Input
        v-model="partPrice"
        type="number"
        :min="0"
        :label="partPriceLabel"
        placeholder="0"
        hint="Price per part in minecoins"
      />

      <div class="border-t border-dark-border my-4" />

      <!-- Workshop Toggle -->
      <label class="flex items-center gap-3 cursor-pointer group">
        <div class="relative">
          <input
            v-model="workshopEnabled"
            type="checkbox"
            class="peer sr-only"
          />
          <div
            class="
              w-5 h-5 rounded border-2 transition-all duration-200
              peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:scale-105
              peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 peer-focus:ring-offset-dark-bg
              border-dark-border bg-dark-card
              flex items-center justify-center
            "
          >
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="scale-0 rotate-180"
              enter-to-class="scale-100 rotate-0"
              leave-active-class="transition-all duration-150"
              leave-from-class="scale-100 rotate-0"
              leave-to-class="scale-0 rotate-180"
            >
              <svg
                v-if="workshopEnabled"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-3.5 h-3.5 text-white"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </Transition>
          </div>
        </div>
        <span class="text-sm font-medium text-gray-200 group-hover:text-gray-100">
          Include workshop crafting
        </span>
        <InfoTooltip text="When enabled, calculates costs for crafting equipment in the workshop and disassembling it for parts. Disable if you only want to track market offers." />
      </label>

      <!-- Workshop Prices (conditional) -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-[2000px]"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 max-h-[2000px]"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="workshopEnabled" class="overflow-hidden">
          <!-- Perfect Parts: Single gem/metal -->
          <div v-if="isPerfectType && currentSeries" class="space-y-4">
          <Input
            v-model="currentGemPrice"
            type="number"
            :min="0"
            :label="`${currentSeries.gemType} Gems`"
            placeholder="0"
            hint="Price per gem in minecoins"
          />
          <Input
            v-model="currentMetalPrice"
            type="number"
            :min="0"
            :label="`${currentSeries.metalType} Metals`"
            placeholder="0"
            hint="Price per metal in minecoins"
          />
        </div>

        <!-- Non-Perfect Parts: All 10 gems/metals -->
        <div v-else-if="!isPerfectType" class="space-y-4">
          <!-- Gem Prices -->
          <div class="border border-dark-border rounded-md p-3 sm:p-4">
            <h3 class="font-medium text-sm sm:text-base text-gray-200 mb-3 sm:mb-4">Gem Prices</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input v-model="gemPrices.ruby" type="number" :min="0" label="Ruby" placeholder="0" />
              <Input v-model="gemPrices.sapphire" type="number" :min="0" label="Sapphire" placeholder="0" />
              <Input v-model="gemPrices.topaz" type="number" :min="0" label="Topaz" placeholder="0" />
              <Input v-model="gemPrices.amethyst" type="number" :min="0" label="Amethyst" placeholder="0" />
              <Input v-model="gemPrices.onyx" type="number" :min="0" label="Onyx" placeholder="0" />
              <Input v-model="gemPrices.aquamarine" type="number" :min="0" label="Aquamarine" placeholder="0" />
              <Input v-model="gemPrices.emerald" type="number" :min="0" label="Emerald" placeholder="0" />
              <Input v-model="gemPrices.garnet" type="number" :min="0" label="Garnet" placeholder="0" />
              <Input v-model="gemPrices.jade" type="number" :min="0" label="Jade" placeholder="0" />
              <Input v-model="gemPrices.diamond" type="number" :min="0" label="Diamond" placeholder="0" />
            </div>
          </div>

          <!-- Metal Prices -->
          <div class="border border-dark-border rounded-md p-3 sm:p-4">
            <h3 class="font-medium text-sm sm:text-base text-gray-200 mb-3 sm:mb-4">Metal Prices</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input v-model="metalPrices.copper" type="number" :min="0" label="Copper" placeholder="0" />
              <Input v-model="metalPrices.silver" type="number" :min="0" label="Silver" placeholder="0" />
              <Input v-model="metalPrices.gold" type="number" :min="0" label="Gold" placeholder="0" />
              <Input v-model="metalPrices.nickel" type="number" :min="0" label="Nickel" placeholder="0" />
              <Input v-model="metalPrices.steel" type="number" :min="0" label="Steel" placeholder="0" />
              <Input v-model="metalPrices.iron" type="number" :min="0" label="Iron" placeholder="0" />
              <Input v-model="metalPrices.palladium" type="number" :min="0" label="Palladium" placeholder="0" />
              <Input v-model="metalPrices.titanium" type="number" :min="0" label="Titanium" placeholder="0" />
              <Input v-model="metalPrices.zinc" type="number" :min="0" label="Zinc" placeholder="0" />
              <Input v-model="metalPrices.platinum" type="number" :min="0" label="Platinum" placeholder="0" />
            </div>
          </div>
        </div>
        </div>
      </Transition>
    </div>
  </Card>
</template>
