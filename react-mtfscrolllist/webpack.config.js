const { resolve } = require('path')
const nodeExternals = require('webpack-node-externals')
module.exports = {
  entry: './src/react-mtfscrolllist.jsx',
  output: {
    filename: 'react-mtfscrolllist.js',
    path: resolve('dist'),
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: resolve('/'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },
  devServer: {
    hot: true,
    open: true
  },
  externals: [nodeExternals()]
}
