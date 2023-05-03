import base from '../../jest.config.base.cjs';
import {readFile} from 'fs/promises';

const packageJson = JSON.parse(await readFile(new URL('./package.json', import.meta.url)));

export default {
  ...base,
  displayName: packageJson.name
};
