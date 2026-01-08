import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import unusedImports from 'eslint-plugin-unused-imports'

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'src/generated/**',
      'prisma/migrations/**',
    ],
  },

  js.configs.recommended,

  // Apply type-checked rules only to TypeScript files in src/
  ...tseslint.configs.recommendedTypeChecked.map(config => ({
    ...config,
    files: ['src/**/*.ts'],
  })),

  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // Clean imports
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',

      // Type safety
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',

      // Express async handlers
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],
    },
  },

  // Basic TypeScript rules for config files (without type checking)
  {
    files: ['*.js', '*.ts'],
    extends: [tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
]