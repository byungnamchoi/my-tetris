import webpack from 'webpack';
import path from 'path';
import globEntry from 'webpack-glob-entry';

const mode =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';

const config = {
  mode,
  entry: globEntry('./src/assets/js/*.js'),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build/assets/js/'),
    publicPath: '/assets/js/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude : /node_modules/,
        // exclude : filePath => 
        //       new RegExp(
        //         `node_modules\\${path.sep}(?!(dom7|swiper)\\${path.sep}).*`
        //       ).test(filePath),
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true
            }
          },
          'eslint-loader'
        ]
      }
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  }
};

if (mode === 'production') {
  // const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
  const TerserPlugin = require('terser-webpack-plugin');

  config.optimization = {
    minimizer: [
      // new UglifyJSPlugin({
      //   extractComments: true
      // })
      new TerserPlugin({
        parallel: true,
        cache: true,
        extractComments: true,
        terserOptions: {
          ecma: 5,
          ie8: false,
          compress: true,
          warnings: false
        }
      })
    ]
  };
  config.plugins = [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    })
  ];
} else {
  Object.entries(config.entry).forEach(([key, value]) => {
    let entryValue = value.split();
    entryValue.unshift('webpack-hot-middleware/client?reload=true');
    config.entry[key] = entryValue;
  });

  config.plugins = [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    new webpack.HotModuleReplacementPlugin()
  ];
  config.devtool = 'source-map';

  // https://webpack.js.org/configuration/watch/
  config.watch = true;
}
export default config;
