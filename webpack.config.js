const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = () => {
  return {
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      allowedHosts: ['.gitpod.io'],
      host: '0.0.0.0',
      compress: true,
      port: 8080,
      client: {
        progress: true,
        overlay: {
          errors: true,
          warnings: false,
        },
      }
    },
    ignoreWarnings: [
      {
        module: /module2\.js\?[34]/, // A RegExp
      },
      {
        module: /[13]/,
        message: /homepage/,
      },
      /warning from compiler/,
      (_) => true,
    ],
    target: ['web'],
    entry: path.resolve(__dirname, 'main.js'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.min.js',
      library: {
        type: 'umd'
      }
    },
    plugins: [new CopyPlugin({
      // Use copy plugin to copy *.wasm and model to output folder.
      patterns: [
        { from: 'node_modules/onnxruntime-web/dist/*.wasm', to: '[name][ext]' },
        { from: './model/chessgpt.onnx', to: '[name][ext]' }]
    })],
    mode: 'production',

  }
};