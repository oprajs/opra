const packageJson = require('./package.json');

const packageName = packageJson.name;

// eslint-disable-next-line no-undef
globalThis.ngJest = {
  skipNgcc: true,
  tsconfig: 'tsconfig.spec.json'
};

module.exports = {
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
      useESM: true,
    },
  },
  displayName: packageName,
  transform: {
    '^.+\\.(ts|js|html|svg)$': 'jest-preset-angular',
  },
  moduleNameMapper: {
    '^@opra/(.*)$': ['<rootDir>/../$1/src'],
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // tslib: 'tslib/tslib.es6.js',
  },
  transformIgnorePatterns: [
    // '//node_modules'
    // 'node_modules/(?!.*\\.mjs$)'
  ],
  setupFilesAfterEnv: ['<rootDir>/test/_support/setup-jest.mjs'],
  globalSetup: 'jest-preset-angular/global-setup'
};
