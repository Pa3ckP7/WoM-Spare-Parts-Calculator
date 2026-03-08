// Core equipment data structure
export interface EquipmentQuality {
  quality: number
  minecoins: number
  gems: number
  metal: number
  disassembly: number
}

// Part type selection
export type PartType = 'rare' | 'unique' | 'legendary' | 'perfect'

export interface PartTypeSelection {
  type: PartType
  seriesId?: string // Required for perfect parts (R/S/T/A/O/Q/E/G/J/D)
}

// Gem and metal price maps for non-Perfect parts
export interface GemPrices {
  ruby: number
  sapphire: number
  topaz: number
  amethyst: number
  onyx: number
  aquamarine: number
  emerald: number
  garnet: number
  jade: number
  diamond: number
}

export interface MetalPrices {
  copper: number
  silver: number
  gold: number
  nickel: number
  steel: number
  iron: number
  palladium: number
  titanium: number
  zinc: number
  platinum: number
}

// User-entered market prices
export interface UserPrices {
  partPrice: number // Price for the currently selected part type
  budgetCap?: number // Optional max total cost filter
  workshopEnabled?: boolean // Whether workshop crafting is enabled

  // Gem and metal prices (shared across all part types)
  gemPrices?: GemPrices
  metalPrices?: MetalPrices
}

// User-entered market offer
export interface MarketOffer {
  id: string
  quality: number
  price: number
}

// Calculated workshop option
export interface WorkshopOption {
  quality: number
  minecoinsCost: number
  gemsCost: number
  metalCost: number
  totalCost: number
  disassembly: number
  costPerPart: number
  savingsPerPart: number
}

// Calculated market offer option
export interface MarketOfferOption {
  id: string
  quality: number
  price: number
  disassembly: number
  costPerPart: number
  savingsPerPart: number
}

// Unified option type for ranking
export interface RankedOption {
  type: 'workshop' | 'market-offer' | 'direct-purchase'
  quality: number | null
  costPerPart: number
  totalCost: number
  partsGained: number
  savingsPerPart: number
  details: WorkshopOption | MarketOfferOption | null
}

// Break-even price entry
export interface BreakEvenEntry {
  quality: number
  disassembly: number
  maxPrice: number
}
