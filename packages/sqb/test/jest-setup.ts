// eslint-disable-next-line import/extensions
import { initPostgres } from '../../../support/test/init-postgres';

export default async function globalSetup() {
  await initPostgres();
}