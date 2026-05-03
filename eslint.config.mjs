import electronToolkitTs from '@electron-toolkit/eslint-config-ts'
import prettierConfig from '@electron-toolkit/eslint-config-prettier'
import pluginReact from 'eslint-plugin-react'

export default [
  {
    ignores: ['node_modules', 'dist', 'out', 'scripts', 'tailwind.config.js', 'postcss.config.js']
  },
  ...electronToolkitTs.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  prettierConfig,
  {
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  }
]
