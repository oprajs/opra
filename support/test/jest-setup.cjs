const initTestSchema = require('./init-postgres.cjs');

module.exports = async function globalSetup() {
  await initTestSchema();
}
