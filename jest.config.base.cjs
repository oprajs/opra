module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "verbose": true,
  "forceExit": true,
  coveragePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '/node_modules/',
    '_support'
  ],
  coverageReporters: ['lcov', 'text'],
  globals: {
    "ts-jest": {
      "isolatedModules": false,
      "tsconfig": '<rootDir>/test/tsconfig.json'
    }
  },
  moduleNameMapper: {
    '^@opra/(.*)$': ['<rootDir>/../$1/src']
  },
};
