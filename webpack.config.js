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
  output: { filename: 'bundle.js' },
  optimization: { minimize: true },
  resolve: { extensions: ['.css', '.js', '.ts', '.tsx'] }
};
