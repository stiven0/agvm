// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const eslintConfigPrettier = require('eslint-config-prettier/flat');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      eslintConfigPrettier,
      {
        plugins: {
          'simple-import-sort': simpleImportSort,
        },
        rules: {
          'simple-import-sort/imports': [
            'error',
            {
              groups: [['^\\u0000'], ['^@?(?!baf)\\w'], ['^@baf?\\w'], ['^\\w'], ['^[^.]'], ['^\\.']],
            },
          ],
          'simple-import-sort/exports': 'error',
        },
      },
    ],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
          filter: {
            regex: '^(ts-jest|\\^.*)$',
            match: false,
          },
        },
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['PascalCase'],
        },
        {
          selector: 'property',
          format: null,
          filter: {
            regex: '^(host)$',
            match: false,
          },
        },
      ],
      complexity: 'error',
      'max-len': [
        'error',
        {
          code: 140,
        },
      ],
      'no-new-wrappers': 'error',
      'no-throw-literal': 'error',
      '@typescript-eslint/consistent-type-definitions': 'error',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'no-invalid-this': 'off',
      '@typescript-eslint/no-invalid-this': ['warn'],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {},
  },
);