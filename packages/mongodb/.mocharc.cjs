const baseConfig = require('../../.mocharc.cjs');

process.env.INIT_MONGODB = 'true';

/** @type {import('mocha').MochaOptions} */
module.exports = {
  ...baseConfig,
  spec: 'test/**/*.*spec.ts',
};
