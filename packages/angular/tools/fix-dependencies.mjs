//
import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const pattern = /^@opra\/(.*)$/;

async function fixDependencies() {
  const srcFile = path.resolve(dirname, '../package.json');
  const json = JSON.parse(await fs.readFile(srcFile, 'utf-8'));
  const cache = {};
  let changed;
  for (const dep of [json.dependencies, json.devDependencies,
    json.optionalDependencies, json.peerDependencies]) {
    if (!dep)
      continue;
    for (const k of Object.keys(dep)) {
      const m = pattern.exec(k);
      if (m) {
        const depJson = cache[m[1]] || (
                cache[m[1]] = JSON.parse(await fs.readFile(path.resolve(dirname, '../../client/package.json'), 'utf-8'))
        );
        if (dep[k] !== '^' + depJson.version) {
          changed = true;
          dep[k] = '^' + depJson.version;
        }
      }
    }
  }
  if (changed) {
    await fs.writeFile(srcFile, JSON.stringify(json, undefined, 2), 'utf-8');
  }
}

fixDependencies().catch(e => {
  // eslint-disable-next-line  no-console
  console.error(e);
  process.exit(1);
});
