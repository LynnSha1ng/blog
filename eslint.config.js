import pluginVue from 'eslint-plugin-vue';
import vueTsEslintConfig from '@vue/eslint-config-typescript';
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting';

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';

const __dirname = dirname(fileURLToPath(import.meta.url));
const gitignorePath = resolve(__dirname, '.gitignore');

export default [
  includeIgnoreFile(gitignorePath),

  ...pluginVue.configs['flat/essential'],

  ...vueTsEslintConfig({
    supportedScriptLangs: {
      ts: true,
      tsx: true,
    },
  }),

  prettierSkipFormatting,

  {
    files: ['**/*.{ts,tsx,mts,vue}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  {
    files: ['**/*.vue'],
    rules: {
      'vue/no-unused-vars': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/require-v-for-key': 'warn',
    },
  },
];
