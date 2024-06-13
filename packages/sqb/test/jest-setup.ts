// eslint-disable-next-line import-x/extensions
import { initPostgres } from '../../../support/test/init-postgres';

export default async function globalSetup() {
  await initPostgres();
}
