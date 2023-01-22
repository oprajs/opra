const base = require('./jest.config.base.cjs');

module.exports = {
  ...base,
  verbose: true,
  coverageReporters: ['lcov', 'text'],
  coverageDirectory: "<rootDir>/coverage/",
  coveragePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '/node_modules/',
    '_support'
  ],
  projects: [
    '<rootDir>/packages/*/jest.config.cjs'
  ],
  globalSetup: '<rootDir>/support/test/jest-setup.cjs'
};
