import panatesEslint from '@panates/eslint-config-ts';
import globals from 'globals';

export default [
  ...panatesEslint.configs.node,
  {
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    ignores: [
      'build/**/*',
      'node_modules/**/*',
      'packages/**/node_modules/**/*',
    ],
  },
];
