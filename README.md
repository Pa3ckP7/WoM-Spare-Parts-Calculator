# Spare Parts Calculator

A web application for calculating the most cost-effective way to obtain spare parts in [Minesweeper Online](https://minesweeper.online) through equipment disassembly or market purchases.

## Features

- **4-Step Wizard Flow**
  - Part type selection (Rare, Unique, Legendary, or Perfect parts by series)
  - Market price input (parts, gems, metals) with optional workshop crafting
  - Market offer tracking with quality, price, and optional trade links
  - Comprehensive results comparison with sorting and filtering

- **Smart Calculations**
  - Compares workshop crafting costs vs market purchases
  - Calculates cost per part and savings
  - Shows disassembly yields and break-even prices
  - Filters by profitability and budget constraints

- **Data Persistence**
  - Per-part-type price and offer storage
  - Auto-save with 500ms debounce
  - Market offers expire after 15 minutes
  - Local storage with state recovery

- **Modern UX**
  - Smooth GSAP animations with staggered effects
  - Responsive layout with Tailwind CSS
  - Scrollable lists with fixed heights
  - Real-time filtering and pagination (15 items/page)

## Tech Stack

- **Vue 3** - Composition API with `<script setup>`
- **TypeScript** - Full type safety
- **Vite** - Fast build tooling
- **Tailwind CSS v4** - Utility-first styling
- **GSAP** - Professional animations
- **VueUse** - Composition utilities (debouncing, etc.)
- **pnpm** - Fast, efficient package manager

## Installation

```sh
pnpm install
```

## Development

```sh
pnpm dev
```

## Build

```sh
pnpm build
```

## Code Quality

```sh
# Type checking
pnpm type-check

# Linting
pnpm lint
```

## How It Works

1. **Select Part Type** - Choose the type of parts you need (Rare, Unique, Legendary, or Perfect by series)

2. **Enter Prices** - Input current market prices for parts, gems, and metals. Toggle workshop crafting on/off.

3. **Add Market Offers** - Track equipment offers from the market with quality, price, and optional trade links. Offers expire after 15 minutes.

4. **View Results** - See all options sorted by cost per part, with savings calculations. Filter by profitability, workshop/market source, and price cap.

## Features in Detail

### Break-Even Price Guide
Shows the maximum price you should pay for each equipment quality level based on current part prices and disassembly yields.

### Market Offer Tracking
- Add offers with quality and price
- Optional trade links for easy access
- Automatic expiration after 15 minutes
- Per-part-type storage
- Scrollable list with animations

### Results Analysis
- Combined workshop + market options
- Sorted by cost efficiency
- Filter by profitability
- Budget cap filtering
- Pagination with 15 items per page
- Smooth animations for filtering/pagination

## Data Persistence

All data is saved to browser local storage:
- Part type selection
- Prices (per part type)
- Workshop enabled/disabled
- Gem and metal prices
- Market offers (per part type, with expiration)
- Budget cap preference

Data auto-saves 500ms after changes.

## Browser Support

Modern browsers with ES2015+ support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Development Setup

### Recommended IDE
[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### Browser DevTools
- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) (Chrome)
- [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/) (Firefox)

## Contributing

This is a community project for [Minesweeper Online](https://minesweeper.online) players. Contributions welcome!

## License

MIT

## Credits

Built with Vue 3, TypeScript, Tailwind CSS, and GSAP.
Made by the community, for the community.
