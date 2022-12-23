module.exports = {
  testEnvironment: 'node',
  maxWorkers: '50%',
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
