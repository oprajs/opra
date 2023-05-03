import base from './jest.config.base.cjs';

export default {
  ...base,
  // verbose: true,
  coverageReporters: ['lcov', 'text'],
  coverageDirectory: "<rootDir>/coverage/",
  coveragePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '/node_modules/',
    '_support'
  ],
  projects: [
    '<rootDir>/packages/*/jest.config.mjs'
  ]
};
