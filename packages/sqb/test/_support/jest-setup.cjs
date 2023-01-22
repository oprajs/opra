const initTestSchema = require('../../../../support/test/init-postgres.cjs');

module.exports = async function globalSetup() {
  await initTestSchema();
};
