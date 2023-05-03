// eslint-disable-next-line import/extensions
import { initMongodb } from '../../../support/test/init-mongo';

export default async function globalSetup() {
  await initMongodb();
}
