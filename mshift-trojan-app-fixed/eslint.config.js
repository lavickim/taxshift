module.exports = [
  {
    ignores: ['node_modules/**', 'build/**', 'dist/**', '.expo/**', 'coverage/**']
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      // Basic rules to avoid blocking startup
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}', '**/__tests__/**'],
    rules: {
      // For TypeScript files, be very lenient
      'no-unused-vars': 'off',
      'no-console': 'off'
    }
  }
];