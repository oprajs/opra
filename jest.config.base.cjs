module.exports = {
  testEnvironment: 'node',
  verbose: true,
  maxWorkers: '50%',
  coveragePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '/node_modules/',
    '_support'
  ],
  coverageReporters: ['lcov', 'text'],
  coverageDirectory: "<rootDir>/coverage/",
  transform: {
    '^.+.ts?$': ['ts-jest', {
      tsconfig: '<rootDir>/test/tsconfig.json',
      isolatedModules: true
    }]
  },
  moduleNameMapper: {
    '^@opra/optionals$': ['<rootDir>/../optionals/cjs'],
    '^@opra/(.*)$': ['<rootDir>/../$1/src'],
    '^(\\..+)\\.js$': '$1'
  }

};
