const merge = require('putil-merge');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const buildPath = path.resolve(__dirname, '../../../build');

function createWebpackConfig(cfg) {
  const libType = cfg.output?.library?.type || 'module';
  const moduleTarget = (
      cfg.output?.library?.type === 'module' ? 'esm'
          : (libType === 'umd' ? 'umd' : 'cjs')
  );

  cfg = merge({...cfg}, {
    resolve: {
      fallback: {
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer'),
        events: require.resolve('events'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        url: false,
        fs: false
      }
    },
    externals: [
      nodeExternals
    ]
  }, {deep: true, arrayMerge: true});

  return merge({
    mode: 'production',
    target: 'web',
    devtool: false,
    name: 'opra-client',
    entry: path.join(buildPath, 'node-client', 'esm', 'index.js'),
    output: {
      library: {
        type: libType
      },
      path: path.join(buildPath, 'client', moduleTarget),
      filename: '[name].min.js'
    },
    resolve: {
      extensions: ['.js', '.mjs', '.cjs']
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            output: {
              comments: false
            }
          },
          extractComments: /^Copyright|@preserve|license|@cc_on/i
        })
      ],
      splitChunks: {
        cacheGroups: {
          antlr4ts: {
            test: /\bantlr4ts\b/,
            name: 'antlr4ts',
            enforce: true,
            priority: -1,
            chunks: 'all'
          },
          'opra-common': {
            test: /\/opra\/build\/common\//,
            name: 'opra-common',
            enforce: true,
            priority: -2,
            chunks: 'all'
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            enforce: true,
            priority: -20,
            chunks: 'all'
          }
        }
      }

    },
    plugins: [
      new webpack.NormalModuleReplacementPlugin(
          /.+/,
          function(resource) {
            const m = /^@opra\/(.+)/.exec(resource.request);
            if (m) {
              resource.request =
                  path.resolve(buildPath, m[1], 'esm', 'index.js');
            }
            if (resource.context.includes('/node_modules/') ||
                resource.request.startsWith('@') ||
                resource.request.startsWith('fs/') ||
                resource.request.endsWith('.js')
            )
              return;
            // console.log(resource.request, '>>', resource.context);
            if (resource.request.includes('/')
            ) {
              let f = require.resolve(resource.request);
              f = path.relative(resource.context, f);
              // console.log(resource.request, '>>>', f);
              resource.request = f;
            }
          }
      )
    ],
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  }, cfg || {}, {deep: true});
}

module.exports = {
  createWebpackConfig
};

function nodeExternals({context, request}, callback) {
  if (request === 'lodash')
    return callback(null, 'lodash-es');
  callback();
}
