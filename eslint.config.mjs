// @ts-check

import eslint from '@eslint/js'
import jest from 'eslint-plugin-jest'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['.git/', 'node_modules/', 'dist/', '*.config.*', 'src/generated/'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  jest.configs['flat/recommended'],
  {
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
)
