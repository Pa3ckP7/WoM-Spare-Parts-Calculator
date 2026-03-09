<script setup lang="ts">
import PartTypeSelector from '@/components/calculator/PartTypeSelector.vue'
import PriceInputPanel from '@/components/calculator/PriceInputPanel.vue'
import MarketOfferInput from '@/components/calculator/MarketOfferInput.vue'
import ResultsPanel from '@/components/calculator/ResultsPanel.vue'
import Button from '@/components/ui/Button.vue'
import { useCalculator } from '@/composables/useCalculator'

const {
  currentStep,
  partTypeSelection,
  prices,
  partType,
  seriesId,
  filteredEquipment,
  marketOffers,
  allOptions,
  addMarketOffer,
  removeMarketOffer,
  handleClearData,
  goToStep,
  nextStep,
  prevStep,
  lastSaved,
} = useCalculator()
</script>

<template>
  <div class="min-h-screen bg-dark-bg text-gray-100">
    <!-- Header -->
    <header class="bg-dark-card border-b border-dark-border">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Spare Parts Calculator</h1>
          <p class="text-sm text-gray-400 mt-1">Find the best way to acquire spare parts</p>
        </div>
        <div class="flex items-center gap-4">
          <span v-if="lastSaved" class="text-xs text-gray-400">
            Last saved: {{ Math.round((Date.now() - lastSaved.getTime()) / 1000) }}s ago
          </span>
          <Button variant="secondary" size="sm" @click="handleClearData">
            Clear Data
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Step Indicator -->
      <div class="max-w-4xl mx-auto mb-8">
        <div class="flex items-center justify-center gap-2">
          <!-- Step 1: Part Type -->
          <div class="flex items-center">
            <button
              @click="goToStep(1)"
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer hover:ring-2 hover:ring-blue-400"
              :class="currentStep >= 1 ? 'bg-blue-600' : 'bg-dark-border text-gray-500'"
            >
              1
            </button>
            <span class="ml-2 text-sm font-medium" :class="currentStep >= 1 ? 'text-gray-300' : 'text-gray-500'">
              Part Type
            </span>
          </div>
          <div class="w-12 h-0.5" :class="currentStep >= 2 ? 'bg-blue-600' : 'bg-dark-border'" />

          <!-- Step 2: Prices -->
          <div class="flex items-center">
            <button
              @click="partType && goToStep(2)"
              :disabled="!partType"
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              :class="[
                currentStep >= 2 ? 'bg-blue-600' : 'bg-dark-border text-gray-500',
                partType ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : 'cursor-not-allowed opacity-50'
              ]"
            >
              2
            </button>
            <span class="ml-2 text-sm font-medium" :class="currentStep >= 2 ? 'text-gray-300' : 'text-gray-500'">
              Prices
            </span>
          </div>
          <div class="w-12 h-0.5" :class="currentStep >= 3 ? 'bg-blue-600' : 'bg-dark-border'" />

          <!-- Step 3: Market Offers -->
          <div class="flex items-center">
            <button
              @click="partType && prices.partPrice > 0 && goToStep(3)"
              :disabled="!partType || prices.partPrice <= 0"
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              :class="[
                currentStep >= 3 ? 'bg-blue-600' : 'bg-dark-border text-gray-500',
                partType && prices.partPrice > 0 ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : 'cursor-not-allowed opacity-50'
              ]"
            >
              3
            </button>
            <span class="ml-2 text-sm font-medium" :class="currentStep >= 3 ? 'text-gray-300' : 'text-gray-500'">
              Market
            </span>
          </div>
          <div class="w-12 h-0.5" :class="currentStep >= 4 ? 'bg-blue-600' : 'bg-dark-border'" />

          <!-- Step 4: Results -->
          <div class="flex items-center">
            <button
              @click="partType && prices.partPrice > 0 && goToStep(4)"
              :disabled="!partType || prices.partPrice <= 0"
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              :class="[
                currentStep >= 4 ? 'bg-blue-600' : 'bg-dark-border text-gray-500',
                partType && prices.partPrice > 0 ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : 'cursor-not-allowed opacity-50'
              ]"
            >
              4
            </button>
            <span
              class="ml-2 text-sm font-medium"
              :class="currentStep >= 4 ? 'text-gray-300' : 'text-gray-500'"
            >
              Results
            </span>
          </div>
        </div>
      </div>

      <!-- Steps -->
      <div class="space-y-6">
        <!-- Step 1: Part Type Selector -->
        <section v-if="currentStep === 1" class="space-y-6">
          <!-- Navigation buttons (top) -->
          <div class="flex justify-end max-w-5xl mx-auto">
            <Button
              :disabled="!partTypeSelection"
              @click="nextStep"
              size="lg"
            >
              Continue
            </Button>
          </div>

          <PartTypeSelector v-model="partTypeSelection" />

          <!-- Navigation buttons (bottom) -->
          <div class="flex justify-end mt-6 max-w-5xl mx-auto">
            <Button
              :disabled="!partTypeSelection"
              @click="nextStep"
              size="lg"
            >
              Continue
            </Button>
          </div>
        </section>

        <!-- Step 2: Price Inputs -->
        <section v-if="currentStep === 2" class="space-y-6">
          <!-- Navigation buttons (top) -->
          <div class="flex justify-between max-w-4xl mx-auto">
            <Button variant="secondary" @click="prevStep">
              Back
            </Button>
            <Button
              :disabled="!prices.partPrice || prices.partPrice <= 0"
              @click="nextStep"
              size="lg"
            >
              Continue
            </Button>
          </div>

          <PriceInputPanel
            :part-type="partType!"
            :series-id="seriesId"
            :prices="prices"
            @update:prices="prices = $event"
          />

          <!-- Navigation buttons (bottom) -->
          <div class="flex justify-between mt-6 max-w-4xl mx-auto">
            <Button variant="secondary" @click="prevStep">
              Back
            </Button>
            <Button
              :disabled="!prices.partPrice || prices.partPrice <= 0"
              @click="nextStep"
              size="lg"
            >
              Continue
            </Button>
          </div>
        </section>

        <!-- Step 3: Market Offers -->
        <section v-if="currentStep === 3" class="space-y-6">
          <!-- Navigation buttons (top) -->
          <div class="flex justify-between max-w-6xl mx-auto">
            <Button variant="secondary" @click="prevStep">
              Back
            </Button>
            <Button
              @click="nextStep"
              size="lg"
            >
              Continue to Results
            </Button>
          </div>

          <MarketOfferInput
            :part-type="partType!"
            :series-id="seriesId"
            :part-price="prices.partPrice"
            :filtered-equipment="filteredEquipment"
            :market-offers="marketOffers"
            @add-offer="addMarketOffer"
            @remove-offer="removeMarketOffer"
          />
          <div class="flex justify-between mt-6 max-w-6xl mx-auto">
            <Button variant="secondary" @click="prevStep">
              Back
            </Button>
            <Button
              @click="nextStep"
              size="lg"
            >
              Continue to Results
            </Button>
          </div>
        </section>

        <!-- Step 4: Results -->
        <section v-if="currentStep === 4" class="space-y-6">
          <!-- Navigation buttons (top) -->
          <div class="flex justify-start max-w-6xl mx-auto">
            <Button variant="secondary" @click="prevStep">
              Back
            </Button>
          </div>

          <ResultsPanel
            :options="allOptions"
            :part-price="prices.partPrice"
            :budget-cap="prices.budgetCap"
            :workshop-enabled="prices.workshopEnabled"
            @update:budget-cap="prices.budgetCap = $event"
          />

          <!-- Navigation buttons (bottom) -->
          <div class="flex justify-start mt-6 max-w-6xl mx-auto">
            <Button variant="secondary" @click="prevStep">
              Back
            </Button>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-16 py-6 border-t border-dark-border text-center text-sm text-gray-400">
      <p>Minesweeper.online Spare Parts Calculator</p>
      <p class="mt-1">Built with Vue 3 + TypeScript + Tailwind CSS</p>
    </footer>
  </div>
</template>

