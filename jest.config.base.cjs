module.exports = {
  testEnvironment: 'node',
  maxWorkers: '50%',
  moduleFileExtensions: ['ts', 'js', 'mjs', 'cjs'],
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/test/tsconfig.json',
        // useESM: true
      },
    ],
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
    '^customer-model$': ['<rootDir>/../../examples/_lib/customer-model'],
    '^customer-mongo$': ['<rootDir>/../../examples/_lib/customer-mongo'],
    '^customer-mongo/models$': [
      '<rootDir>/../../examples/_lib/customer-mongo/src/models/index',
    ],
    '^customer-sqb': ['<rootDir>/../../examples/_lib/customer-sqb'],
    '^customer-sqb/models$': [
      '<rootDir>/../../examples/_lib/customer-sqb/src/models/index',
    ],
    '^express-mongo$': ['<rootDir>/../../examples/express-mongo'],
    '^express-sqb': ['<rootDir>/../../examples/express-sqb'],
    '^nestjs-express-mongo$': ['<rootDir>/../../examples/nestjs-express-mongo'],
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
