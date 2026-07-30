import antfu from '@antfu/eslint-config';
import pluginQuery from '@tanstack/eslint-plugin-query';
import tryCatchFailsafe from 'eslint-plugin-try-catch-failsafe';

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: true,
      jsx: true,
      braceStyle: '1tbs',
      arrowParens: 'always',
    },
    // ignores: ['./src/assets/jce'],
    react: true,
    typescript: true,
    formatters: {
      /**
       * Format CSS, LESS, SCSS files, also the `<style>` blocks in Vue
       * By default uses Prettier
       */
      css: true,
      /**
       * Format HTML files
       * By default uses Prettier
       */
      html: true,
      /**
       * Format Markdown files
       * Supports Prettier and dprint
       * By default uses Prettier
       */
      markdown: 'prettier',
    },
  },
  {
    rules: {
      'no-console': 'off',
    },
  },
  // TanStack Router 路由文件需要同时导出 Route 和组件，关闭该规则
  {
    files: ['src/routes/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // TanStack Query 推荐规则配置
  ...pluginQuery.configs['flat/recommended'],
  // eslint-plugin-try-catch-failsafe 配置
  {
    plugins: {
      'try-catch-failsafe': tryCatchFailsafe,
    },
    rules: {
      'try-catch-failsafe/json-parse': 'error',
    },
  },
);
