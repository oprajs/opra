const base = require('../../jest.config.base.cjs');
const packageJson = require('./package.json');

const packageName = packageJson.name;

module.exports = {
  ...base,
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  displayName: packageName,
  setupFilesAfterEnv: ['<rootDir>/test/_support/setup-jest.ts'],
  globals: {
    'ts-jest': undefined
  }
};
