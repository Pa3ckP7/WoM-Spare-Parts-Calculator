<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import { formatNumber, type WorkshopCalculation } from '@/utils/calculations'

interface Props {
  options: WorkshopCalculation[]
  partPrice: number
  budgetCap?: number
  workshopEnabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  workshopEnabled: true,
  loading: false,
})

const emit = defineEmits<{
  'update:budgetCap': [value: number | undefined]
}>()

const showWorkshop = ref(true)
const showOnlyProfitable = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(25)
const priceCap = ref<number | undefined>(props.budgetCap)

// Watch priceCap and emit changes
watch(priceCap, (newValue) => {
  emit('update:budgetCap', newValue)
})

// Update local state when prop changes
watch(() => props.budgetCap, (newValue) => {
  priceCap.value = newValue
})

const filteredOptions = computed(() => {
  let results = props.options

  if (!showWorkshop.value) {
    return []
  }

  if (showOnlyProfitable.value) {
    results = results.filter(opt => opt.totalSavings > 0)
  }

  return results
})

const totalPages = computed(() => Math.ceil(filteredOptions.value.length / itemsPerPage.value))

const paginatedOptions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredOptions.value.slice(start, end)
})

const hiddenCount = computed(() => props.options.length - filteredOptions.value.length)

function goToPage(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Reset to page 1 when filters change
watch([showOnlyProfitable, () => props.options], () => {
  currentPage.value = 1
})
</script>

<template>
  <Card title="Results" class="w-full max-w-6xl mx-auto">
    <!-- Filters -->
    <div class="flex items-center gap-3 mb-4">
      <button
        v-if="workshopEnabled"
        @click="showWorkshop = !showWorkshop"
        class="
          px-4 py-2 rounded-lg border-2 transition-all
          hover:border-blue-500
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
        :class="
          showWorkshop
            ? 'border-blue-500 bg-blue-600/10 text-blue-400'
            : 'border-dark-border bg-dark-card text-gray-400'
        "
      >
        Show workshop
      </button>

      <button
        @click="showOnlyProfitable = !showOnlyProfitable"
        class="
          px-4 py-2 rounded-lg border-2 transition-all
          hover:border-blue-500
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
        :class="
          showOnlyProfitable
            ? 'border-blue-500 bg-blue-600/10 text-blue-400'
            : 'border-dark-border bg-dark-card text-gray-400'
        "
      >
        Only profitable
      </button>

      <span v-if="hiddenCount > 0" class="text-sm text-gray-400 ml-auto">
        {{ hiddenCount }} options hidden
      </span>
    </div>

    <!-- Price Cap -->
    <div class="mb-4 max-w-xs">
      <Input
        v-model="priceCap"
        type="number"
        :min="0"
        label="Price cap (optional)"
        placeholder="No limit"
        hint="Maximum total cost in minecoins"
      />
    </div>

    <!-- Options Table -->
    <div class="border border-dark-border rounded-md overflow-hidden">
      <table class="w-full text-sm">
        <colgroup>
          <col class="w-[70px]">
          <col class="w-[100px]">
          <col class="w-[80px]">
          <col class="w-[70px]">
          <col class="w-[70px]">
          <col class="w-[130px]">
          <col class="w-[130px]">
          <col class="w-[130px]">
        </colgroup>
        <thead class="bg-dark-hover border-b border-dark-border">
          <tr>
            <th class="px-2 py-2 text-left font-semibold text-gray-200">Rank</th>
            <th class="px-2 py-2 text-left font-semibold text-gray-200">Source</th>
            <th class="px-2 py-2 text-center font-semibold text-gray-200">Quality</th>
            <th class="px-2 py-2 text-center font-semibold text-gray-200">Series</th>
            <th class="px-2 py-2 text-right font-semibold text-gray-200">Parts</th>
            <th class="px-2 py-2 text-right font-semibold text-gray-200">Total Cost</th>
            <th class="px-2 py-2 text-right font-semibold text-gray-200">Cost/Part</th>
            <th class="px-2 py-2 text-right font-semibold text-gray-200">Savings/Part</th>
          </tr>
        </thead>
        <tbody>
          <!-- Empty State -->
          <tr v-if="filteredOptions.length === 0">
            <td colspan="8" class="px-4 py-8 text-center text-gray-400">
              No matching offers found
            </td>
          </tr>
          <!-- Data Rows -->
          <tr
            v-for="(option, index) in paginatedOptions"
            :key="`${option.quality}-${option.seriesId || 'market'}-${index}`"
            class="border-b border-dark-border hover:bg-dark-hover transition-colors"
          >
            <td class="px-2 py-2 text-gray-300 font-medium">
              #{{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </td>
            <td class="px-2 py-2">
              <span
                class="inline-block px-2 py-0.5 rounded text-xs font-medium"
                :class="option.seriesId ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'"
              >
                {{ option.seriesId ? 'Workshop' : 'Market' }}
              </span>
            </td>
            <td class="px-2 py-2 text-center font-semibold text-gray-200">
              {{ option.quality }}%
            </td>
            <td class="px-2 py-2 text-center text-gray-300 font-medium">
              {{ option.seriesId || '-' }}
            </td>
            <td class="px-2 py-2 text-right text-gray-300">
              {{ option.disassembly }}
            </td>
            <td class="px-2 py-2 text-right text-gray-300">
              {{ formatNumber(option.totalCost) }}
            </td>
            <td class="px-2 py-2 text-right text-blue-400 font-bold">
              {{ formatNumber(option.costPerPart) }}
            </td>
            <td
              class="px-2 py-2 text-right font-medium"
              :class="option.savingsPerPart > 0 ? 'text-green-400' : 'text-red-400'"
            >
              {{ option.savingsPerPart > 0 ? '-' : '+' }}{{ formatNumber(Math.abs(option.savingsPerPart)) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
        <div class="text-sm text-gray-400">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredOptions.length) }} of {{ filteredOptions.length }} options
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="
              px-3 py-1 rounded border border-dark-border bg-dark-card
              text-gray-200 hover:bg-dark-hover transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Previous
          </button>
          <div class="flex gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              class="
                px-3 py-1 rounded border transition-colors
              "
              :class="
                page === currentPage
                  ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                  : 'border-dark-border bg-dark-card text-gray-200 hover:bg-dark-hover'
              "
            >
              {{ page }}
            </button>
          </div>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="
              px-3 py-1 rounded border border-dark-border bg-dark-card
              text-gray-200 hover:bg-dark-hover transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Next
          </button>
        </div>
      </div>
  </Card>
</template>

