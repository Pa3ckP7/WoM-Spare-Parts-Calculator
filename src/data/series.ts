// Equipment series definitions for Q70-100 Perfect parts
// Each series uses specific gem and metal types

import type { GemPrices, MetalPrices } from '@/types/calculator'

export interface Series {
  id: string
  name: string
  gemType: string
  metalType: string
}

export const SERIES: Series[] = [
  { id: 'R', name: 'Ruby', gemType: 'Ruby', metalType: 'Copper' },
  { id: 'S', name: 'Sapphire', gemType: 'Sapphire', metalType: 'Silver' },
  { id: 'T', name: 'Topaz', gemType: 'Topaz', metalType: 'Gold' },
  { id: 'A', name: 'Amethyst', gemType: 'Amethyst', metalType: 'Nickel' },
  { id: 'O', name: 'Onyx', gemType: 'Onyx', metalType: 'Steel' },
  { id: 'Q', name: 'Aquamarine', gemType: 'Aquamarine', metalType: 'Iron' },
  { id: 'E', name: 'Emerald', gemType: 'Emerald', metalType: 'Palladium' },
  { id: 'G', name: 'Garnet', gemType: 'Garnet', metalType: 'Titanium' },
  { id: 'J', name: 'Jade', gemType: 'Jade', metalType: 'Zinc' },
  { id: 'D', name: 'Diamond', gemType: 'Diamond', metalType: 'Platinum' },
]

// Part types based on quality ranges
export type PartType = 'rare' | 'unique' | 'legendary' | 'perfect'

export interface PartTypeDefinition {
  type: PartType
  label: string
  qualityMin: number
  qualityMax: number
  seriesId?: string // Only for perfect parts
}

// Get quality range for a part type
export function getQualityRangeForPartType(partType: PartType, _seriesId?: string): { min: number; max: number } {
  switch (partType) {
    case 'rare':
      return { min: 10, max: 19 }
    case 'unique':
      return { min: 20, max: 39 }
    case 'legendary':
      return { min: 40, max: 69 }
    case 'perfect':
      return { min: 70, max: 100 }
    default:
      return { min: 10, max: 100 }
  }
}

// Get series by ID
export function getSeriesById(id: string): Series | undefined {
  return SERIES.find(s => s.id === id)
}

// Get all part type options for UI
export function getAllPartTypes(): Array<{ value: string; label: string }> {
  return [
    { value: 'rare', label: 'Rare Parts (Q10-19)' },
    { value: 'unique', label: 'Unique Parts (Q20-39)' },
    { value: 'legendary', label: 'Legendary Parts (Q40-69)' },
    ...SERIES.map(s => ({
      value: `perfect-${s.id}`,
      label: `Perfect ${s.name} Parts (Q70-100)`,
    })),
  ]
}

/**
 * Build a map of series IDs to their corresponding gem and metal prices
 *
 * @param gemPrices - Market prices for all 10 gem types
 * @param metalPrices - Market prices for all 10 metal types
 * @returns Map of series ID to gem/metal price pair
 * @example
 * const priceMap = buildSeriesPriceMap(gemPrices, metalPrices)
 * const rubySeries = priceMap['R'] // { gem: 1000, metal: 500 }
 */
export function buildSeriesPriceMap(
  gemPrices: GemPrices,
  metalPrices: MetalPrices
): Record<string, { gem: number; metal: number }> {
  return {
    R: { gem: gemPrices.ruby, metal: metalPrices.copper },
    S: { gem: gemPrices.sapphire, metal: metalPrices.silver },
    T: { gem: gemPrices.topaz, metal: metalPrices.gold },
    A: { gem: gemPrices.amethyst, metal: metalPrices.nickel },
    O: { gem: gemPrices.onyx, metal: metalPrices.steel },
    Q: { gem: gemPrices.aquamarine, metal: metalPrices.iron },
    E: { gem: gemPrices.emerald, metal: metalPrices.palladium },
    G: { gem: gemPrices.garnet, metal: metalPrices.titanium },
    J: { gem: gemPrices.jade, metal: metalPrices.zinc },
    D: { gem: gemPrices.diamond, metal: metalPrices.platinum },
  }
}
