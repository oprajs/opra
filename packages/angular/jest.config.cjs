const packageJson = require('./package.json');

const packageName = packageJson.name;

module.exports = {
  displayName: packageName,

  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/test/_support/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',

  moduleNameMapper: {
    '^@opra/client$': ['<rootDir>/../node-client/src'],
    '^@opra/(.*)$': ['<rootDir>/../$1/src'],
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
