import { ref, watch, type Ref } from 'vue'

const STORAGE_KEY = 'wom-calculator-state'

export interface SavedState {
  partType?: string
  partTypeTimestamp?: number // Track when part type was last changed
  partPrices?: Record<string, number> // Keyed by partType (rare, unique, legendary, perfect-R, etc)
  budgetCap?: number
  workshopEnabled?: boolean

  // Gem and metal prices (shared across all part types)
  gemPrices?: {
    ruby?: number
    sapphire?: number
    topaz?: number
    amethyst?: number
    onyx?: number
    aquamarine?: number
    emerald?: number
    garnet?: number
    jade?: number
    diamond?: number
  }
  metalPrices?: {
    copper?: number
    silver?: number
    gold?: number
    nickel?: number
    steel?: number
    iron?: number
    palladium?: number
    titanium?: number
    zinc?: number
    platinum?: number
  }

  // Filter states
  showWorkshop?: boolean
  showOnlyProfitable?: boolean

  // Market offers per part type (expires after 15 minutes)
  partTypeMarketOffers?: Record<string, Array<{
    id: string
    quality: number
    price: number
    timestamp: number
    link?: string
  }>>

  lastSaved?: number
}

export function useLocalStorage() {
  const savedState = ref<SavedState>({})
  const lastSaved = ref<Date | null>(null)

  // Load from localStorage on init
  function loadState(): SavedState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        lastSaved.value = parsed.lastSaved ? new Date(parsed.lastSaved) : null
        return parsed
      }
    } catch (error) {
      console.error('Failed to load saved state:', error)
    }
    return {}
  }

  // Save to localStorage
  function saveState(state: SavedState) {
    try {
      const toSave = {
        ...state,
        lastSaved: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
      lastSaved.value = new Date()
    } catch (error) {
      console.error('Failed to save state:', error)
    }
  }

  // Clear saved state
  function clearState() {
    try {
      localStorage.removeItem(STORAGE_KEY)
      savedState.value = {}
      lastSaved.value = null
    } catch (error) {
      console.error('Failed to clear state:', error)
    }
  }

  // Create a reactive ref that auto-saves
  function createAutoSavedRef<K extends keyof SavedState>(
    key: K,
    defaultValue: SavedState[K],
    debounceMs = 500
  ): Ref<SavedState[K]> {
    const state = loadState()
    const value = ref((state[key] ?? defaultValue) as SavedState[K]) as Ref<SavedState[K]>

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    watch(
      value,
      (newValue) => {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          savedState.value[key] = newValue
          saveState(savedState.value)
        }, debounceMs)
      },
      { deep: true }
    )

    return value
  }

  // Initialize
  savedState.value = loadState()

  return {
    savedState,
    lastSaved,
    loadState,
    saveState,
    clearState,
    createAutoSavedRef,
  }
}
