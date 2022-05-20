module.exports = {
  preset: 'ts-jest',
  rootDir: '.',
  testEnvironment: 'node',
  'testMatch': [
    '<rootDir>/test/**/*.spec.ts'
  ],
  globals: {
    'ts-jest': {
      isolatedModules: false,
      'tsconfig': '<rootDir>/test/tsconfig.json'
    }
  },
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  }
};
