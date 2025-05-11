const webpack = require('webpack');

module.exports = function override(config, env) {
  // Polyfill node core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "buffer": require.resolve("buffer/"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "util": require.resolve("util/"),
    "process": require.resolve("process/browser.js"), // Modified
    "vm": require.resolve("vm-browserify"),
    "fs": false, // Add this line to prevent Webpack from resolving 'fs'
  };

  // Provide global variables
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser.js', // Modified
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ];

  // Handle .mjs files
  config.module.rules = [
    ...config.module.rules,
    {
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    },
    {
      test: /\.js$/, // Adding rule to ignore specific source maps for JavaScript files
      enforce: 'pre',
      loader: 'source-map-loader',
      exclude: [
        /node_modules\/(face-api\.js|html2pdf\.js)/, // Exclude face-api.js and html2pdf.js
      ],
    },
  ];

  // Suppress Source Map Warnings globally using ignoreWarnings
  config.devtool = 'source-map'; // Keep source maps enabled for other files
  config.ignoreWarnings = [
    /source-map/, // Ignore source map warnings
  ];

  return config;
};
