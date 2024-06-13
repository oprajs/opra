import { readFile } from 'fs/promises';
import * as path from 'path';
import * as url from 'url';
import base from '../../jest.config.base.cjs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default async function config() {
  const packageJson = JSON.parse(
    await readFile(path.join(__dirname, './package.json'), 'utf-8'),
  );
  return {
    ...base,
    displayName: packageJson.name,
    globalSetup: '<rootDir>/test/jest-setup.ts',
  };
}
