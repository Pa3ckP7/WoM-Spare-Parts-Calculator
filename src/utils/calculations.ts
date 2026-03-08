import type { EquipmentQuality } from '@/types/calculator'
import type { GemPrices, MetalPrices } from '@/types/calculator'
import { SERIES, buildSeriesPriceMap } from '@/data/series'

/**
 * Represents a workshop crafting option with cost breakdown and profitability analysis
 */
export interface WorkshopCalculation {
  /** Equipment quality level (Q10-Q100) */
  quality: number
  /** Series identifier (R, S, T, etc.) for Perfect parts */
  seriesId?: string
  /** Human-readable series name (Ruby, Sapphire, etc.) */
  seriesName?: string
  /** Cost in minecoins */
  minecoinsCost: number
  /** Cost of gems (quantity × gem price) */
  gemsCost: number
  /** Cost of metal (quantity × metal price) */
  metalCost: number
  /** Total crafting cost (minecoins + gems + metal) */
  totalCost: number
  /** Number of spare parts yielded from disassembly */
  disassembly: number
  /** Cost per spare part (totalCost ÷ disassembly) */
  costPerPart: number
  /** Savings per part compared to direct purchase (partPrice - costPerPart) */
  savingsPerPart: number
  /** Total savings compared to buying parts directly (can be negative) */
  totalSavings: number
  /** Workshop cost as percentage of direct purchase cost */
  percentOfDirect: number
}

/**
 * Calculate workshop cost for a single equipment/series combination
 *
 * @param equipment - Equipment quality data with crafting requirements and disassembly yield
 * @param gemPrice - Current market price for the gem type
 * @param metalPrice - Current market price for the metal type
 * @param partPrice - Current market price for spare parts (used to calculate savings)
 * @param seriesId - Optional series identifier (e.g., 'R' for Ruby)
 * @param seriesName - Optional human-readable series name
 * @returns Complete workshop calculation with cost breakdown and profitability analysis
 */
export function calculateWorkshopCost(
  equipment: EquipmentQuality,
  gemPrice: number,
  metalPrice: number,
  partPrice: number,
  seriesId?: string,
  seriesName?: string
): WorkshopCalculation {
  const minecoinsCost = equipment.minecoins
  const gemsCost = equipment.gems * gemPrice
  const metalCost = equipment.metal * metalPrice
  const totalCost = minecoinsCost + gemsCost + metalCost

  const costPerPart = totalCost / equipment.disassembly
  const directCost = equipment.disassembly * partPrice
  const totalSavings = directCost - totalCost
  const savingsPerPart = partPrice - costPerPart
  const percentOfDirect = (costPerPart / partPrice) * 100

  return {
    quality: equipment.quality,
    seriesId,
    seriesName,
    minecoinsCost,
    gemsCost,
    metalCost,
    totalCost,
    disassembly: equipment.disassembly,
    costPerPart,
    savingsPerPart,
    totalSavings,
    percentOfDirect,
  }
}

/**
 * Calculate all workshop options for non-Perfect parts (across all series)
 *
 * For Rare/Unique/Legendary parts, each equipment quality can be crafted in any of the 10 series,
 * resulting in equipmentList.length × 10 possible options.
 *
 * @param equipmentList - Filtered equipment list matching the part type's quality range
 * @param gemPrices - Market prices for all 10 gem types
 * @param metalPrices - Market prices for all 10 metal types
 * @param partPrice - Current market price for spare parts
 * @returns Array of all possible workshop combinations (typically 100-300 options)
 */
export function calculateAllSeriesOptions(
  equipmentList: EquipmentQuality[],
  gemPrices: GemPrices,
  metalPrices: MetalPrices,
  partPrice: number
): WorkshopCalculation[] {
  const results: WorkshopCalculation[] = []

  // Build map of series IDs to gem/metal prices
  const seriesPriceMap = buildSeriesPriceMap(gemPrices, metalPrices)

  // For each equipment quality, calculate cost for all 10 series
  for (const equipment of equipmentList) {
    for (const series of SERIES) {
      const prices = seriesPriceMap[series.id]
      if (!prices) continue

      const calc = calculateWorkshopCost(
        equipment,
        prices.gem,
        prices.metal,
        partPrice,
        series.id,
        series.name
      )

      results.push(calc)
    }
  }

  return results
}

