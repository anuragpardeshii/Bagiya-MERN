import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '.claude/**',
      'extension/focus-policy.js',
    ],
  },
  {
    files: ['extension/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        chrome: 'readonly',
        importScripts: 'readonly',
      },
    },
    rules: js.configs.recommended.rules,
  },
  {
    files: [
      'backend/**/*.js',
      'e2e/**/*.js',
      'extension-tests/**/*.js',
      'playwright.extension.config.js',
      'playwright.config.js',
      'scripts/**/*.cjs',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        chrome: 'readonly',
        check: 'readonly',
      },
      sourceType: 'commonjs',
    },
    rules: js.configs.recommended.rules,
  },
  {
    files: ['frontend/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, 'react-hooks': hooks },
    settings: { react: { version: '18.3' } },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...hooks.configs.recommended.rules,
      'react/prop-types': 'off',
    },
  },
];
