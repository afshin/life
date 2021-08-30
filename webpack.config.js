const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/example.ts',
  mode: 'development',
  devtool: 'eval-source-map',
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  output: {
    clean: true,
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    pathinfo: false
  },
  optimization: { minimize: true },
  resolve: { extensions: ['.css', '.js', '.ts', '.tsx'] }
};
