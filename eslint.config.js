import globals from 'globals';
import pluginJs from '@eslint/js';
import tsEslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import pluginPrettierRecommend from 'eslint-plugin-prettier/recommended';

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';

const __dirname = dirname(fileURLToPath(import.meta.url));
const gitignorePath = resolve(__dirname, '.gitignore');

export default [
  includeIgnoreFile(gitignorePath),

  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  pluginPrettierRecommend,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,vue}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'prettier/prettier': 'warn',
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/no-unused-vars': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/require-v-for-key': 'warn',
    },
    languageOptions: {
      parserOptions: {
        parser: tsEslint.parser,
      },
    },
  },
];
