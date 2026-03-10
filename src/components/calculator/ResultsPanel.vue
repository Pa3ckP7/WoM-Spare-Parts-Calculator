<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { gsap } from 'gsap'
import { watchDebounced } from '@vueuse/core'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import InfoTooltip from '@/components/ui/InfoTooltip.vue'
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
const itemsPerPage = ref(15)
const priceCap = ref<number | undefined>(props.budgetCap)
const isPaginating = ref(false)
const paginationDirection = ref<'forward' | 'backward'>('forward')

// Watch priceCap and emit changes with debounce
watchDebounced(
  priceCap,
  (newValue) => {
    emit('update:budgetCap', newValue)
  },
  { debounce: 500 }
)

// Update local state when prop changes
watch(() => props.budgetCap, (newValue) => {
  priceCap.value = newValue
})

const filteredOptions = computed(() => {
  let results = props.options

  // Filter by workshop toggle (keep market offers even when workshop is hidden)
  if (!showWorkshop.value) {
    results = results.filter(opt => !opt.seriesId) // Only keep market offers
  }

  // Filter by profitability
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

// Calculate minimum height to prevent container shrinking and scroll jumping
const minResultsHeight = computed(() => {
  // Don't enforce min-height on mobile to save space
  // Only a small buffer to prevent layout shift
  return 0
})

function goToPage(page: number) {
  // Capture current scroll position
  const scrollY = window.scrollY

  isPaginating.value = true
  paginationDirection.value = page > currentPage.value ? 'forward' : 'backward'
  currentPage.value = page

  // Restore scroll position after DOM updates
  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY)
  })

  setTimeout(() => {
    isPaginating.value = false
  }, 50)
}

// Reset to page 1 when filters change
watch([showOnlyProfitable, () => props.options], () => {
  currentPage.value = 1
})

// GSAP animation hooks
function onBeforeEnter(el: Element) {
  if (isPaginating.value) {
    gsap.set(el, { opacity: 1, y: 0 })
  } else {
    gsap.set(el, { opacity: 0, y: -10 })
  }
}

