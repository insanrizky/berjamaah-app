/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript'
  ],
  rules: {
    'prefer-const': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
}
