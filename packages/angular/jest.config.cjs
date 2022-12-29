const packageJson = require('./package.json');

const packageName = packageJson.name;

// eslint-disable-next-line no-undef
globalThis.ngJest = {
  skipNgcc: true,
  tsconfig: 'tsconfig.spec.json'
};

module.exports = {
  displayName: packageName,
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/test/_support/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  moduleNameMapper: {
    '^@opra/(.*)$': ['<rootDir>/../$1/src'],
    '^(\\..+)\\.js$': '$1'
  }
};
