const { resolve } = require('path')
const nodeExternals = require('webpack-node-externals')
module.exports = {
  entry: './src/mtfscrolllist.js',
  output: {
    filename: 'mtfscrolllist.js',
    path: resolve('dist'),
    libraryTarget: 'umd'
  },
  module: {
    rules: []
  },
  devServer: {
    hot: true,
    open: true
  },
  externals: [nodeExternals()]
}
