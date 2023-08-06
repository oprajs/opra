module.exports = {
  testEnvironment: 'node',
  maxWorkers: '50%',
  moduleFileExtensions: ['ts', 'js', 'mjs', 'cjs'],
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest', {
        tsconfig: '<rootDir>/tsconfig.json',
        // useESM: true
      }]
  },
  transformIgnorePatterns: ['node_modules'],
  // extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^#/(.*)': ['<rootDir>/../../$1'],
    '^@opra/([^/]*)/test$': ['<rootDir>/../$1/test'],
    '^@opra/([^/]*)/test(?:/(.+))$': ['<rootDir>/../$1/test/$2'],
    '^@opra/([^/]*)(?:/(.+))$': ['<rootDir>/../$1/src/$2'],
    '^@opra/([^/]*)$': ['<rootDir>/../$1/src'],
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }

};
