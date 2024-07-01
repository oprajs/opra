import { readFileSync } from 'node:fs';
import base from '../../jest.config.base.cjs';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url)),
);

export default {
  ...base,
  displayName: packageJson.name,
};
