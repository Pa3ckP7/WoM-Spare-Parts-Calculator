import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    name: 'app/custom-rules',
    rules: {
      // ===== VUE SPECIFIC =====
      // Allow single-word component names for base UI components
      'vue/multi-word-component-names': ['error', {
        ignores: ['Badge', 'Button', 'Card', 'Checkbox', 'Input', 'Select']
      }],

      // ===== C# STYLE WARNINGS =====

      // Warn on explicit any usage (like C# dynamic)
      '@typescript-eslint/no-explicit-any': 'warn',

      // Warn on implicit any (like C# would require explicit dynamic)
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',

      // Note: Can't use @typescript-eslint/no-unnecessary-condition without strictNullChecks
      // Instead we rely on runtime null checks and optional chaining (?.)
      '@typescript-eslint/strict-boolean-expressions': 'off', // Too strict

      // Warn on unused code (like C# compiler warnings CS0168, CS0219)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        },
      ],

      // Console statements (like C# Debug.WriteLine - keep in dev, warn in prod)
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // ===== ERRORS (Severe Issues Only) =====
      // These are logic bugs, not just style/safety issues
      'no-debugger': 'error',
      'no-unreachable': 'error',
    },
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
)
