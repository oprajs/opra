module.exports = {
  testEnvironment: 'node',
  maxWorkers: '50%',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/test/tsconfig.json',
      useESM: true,
      isolatedModules: true
    }]
    // "^.+\\.(js|jsx)$": "babel-jest",
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@opra/(.*)$': ['<rootDir>/../$1/src'],
    '^(\\..+)\\.js$': '$1'
  }

};