/**
 * Calculate workshop options for Perfect parts (single series)
 *
 * Perfect parts are series-specific (e.g., Perfect R70 Ruby), so only one series is calculated.
 *
 * @param equipmentList - Filtered equipment list for Perfect quality range (Q70-Q100)
 * @param gemPrice - Market price for the specific gem type (e.g., Ruby price for R series)
 * @param metalPrice - Market price for the specific metal type (e.g., Copper price for R series)
 * @param partPrice - Current market price for the Perfect spare parts
 * @param seriesId - Series identifier (e.g., 'R' for Ruby/Copper)
 * @returns Array of workshop options for the single series (typically 31 options: Q70-Q100)
 */
export function calculateSingleSeriesOptions(
  equipmentList: EquipmentQuality[],
  gemPrice: number,
  metalPrice: number,
  partPrice: number,
  seriesId: string
): WorkshopCalculation[] {
  const series = SERIES.find(s => s.id === seriesId)
  if (!series) return []

  return equipmentList.map(equipment =>
    calculateWorkshopCost(equipment, gemPrice, metalPrice, partPrice, seriesId, series.name)
  )
}

/**
 * Sort workshop calculations by multi-level criteria
 *
 * Sorting priority:
 * 1. Cost per part (ascending) - cheaper parts are better
 * 2. Disassembly yield (descending) - higher yield is better when cost/part is equal
 * 3. Total cost (ascending) - cheaper total when other factors are equal
 *
 * @param options - Array of workshop calculations to sort
 * @returns New sorted array (original is not mutated)
 */
export function sortWorkshopOptions(options: WorkshopCalculation[]): WorkshopCalculation[] {
  return [...options].sort((a, b) => {
    // Primary: cost per part (lower is better)
    if (a.costPerPart !== b.costPerPart) {
      return a.costPerPart - b.costPerPart
    }

    // Secondary: yield/disassembly (higher is better)
    if (a.disassembly !== b.disassembly) {
      return b.disassembly - a.disassembly
    }

    // Tertiary: total price (lower is better)
    return a.totalCost - b.totalCost
  })
}

/**
 * Filter options by budget cap
 *
 * @param options - Array of workshop calculations to filter
 * @param budgetCap - Maximum total cost allowed (optional, undefined/0 means no limit)
 * @returns Filtered array containing only options within budget
 */
export function filterByBudget(
  options: WorkshopCalculation[],
  budgetCap?: number
): WorkshopCalculation[] {
  if (!budgetCap || budgetCap <= 0) return options
  return options.filter(opt => opt.totalCost <= budgetCap)
}

/**
 * Filter to only profitable options (cheaper than direct purchase)
 *
 * @param options - Array of workshop calculations to filter
 * @returns Filtered array containing only options with positive totalSavings
 */
export function filterProfitable(options: WorkshopCalculation[]): WorkshopCalculation[] {
  return options.filter(opt => opt.totalSavings > 0)
}

/**
 * Get value quality color variant based on cost efficiency
 *
 * Thresholds:
 * - < 70%: 'success' (great deal, 30%+ savings)
 * - 70-90%: 'info' (good deal, 10-30% savings)
 * - 90-100%: 'warning' (fair deal, small savings)
 * - >= 100%: 'error' (more expensive than direct purchase)
 *
 * @param percentOfDirect - Workshop cost as percentage of direct purchase cost
 * @returns Badge variant for UI color coding
 */
export function getValueQualityVariant(percentOfDirect: number): 'success' | 'info' | 'warning' | 'error' {
  if (percentOfDirect < 70) return 'success' // Great deal
  if (percentOfDirect < 90) return 'info' // Good deal
  if (percentOfDirect < 100) return 'warning' // Fair deal
  return 'error' // More expensive than direct
}

/**
 * Format number with thousand separators for display
 * Uses space as thousand separator to match in-game formatting
 *
 * @param num - Number to format (will be rounded to nearest integer)
 * @returns Formatted string with space thousand separators (e.g., "1 234 567")
 * @example
 * formatNumber(1234567.89) // "1 234 568"
 * formatNumber(1000) // "1 000"
 */
export function formatNumber(num: number): string {
  const rounded = Math.round(num)
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
