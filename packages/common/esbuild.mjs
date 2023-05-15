import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import * as esbuild from 'esbuild';

const require = createRequire(import.meta.url);

const pkgJson = require('./package.json');
const dirname = path.dirname(fileURLToPath(import.meta.url));
const appName = path.basename(dirname);
const buildRoot = path.resolve(dirname, '../../build');
const targetPath = path.resolve(buildRoot, appName);
const external = [...Object.keys(pkgJson.dependencies), ...Object.keys(pkgJson.devDependencies)];

await esbuild.build({
  entryPoints: [path.resolve(targetPath, 'esm/index.js')],
  bundle: true,
  platform: 'node',
  target: ['node18'],
  outfile: path.join(targetPath, './browser.js'),
  logLevel: 'info',
  format: 'esm',
  // minify: true,
  keepNames: true,
  alias: {
    'fs': '@browsery/fs',
    'highland': '@browsery/highland',
    'http-parser-js': '@browsery/http-parser',
    'i18next': '@browsery/i18next',
    'stream': '@browsery/stream',
    'node:stream': '@browsery/stream',
    'path': 'path-browserify',
    'crypto': 'crypto-browserify'
  },
  external,
  // legalComments: 'external',
  banner: {
    js: `/****************************************
* All rights reserved Panates® 2022-${new Date().getFullYear()}
* http://www.panates.com
*****************************************/
`
  }
});
