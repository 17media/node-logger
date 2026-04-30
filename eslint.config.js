import js from '@eslint/js';
import babelParser from '@babel/eslint-parser';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      parser: babelParser,
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: true,
          configFile: true,
        },
      },
    },
    rules: {
      // You can add your custom rules override here
    },
  },
  {
    ignores: [
      'lib/**',
      'node_modules/**',
      'coverage/**',
    ],
  },
];
