module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
  ],
  // coverageDirectory: '<rootDir>/coverage/',
  coverageReporters: ['lcov', 'text'],
  globals: {
    "ts-jest": {
      "isolatedModules": false,
      "tsconfig": '<rootDir>/test/tsconfig.json'
    }
  }
};
