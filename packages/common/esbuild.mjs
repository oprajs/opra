/* eslint-disable import-x/no-extraneous-dependencies */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const require = createRequire(import.meta.url);

const pkgJson = require('./package.json');

const dirname = path.dirname(fileURLToPath(import.meta.url));
const appName = path.basename(dirname);
const buildRoot = path.resolve(dirname, '../../build');
const targetPath = path.resolve(buildRoot, appName);
const noExternal = [];
const external = [
  ...Object.keys(pkgJson.dependencies),
  ...Object.keys(pkgJson.devDependencies),
  'mime-db',
].filter(x => !noExternal.includes(x));

const defaultConfig = {
  entryPoints: [path.resolve(targetPath, 'esm/index.js')],
  bundle: true,
  logLevel: 'info',
  minify: true,
  keepNames: true,
  // plugins: [
  //   esbuildPluginTsc({
  //     tsconfigPath: 'tsconfig-build-esm.json',
  //   }),
  // ],
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
  platform: 'browser',
  target: ['es2020', 'chrome80'],
  format: 'cjs',
  tsconfig: './tsconfig-build-cjs.json',
});

await esbuild.build({
  ...defaultConfig,
  outfile: path.join(targetPath, './browser/index.mjs'),
  platform: 'browser',
  target: ['es2020', 'chrome80'],
  format: 'esm',
  tsconfig: './tsconfig-build-esm.json',
});
