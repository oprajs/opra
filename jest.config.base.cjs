module.exports = {
  testEnvironment: 'node',
  'verbose': true,
  'forceExit': true,
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
      'tsconfig': '<rootDir>/test/tsconfig.json'
    }]
  },
  // transform: {
  //   '^.+ts?$': ['@swc-node/jest', {
  //     module: {
  //       type: 'es6',
  //     },
  //     "sourceMaps": "inline",
  //     jsc: {
  //       // minify: false,
  //       baseUrl: '.',
  //       paths: {
  //         '^@opra/optionals$': ['../optionals/cjs'],
  //         '^@opra/(.*)$': ['../$1/src'],
  //       },
  //       parser: {
  //         syntax: 'typescript',
  //         dynamicImport: true,
  //         decorators: true,
  //         tsx: false,
  //       },
  //       transform: {
  //         legacyDecorator: true,
  //         decoratorMetadata: true,
  //       },
  //       target: 'es2021',
  //     }
  //   }]
  // },
  moduleNameMapper: {
    '^@opra/optionals$': ['<rootDir>/../optionals/cjs'],
    '^@opra/(.*)$': ['<rootDir>/../$1/src'],
    '^(\\..+)\\.js$': '$1'
  }

};
