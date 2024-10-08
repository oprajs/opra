import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url)),
);

export default {
  displayName: packageJson.name,

  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/test/_support/setup-jest.ts'],

  moduleNameMapper: {
    '^#/(.*)': ['./$1'],
    '^@opra/([^/]*)/test$': ['<rootDir>/../$1/test'],
    '^@opra/([^/]*)/test(?:/(.+))$': ['<rootDir>/../$1/test/$2'],
    '^@opra/([^/]*)(?:/(.+))$': ['<rootDir>/../$1/src/$2'],
    '^@opra/([^/]*)$': ['<rootDir>/../$1/src'],
    '^customer-mongo/models$': [
      '<rootDir>/../../examples/_lib/customer-mongo/src/models/index',
    ],
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
