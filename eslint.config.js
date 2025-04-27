// @ts-check

import eslint from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['.git/', 'node_modules/', 'dist/', 'eslint.config.js', 'src/generated/'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  vitest.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
)
