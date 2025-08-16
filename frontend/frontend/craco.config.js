// craco.config.js - Fix for Solana wallet adapter compatibility
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Fix for crypto and node polyfills
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        url: require.resolve('url'),
        zlib: require.resolve('browserify-zlib'),
        path: require.resolve('path-browserify'),
        fs: false,
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      };

      // Fix for "process is not defined" error
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );

      // Fix for ESM issues
      webpackConfig.module.rules.push({
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      });

      return webpackConfig;
    },
  },
};