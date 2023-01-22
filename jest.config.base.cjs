module.exports = {
  testEnvironment: 'node',
  maxWorkers: '50%',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/test/tsconfig.json',
      useESM: true
    }]
    // "^.+\\.(js|jsx)$": "babel-jest",
  },
  "moduleFileExtensions": ["ts","js"],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@opra/(.*)$': ['<rootDir>/../$1/src'],
    '^(\\.{1,2}/.*)\\.js$': '$1',
  }

};
