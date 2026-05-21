/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */
'use strict';

const {readFileSync} = require('fs');
const {resolve} = require('path');
const webpack = require('webpack');

const __DEV__ = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: __DEV__ ? 'development' : 'production',
  // Avoid eval-based devtool options that violate Chrome extension CSP
  devtool: __DEV__ ? 'cheap-module-source-map' : false,
  entry: {
    background: './src/background.js',
    contentScript: './src/contentScript.js',
    inject: './src/GlobalHook.js',
    injectHook: './src/injectHook.js',
    main: './src/main.js',
    panel: './src/panel.js',
  },
  output: {
    path: __dirname + '/build',
    filename: '[name].js',
    // Use 'self' instead of default 'window' to avoid Function("return this")()
    // which violates Chrome extension CSP (no unsafe-eval)
    globalObject: 'self',
  },
  plugins: __DEV__ ? [] : [
    // Ensure we get production React
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: JSON.parse(readFileSync(resolve(__dirname, '../../.babelrc'))),
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: true,
              localIdentName: '[local]___[hash:base64:5]',
            },
          },
        ],
      },
    ],
  },
};
