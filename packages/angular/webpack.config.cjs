const path = require('path');
const {NormalModuleReplacementPlugin} = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const merge = require('putil-merge');

const buildPath = path.join(__dirname, '../../build');
const pkgJson = require(path.join(__dirname, 'package.json'));
const dependencies = Object.keys(pkgJson.dependencies);

function buildConfig(cfg) {
  return merge({
    mode: 'production',
    target: 'web',
    devtool: false,
    entry: {
      'opra-angular': [path.join(buildPath, 'angular', 'esm', 'index.js')]
    },
    output: {
      library: {
        type: 'module'
      },
      path: path.join(buildPath, 'angular', 'browser'),
      filename: '[name].min.js'
    },
    externals: [
      ...dependencies
    ],
    externalsPresets: {
      node: true
    },
    resolve: {
      extensions: ['.js', '.mjs', '.cjs'],
      alias: {
        '@opra/client': path.resolve(buildPath, 'client', 'esm')
      },
      fallback: {
        'assert': false,
        'url': false,
        'path': false,
        'fs': false,
        'stream': false,
        'util': false
      }
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
      ]
    },
    plugins: [
      new NormalModuleReplacementPlugin(
          /.+/,
          function(resource) {
            if (resource.context.includes('/node_modules/') ||
                resource.request.startsWith('@') ||
                resource.request.startsWith('fs/') ||
                resource.request.endsWith('.js')
            )
              return;
            // console.log(resource.request, '>>', resource.context);
            if (resource.request.includes('/')
            ) {
              // console.log(resource);
              let f = require.resolve(resource.request);
              f = path.relative(resource.context, f);
              // console.log(resource.request, '>>>', f);
              resource.request = f;
            }
          }
      )
    ]
  }, cfg || {}, {deep: true});
}

module.exports = (webpackEnv, argv) => {
  const isEnvDevelopment = argv.mode === 'development' || argv.mode === 'dev';
  const mode = (isEnvDevelopment ? 'development' : 'production');
  // noinspection WebpackConfigHighlighting
  return [
    buildConfig({
      mode,
      output: {
        library: {
          type: 'module'
        },
        filename: '[name].min.mjs'
      },
      experiments: {
        topLevelAwait: true,
        outputModule: true
      }
    }),
    buildConfig({
      mode,
      output: {
        library: {
          type: 'commonjs2'
        },
        filename: '[name].min.cjs'
      }
    }),
    buildConfig({
      mode,
      output: {
        library: {
          name: 'OpraClient',
          type: 'umd',
          umdNamedDefine: true
        },
        path: path.join(buildPath, 'angular', 'umd'),
        filename: '[name].umd.min.js'
      }
    })
  ];
};
