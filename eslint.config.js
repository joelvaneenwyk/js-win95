// @ts-check

const globals = require('globals')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const tsEslint = require('typescript-eslint')

const eslintPluginPrettier = require('eslint-plugin-prettier')
// @ts-ignore
const react = require('eslint-plugin-react/configs/recommended')

/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
module.exports = [
  ...tsEslint.configs.recommendedTypeChecked.map((/** @type {any} */ config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'] // We use TS config only for TS files
  })),

  // https://github.com/jsx-eslint/eslint-plugin-react#configuration
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['dist/emulator.*.js', 'dist/index.*.js'],
    settings: {
      react: {
        version: 'detect'
      }
    },
    ...react
  },

  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['dist/**/*.js'],

    // This is required, see the docs
    languageOptions: {
      ecmaVersion: 2022,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        ecmaVersion: 2022,
        project: true,
        tsconfigRootDir: __dirname // or import.meta.dirname for ESM
      },
      globals: { ...globals.browser, ...globals.es2024 }
    },

    // This is needed in order to specify the desired behavior for its rules
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: eslintPluginPrettier
    },

    // After defining the plugin, you can use the rules like this
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/require-await': 'off'
    }
  }
]
