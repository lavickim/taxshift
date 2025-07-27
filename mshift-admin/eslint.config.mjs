import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'lib/generated/**',
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      // 자동 수정 가능한 규칙들
      'prefer-const': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      'react/no-unescaped-entities': 'error',
      // 경고로 설정하여 자동 수정 후에도 빌드가 가능하도록
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
    },
  },
];

export default eslintConfig;
