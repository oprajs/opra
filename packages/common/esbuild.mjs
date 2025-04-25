/* eslint-disable import-x/no-extraneous-dependencies */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const require = createRequire(import.meta.url);

const pkgJson = require('./package.json');

const dirname = path.dirname(fileURLToPath(import.meta.url));
const targetPath = path.resolve(dirname, 'build');
const noExternal = [];
const external = [
  ...Object.keys(pkgJson.dependencies || {}),
  ...Object.keys(pkgJson.peerDependencies || {}),
  ...Object.keys(pkgJson.devDependencies || {}),
  'mime-db',
].filter(x => !noExternal.includes(x));

const defaultConfig = {
  entryPoints: [path.resolve(targetPath, 'esm/index.js')],
  bundle: true,
  logLevel: 'info',
  minify: true,
  keepNames: true,
  platform: 'browser',
  target: ['es2020', 'chrome80'],
  alias: {
    fs: '@browsery/fs',
    highland: '@browsery/highland',
    'http-parser-js': '@browsery/http-parser',
    i18next: '@browsery/i18next',
    stream: '@browsery/stream',
    'node:stream': '@browsery/stream',
    path: 'path-browserify',
    'node:path': 'path-browserify',
    crypto: 'crypto-browserify',
  },
  external,
  // legalComments: 'external',
  banner: {
    js: `/****************************************
* All rights reserved Panates® 2022-${new Date().getFullYear()}
* http://www.panates.com
*****************************************/
`,
  },
};

await esbuild.build({
  ...defaultConfig,
  outfile: path.join(targetPath, './browser/index.cjs'),
  format: 'cjs',
  tsconfig: './tsconfig-build-cjs.json',
});

await esbuild.build({
  ...defaultConfig,
  outfile: path.join(targetPath, './browser/index.mjs'),
  format: 'esm',
  tsconfig: './tsconfig-build-esm.json',
});
