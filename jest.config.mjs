import base from './jest.config.base.cjs';

export default {
  ...base,
  verbose: true,
  testSequencer: '<rootDir>/support/test/jest-customsequencer.cjs',
  projects: ['<rootDir>/packages/*/jest.config.mjs'],
  reporters: ['default'],
  coverageReporters: ['lcov'],
  coverageDirectory: '<rootDir>/reports/',
  coveragePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/test/',
    '/node_modules/',
    '_support',
  ],
};
