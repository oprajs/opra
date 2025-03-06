/* eslint-disable import-x/no-extraneous-dependencies */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const require = createRequire(import.meta.url);

const pkgJson = require('./package.json');

const dirname = path.dirname(fileURLToPath(import.meta.url));
const targetPath = path.resolve(dirname, 'build');
const entryPoint = path.resolve(targetPath, 'esm/index.js');
const external = [
  ...Object.keys(pkgJson.dependencies || {}),
  ...Object.keys(pkgJson.peerDependencies || {}),
  ...Object.keys(pkgJson.devDependencies || {}),
];

/**
 * @type BuildOptions
 */
const defaultConfig = {
  entryPoints: [entryPoint],
  bundle: true,
  platform: 'node',
  target: ['chrome85'],
  outfile: path.join(targetPath, './browser.js'),
  logLevel: 'info',
  format: 'esm',
  minify: true,
  keepNames: true,
  alias: {
    fs: '@browsery/fs',
    highland: '@browsery/highland',
    'http-parser-js': '@browsery/http-parser',
    stream: '@browsery/stream',
    'node:stream': '@browsery/stream',
    path: 'path-browserify',
    crypto: 'crypto-browserify',
    buffer: 'buffer',
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
  target: ['chrome85'],
  outfile: path.join(targetPath, './browser/index.mjs'),
  plugins: [
    {
      name: 'Custom',
      setup(build) {
        build.onLoad({ filter: /.*/ }, args => {
          if (args.path === entryPoint) {
            const contents =
              `import { Buffer } from 'buffer';\nglobalThis.Buffer = Buffer;\n` +
              fs.readFileSync(entryPoint, 'utf-8');

            console.log(contents);
            return {
              contents,
            };
          }
        });
      },
    },
  ],
});

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
