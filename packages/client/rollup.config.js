/* eslint-disable */
import {createRequire} from 'module';
import path from 'path';
import fs from 'fs';
import {moduleResolve as nodeResolve} from 'import-meta-resolve';
import {findUpSync, pathExists} from 'find-up';
import {fileURLToPath} from 'node:url';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import merge from 'putil-merge';
// import json from '@rollup/plugin-json';
import {babel} from '@rollup/plugin-babel';
import externals from 'rollup-plugin-node-externals';
// import autoExternal from 'rollup-plugin-auto-external';
import bundleSize from 'rollup-plugin-bundle-size';
import {optimizeLodashImports} from '@optimize-lodash/rollup-plugin';

import pkgJson from './package.json' assert {type: 'json'};
import pkgJsonCommon from '../common/package.json' assert {type: 'json'};

const dirname = path.dirname(fileURLToPath(import.meta.url));
const req = createRequire(fileURLToPath(import.meta.url));
// const resolveLib = buildResolver(dirname);

const rootDir = path.resolve(dirname, '../..');
const buildDir = path.resolve(rootDir, 'build/client');
const year = new Date().getFullYear();
const banner = `// OPRA Http Client v${pkgJson.version} Copyright (c) ${year} ${pkgJson.author}`;

const outputFileName = 'opra-client';
const name = 'opraClient';
const externalLibs =
    [
      ...Object.keys(pkgJson.dependencies || []),
      ...Object.keys(pkgJson.devDependencies || []),
      ...Object.keys(pkgJson.peerDependencies || []),
      ...Object.keys(pkgJsonCommon.dependencies || []),
      ...Object.keys(pkgJsonCommon.devDependencies || []),
      ...Object.keys(pkgJsonCommon.peerDependencies || [])
    ].filter(function onlyUnique(value, index, self) {
          return self.indexOf(value) === index && value !== '@opra/common';
        }
    );

const commonConfig = {
  output: {
    banner,
    // exports: 'default',
    generatedCode: {
      preset: 'es2015',
      arrowFunctions: true,
      constBindings: true,
      objectShorthand: true,
      symbols: true
    }
    // paths: externalPaths
  },
  external: externalLibs,
  plugins: [
    // resolve({
    // }),
    // resolve({
    //   browser: true,
    //   preferBuiltins: true,
    //   resolveOnly: module => {
    //     if (!externalLibs.includes(module))
    //       console.log('>', module);
    //     // return !['@babel/runtime', 'antlr4ts', 'lodash',
    //     //   'luxon'].includes(module);
    //     return !externalLibs.includes(module);
    //   }
    // }),
    commonjs(),
    // terser(),
    externals({
      exclude: ['@opra/common'
        // , /^antlr4ts\//
      ],
      include: [/^@babel/]
      // include: 'antlr4ts'
      // deps: false,    // Dependencies will be bundled in
    }),
    bundleSize(),
    // optimizeLodashImports(),
    alias({
      entries: [
        {
          find: '@opra/optionals',
          replacement: path.resolve(buildDir, '..', 'optionals', 'cjs', 'index.js')
        },
        {
          find: /^@opra\/(.*)/,
          replacement: path.resolve(buildDir, '..', '$1', 'esm', 'index.js')
        }
      ]
    })
  ]
};

export default async () => {

  return [
    // // browser ESM bundle for CDN
    // merge({...commonConfig}, {
    //   input: path.join(buildDir, './esm/index.js'),
    //   output: {
    //     file: path.join(buildDir, 'browser', outputFileName + '.esm.js'),
    //     format: 'esm',
    //     exports: 'named'
    //   }
    // }, {deep: true}),

    // Browser CJS bundle
    merge({...commonConfig}, {
      input: path.join(buildDir, './esm/index.js'),
      output: {
        file: path.join(buildDir, 'browser', outputFileName + '.cjs.js'),
        format: 'cjs'
      },
      plugins: [...commonConfig.plugins,
        babel({
          exclude: 'node_modules/**',
          babelHelpers: 'bundled',
          presets: ['@babel/preset-env']
        })]
    }, {deep: true})

    // // Browser UMD bundle
    // merge({...commonConfig}, {
    //   input: path.join(buildDir, './esm/index.js'),
    //   output: {
    //     file: path.join(buildDir, 'browser', outputFileName + '.umd.js'),
    //     format: 'umd'
    //   },
    //   plugins: [...commonConfig.plugins,
    //     babel({
    //       babelHelpers: 'bundled',
    //       presets: ['@babel/preset-env']
    //     })]
    // }, {deep: true})

  ];
};