function onEnter(el: Element, done: () => void) {
  if (isPaginating.value) {
    done()
    return
  }
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
  if (isPaginating.value) {
    done()
    return
  }
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

function handleRowClick(option: WorkshopCalculation) {
  if (option.link) {
    window.open(option.link, '_blank', 'noopener,noreferrer')
  }
}
</script>


<template>
  <Card title="Results" class="w-full max-w-4xl mx-auto">
    <!-- Filters -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-if="workshopEnabled"
          @click="showWorkshop = !showWorkshop"
          class="
            px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 transition-all duration-200 text-xs sm:text-sm
            hover:border-blue-500 hover:scale-105 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          :class="
            showWorkshop
              ? 'border-blue-500 bg-blue-600/10 text-blue-400 shadow-md'
              : 'border-dark-border bg-dark-card text-gray-400'
          "
        >
          Show workshop
        </button>

        <button
          @click="showOnlyProfitable = !showOnlyProfitable"
          class="
            px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 transition-all duration-200 text-xs sm:text-sm
            hover:border-blue-500 hover:scale-105 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
          :class="
            showOnlyProfitable
              ? 'border-blue-500 bg-blue-600/10 text-blue-400 shadow-md'
              : 'border-dark-border bg-dark-card text-gray-400'
          "
        >
          Only profitable
        </button>
      </div>

      <div class="flex items-center gap-2 flex-1 sm:flex-initial">
        <label class="text-xs sm:text-sm font-medium text-gray-200 whitespace-nowrap">Price cap</label>
        <InfoTooltip text="Filter out options that cost more than this amount. Useful if you have a limited budget." />
        <Input
          v-model="priceCap"
          type="number"
          :min="0"
          placeholder="No limit"
          class="w-full sm:w-40"
        />
      </div>

      <span v-if="hiddenCount > 0" class="text-xs sm:text-sm text-gray-400 sm:ml-auto">
        {{ hiddenCount }} options hidden
      </span>
    </div>

    <!-- Options Grid (styled as table) -->
    <div class="border border-dark-border rounded-md overflow-hidden">
      <div>
        <!-- Header -->
        <div class="grid grid-cols-[0.4fr_0.7fr_0.5fr_0.4fr_0.4fr_0.8fr_0.8fr_0.9fr] bg-dark-hover border-b border-dark-border text-[10px] sm:text-xs md:text-sm">
          <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-left font-semibold text-gray-200">
            <span class="hidden sm:inline">Rank</span>
            <span class="sm:hidden">#</span>
          </div>
          <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-left font-semibold text-gray-200">Source</div>
          <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-center font-semibold text-gray-200">
            <span class="hidden sm:inline">Quality</span>
            <span class="sm:hidden">Qlty</span>
          </div>
          <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-center font-semibold text-gray-200">
            <span class="hidden sm:inline">Series</span>
            <span class="sm:hidden">Ser</span>
          </div>
          <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-right font-semibold text-gray-200">
            <span class="hidden sm:inline">Parts</span>
            <span class="sm:hidden">Pts</span>
          </div>
          <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-right font-semibold text-gray-200">
            <span class="hidden sm:inline">Total Cost</span>
            <span class="sm:hidden">Total</span>
          </div>
          <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-right font-semibold text-gray-200">Cost/Part</div>
          <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-right font-semibold text-gray-200">
            <span class="hidden sm:inline">Savings/Part</span>
            <span class="sm:hidden">Save/P</span>
          </div>
        </div>

        <!-- Data Rows -->
        <TransitionGroup
          tag="div"
          @before-enter="onBeforeEnter"
          @enter="onEnter"
          @leave="onLeave"
          :css="false"
          :style="{ minHeight: `${minResultsHeight}px` }"
        >
          <!-- Empty State -->
          <div v-if="paginatedOptions.length === 0" key="empty-state" class="px-4 py-8 text-center text-gray-400 text-sm">
            No matching offers found
          </div>

          <!-- Data Rows -->
          <div
            v-for="(option, index) in paginatedOptions"
            :key="`${option.seriesId || 'market'}-${option.quality}-${option.totalCost}`"
            :data-index="index"
            class="grid grid-cols-[0.4fr_0.7fr_0.5fr_0.4fr_0.4fr_0.8fr_0.8fr_0.9fr] border-b border-dark-border hover:bg-dark-hover transition-colors text-[10px] sm:text-xs md:text-sm"
            :class="option.link ? 'cursor-pointer' : ''"
            @click="handleRowClick(option)"
          >
            <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-gray-300 font-medium">
              <span class="hidden sm:inline">#</span>{{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </div>
            <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2">
              <span
                class="inline-block px-1 py-0.5 sm:px-1.5 md:px-2 rounded text-[9px] sm:text-[10px] md:text-xs font-medium"
                :class="option.seriesId ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'"
              >
                <span class="hidden sm:inline">{{ option.seriesId ? 'Workshop' : 'Market' }}</span>
                <span class="sm:hidden">{{ option.seriesId ? 'Work' : 'Mrkt' }}</span>
              </span>
            </div>
            <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-center font-semibold text-gray-200">
              {{ option.quality }}%
            </div>
            <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-center text-gray-300 font-medium">
              {{ option.seriesId || '-' }}
            </div>
            <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-right text-gray-300">
              {{ option.disassembly }}
            </div>
            <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-right text-gray-300">
              {{ formatNumber(option.totalCost) }} MC
            </div>
            <div class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-right text-blue-400 font-bold">
              {{ formatNumber(option.costPerPart) }} MC
            </div>
            <div
              class="px-0.5 py-1 sm:px-1 sm:py-1.5 md:px-2 md:py-2 text-right font-medium"
              :class="option.savingsPerPart > 0 ? 'text-green-400' : 'text-red-400'"
            >
              {{ option.savingsPerPart > 0 ? '-' : '+' }}{{ formatNumber(Math.abs(option.savingsPerPart)) }} MC
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 mt-3 sm:mt-4">
        <div class="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredOptions.length) }} of {{ filteredOptions.length }}
        </div>
        <div class="flex items-center gap-1 sm:gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="
              px-2 py-1 sm:px-3 rounded border border-dark-border bg-dark-card text-xs sm:text-sm
              text-gray-200 hover:bg-dark-hover transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Prev
          </button>
          <div class="flex gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              class="
                px-2 py-1 sm:px-3 rounded border transition-colors text-xs sm:text-sm min-w-[28px] sm:min-w-[32px]
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
              px-2 py-1 sm:px-3 rounded border border-dark-border bg-dark-card text-xs sm:text-sm
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

