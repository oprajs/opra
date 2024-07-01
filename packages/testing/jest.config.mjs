import { readFile } from 'fs/promises';
import base from '../../jest.config.base.cjs';

const packageJson = JSON.parse(
  await readFile(new URL('./package.json', import.meta.url)),
);

export default {
  ...base,
  displayName: packageJson.name,
};
