const merge = require('putil-merge');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const {createWebpackConfig} = require('./create-webpack-config.cjs');

const srcRoot = path.resolve(__dirname, '..');
const buildPath = path.resolve(srcRoot, '../../build');
const outputPath = path.resolve(buildPath, 'client');
const pkgJson = require(path.join(srcRoot, 'package.json'));

const bundleDeps = [
  '@opra/common',
  '@opra/node-client',
  'assert',
  'buffer',
  'events',
  'path-browserify',
  'stream-browserify',
  'util',
  'url',
  'antlr4ts',
  'highland',
  'lodash',
  'http-parser-js',
  'putil-isplainobject',
  'putil-merge',
  'putil-promisify',
  'putil-varhelpers'
];

async function run() {
  // Generate package.json
  const trgJson = merge({}, pkgJson, {deep: true});
  delete trgJson.scripts;
  bundleDeps.forEach(x => delete trgJson.dependencies[x]);
  bundleDeps.forEach(x => delete trgJson.devDependencies[x]);

  // Create output directory
  let stat;
  try {
    stat = fs.statSync(outputPath);
  } catch {
  }
  if (!stat)
    fs.mkdirSync(outputPath, {recursive: true});

  // Write package.json
  await fs.writeFileSync(path.resolve(outputPath, 'package.json'),
      JSON.stringify(trgJson, null, 2), 'utf-8');

  // Copy files
  for (const f of ['README.md', '../../LICENSE']) {
    fs.copyFileSync(path.resolve(srcRoot, f),
        path.resolve(outputPath, path.basename(f)));
  }

  // Copy node-client Typings
  copyTypings(
      path.resolve(buildPath, 'node-client/esm'),
      path.resolve(outputPath, 'typings'),
      (src, dst) => {
        let content = fs.readFileSync(src, 'utf-8');
        if (content.includes('@opra/common')) {
          const rel = path.relative(path.dirname(dst), path.resolve(outputPath, 'typings'));
          const newPath = rel ? path.join(rel, './common') : './common';
          content = content.replaceAll('@opra/common', newPath);
          fs.writeFileSync(dst, content, 'utf-8');
          return true;
        }
      }
  );

  // Copy common Typings
  copyTypings(
      path.resolve(buildPath, 'common/esm'),
      path.resolve(outputPath, 'typings/common')
  );

  const externals = Object.keys(trgJson.dependencies).filter(x => !bundleDeps.includes(x));

  const compiler = webpack([
    createWebpackConfig({
      output: {
        library: {
          type: 'module'
        },
        filename: '[name].min.mjs'
      },
      externals,
      experiments: {
        topLevelAwait: true,
        outputModule: true
      }
    }),
    createWebpackConfig({
      output: {
        library: {
          type: 'commonjs2'
        },
        filename: '[name].min.cjs'
      },
      externals
    }),
    createWebpackConfig({
      output: {
        library: {
          type: 'umd'
        },
        filename: '[name].min.cjs'
      },
      externals
    })
  ]);
  compiler.run((err, stats) => {
    if (err)
      return console.error(err);

    if (stats.hasErrors()) {
      console.error(stats.toString({
        modules: false,
        errorDetails: false,
        timings: false,
        cached: false,
        colors: true
      }));
      process.exit(1);
      return;
    }
    console.log(stats.toString({
      modules: true,
      errorDetails: true,
      timings: true,
      cached: true,
      colors: true
    }));
  });
}

run().catch(e => console.error(e));

function copyTypings(src, dest, cb) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest))
      fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function(childItemName) {
      copyTypings(path.join(src, childItemName),
          path.join(dest, childItemName), cb);
    });
  } else {
    if (src.endsWith('.d.ts')) {
      const ignore = cb && cb(src, dest);
      if (!ignore)
        fs.copyFileSync(src, dest);
    }
  }
}
