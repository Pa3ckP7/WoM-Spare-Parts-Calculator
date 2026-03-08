import type { EquipmentQuality } from '@/types/calculator'
import equipmentData from './equipment.json'

// Export the equipment data with proper typing
export const EQUIPMENT_DATA: EquipmentQuality[] = equipmentData

// Helper to get equipment by quality level
export function getEquipmentByQuality(quality: number): EquipmentQuality | undefined {
  return EQUIPMENT_DATA.find(eq => eq.quality === quality)
}

// Get all available quality levels
export function getAvailableQualities(): number[] {
  return EQUIPMENT_DATA.map(eq => eq.quality)
}

// Get quality range
export const MIN_QUALITY = 10
export const MAX_QUALITY = 100
