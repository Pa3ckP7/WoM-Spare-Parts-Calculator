import { ref, computed, watch } from 'vue'
import { EQUIPMENT_DATA } from '@/data/equipment'
import { getQualityRangeForPartType } from '@/data/series'
import type { UserPrices, PartType, GemPrices, MetalPrices, MarketOffer } from '@/types/calculator'
import {
  calculateAllSeriesOptions,
  calculateSingleSeriesOptions,
  sortWorkshopOptions,
  filterByBudget,
  mergeAndSortOptions,
  type WorkshopCalculation,
} from '@/utils/calculations'
import { useLocalStorage } from '@/composables/useLocalStorage'

/**
 * Main calculator composable that manages part selection, prices, and workshop calculations
 */
export function useCalculator() {
  const { clearState, lastSaved, savedState, saveState, loadState } = useLocalStorage()

  // Load initial state
  const initialState = loadState()

  // Constants
  const OFFER_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes

  // Helper to filter expired offers
  function filterExpiredOffers(offers: MarketOffer[]): MarketOffer[] {
    const now = Date.now()
    return offers.filter(offer => (now - offer.timestamp) < OFFER_EXPIRY_MS)
  }

  // State
  const currentStep = ref(1)
  const partTypeSelection = ref(initialState.partType || '')

  // Load market offers for current part type (and filter expired)
  const initialOffers = initialState.partType && initialState.partTypeMarketOffers?.[initialState.partType]
    ? filterExpiredOffers(initialState.partTypeMarketOffers[initialState.partType])
    : []
  const marketOffers = ref<MarketOffer[]>(initialOffers)

  // Initialize part price from saved prices for current part type
  const initialPartPrice = initialState.partType && initialState.partPrices?.[initialState.partType] || 0

  const prices = ref<UserPrices>({
    partPrice: initialPartPrice,
    budgetCap: initialState.budgetCap,
    workshopEnabled: initialState.workshopEnabled ?? true,
    gemPrices: initialState.gemPrices as GemPrices | undefined,
    metalPrices: initialState.metalPrices as MetalPrices | undefined,
  })

  // Auto-save state changes with debounce
  let saveTimeout: ReturnType<typeof setTimeout> | null = null
  watch([partTypeSelection, prices, marketOffers], () => {
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      // Get existing partPrices or create new object
      const partPrices = savedState.value.partPrices || {}

      // Update the price for current part type
      if (partTypeSelection.value) {
        partPrices[partTypeSelection.value] = prices.value.partPrice
      }

      // Get existing partTypeMarketOffers or create new object
      const partTypeMarketOffers = savedState.value.partTypeMarketOffers || {}

      // Update the offers for current part type (filter expired before saving)
      if (partTypeSelection.value) {
        const nonExpiredOffers = filterExpiredOffers(marketOffers.value)
        if (nonExpiredOffers.length > 0) {
          partTypeMarketOffers[partTypeSelection.value] = nonExpiredOffers
        } else {
          // Remove empty arrays
          delete partTypeMarketOffers[partTypeSelection.value]
        }
      }

      savedState.value = {
        ...savedState.value,
        partType: partTypeSelection.value,
        partPrices,
        budgetCap: prices.value.budgetCap,
        workshopEnabled: prices.value.workshopEnabled,
        gemPrices: prices.value.gemPrices,
        metalPrices: prices.value.metalPrices,
        partTypeMarketOffers,
      }
      saveState(savedState.value)
    }, 500)
  }, { deep: true })

  // Watch for part type changes and load the appropriate price and offers
  watch(partTypeSelection, (newPartType, oldPartType) => {
    if (oldPartType && newPartType === oldPartType) return

    // Load saved price for new part type
    if (newPartType && savedState.value.partPrices?.[newPartType] !== undefined) {
      prices.value.partPrice = savedState.value.partPrices[newPartType]
    } else {
      prices.value.partPrice = 0
    }

    // Load saved market offers for new part type (and filter expired)
    if (newPartType && savedState.value.partTypeMarketOffers?.[newPartType]) {
      const offers = savedState.value.partTypeMarketOffers[newPartType]
      marketOffers.value = filterExpiredOffers(offers)
    } else {
      marketOffers.value = []
    }
  })

  // Parse part type selection
  const partType = computed((): PartType | null => {
    if (!partTypeSelection.value) return null
    if (partTypeSelection.value === 'rare') return 'rare'
    if (partTypeSelection.value === 'unique') return 'unique'
    if (partTypeSelection.value === 'legendary') return 'legendary'
    if (partTypeSelection.value.startsWith('perfect-')) return 'perfect'
    return null
  })

  const seriesId = computed(() => {
    if (partType.value === 'perfect' && partTypeSelection.value) {
      return partTypeSelection.value.replace('perfect-', '')
    }
    return undefined
  })

  // Filter equipment by quality range
  const filteredEquipment = computed(() => {
    if (!partType.value) return []
    const range = getQualityRangeForPartType(partType.value, seriesId.value)
    return EQUIPMENT_DATA.filter(eq => eq.quality >= range.min && eq.quality <= range.max)
  })

  // Calculate workshop options (without market offers)
  const workshopOptions = computed((): WorkshopCalculation[] => {
    if (!partType.value || !prices.value.partPrice) return []

    // Only calculate if workshop is enabled
    if (!prices.value.workshopEnabled) return []

    if (!prices.value.gemPrices || !prices.value.metalPrices) return []

    let options: WorkshopCalculation[]

    if (partType.value === 'perfect' && seriesId.value) {
      // Perfect parts: single series - extract gem/metal from the full price objects
      const gemKeyMap: Record<string, keyof GemPrices> = {
        R: 'ruby', S: 'sapphire', T: 'topaz', A: 'amethyst', O: 'onyx',
        Q: 'aquamarine', E: 'emerald', G: 'garnet', J: 'jade', D: 'diamond'
      }
      const metalKeyMap: Record<string, keyof MetalPrices> = {
        R: 'copper', S: 'silver', T: 'gold', A: 'nickel', O: 'steel',
        Q: 'iron', E: 'palladium', G: 'titanium', J: 'zinc', D: 'platinum'
      }

      const gemKey = gemKeyMap[seriesId.value]
      const metalKey = metalKeyMap[seriesId.value]
      const gemPrice = prices.value.gemPrices[gemKey]
      const metalPrice = prices.value.metalPrices[metalKey]

      if (gemPrice === undefined || metalPrice === undefined) return []

      options = calculateSingleSeriesOptions(
        filteredEquipment.value,
        gemPrice,
        metalPrice,
        prices.value.partPrice,
        seriesId.value
      )
    } else {
      // Non-perfect: all series
      options = calculateAllSeriesOptions(
        filteredEquipment.value,
        prices.value.gemPrices,
        prices.value.metalPrices,
        prices.value.partPrice
      )
    }

    // Filter by budget
    options = filterByBudget(options, prices.value.budgetCap)

    // Sort
    return sortWorkshopOptions(options)
  })

  // All options (workshop + market offers merged and sorted)
  const allOptions = computed((): WorkshopCalculation[] => {
    if (!partType.value || !prices.value.partPrice) return []

    // Merge workshop options with market offers
    const merged = mergeAndSortOptions(
      workshopOptions.value,
      marketOffers.value,
      prices.value.partPrice,
      filteredEquipment.value
    )

    // Filter by budget
    return filterByBudget(merged, prices.value.budgetCap)
  })

  function handleClearData() {
    if (confirm('Clear all saved data? This cannot be undone.')) {
      clearState()
      partTypeSelection.value = ''
      prices.value = { partPrice: 0 }
      marketOffers.value = []
      currentStep.value = 1
    }
  }

  function goToStep(step: number) {
    currentStep.value = step
  }

  function nextStep() {
    if (currentStep.value < 4) {
      currentStep.value++
    }
  }

  function prevStep() {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  function addMarketOffer(offer: MarketOffer) {
    marketOffers.value.push(offer)
  }

  function removeMarketOffer(id: string) {
    marketOffers.value = marketOffers.value.filter(offer => offer.id !== id)
  }

  function clearAllMarketOffers() {
    marketOffers.value = []
  }

  return {
    currentStep,
    partTypeSelection,
    prices,
    partType,
    seriesId,
    filteredEquipment,
    workshopOptions,
    marketOffers,
    allOptions,
    addMarketOffer,
    removeMarketOffer,
    clearAllMarketOffers,
    handleClearData,
    goToStep,
    nextStep,
    prevStep,
    lastSaved,
  }
}
