import base from './jest.config.base.cjs';

export default {
  ...base,
  verbose: true,
  coverageDirectory: '<rootDir>/reports/',
  coveragePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '/node_modules/',
    '_support',
  ],
  testSequencer: '<rootDir>/support/test/jest-customsequencer.cjs',
  projects: ['<rootDir>/packages/*/jest.config.mjs'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports',
        outputName: 'jest-junit.xml',
      },
    ],
  ],
  coverageReporters: ['lcov', 'json-summary'],
};
