module.exports = {
  testEnvironment: 'node',
  maxWorkers: '50%',
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest', {
        tsconfig: '<rootDir>/test/tsconfig.json'
      }]
  },
  moduleFileExtensions: ['ts', 'js'],
  // extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@opra/(.*)$': ['<rootDir>/../$1/src'],
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }

};
