const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    publicPath: '/dist/',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    libraryExport: 'default',
    library: 'form-table',
    globalObject: 'this'
  },
  plugins: [new VueLoaderPlugin()],
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.vue$/, use: 'vue-loader' }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 300000,
      maxSize: 0,
      minChunks: 2,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      automaticNameMaxLength: 30,
      name: 'hello',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          name: 'vandors'
        },
        default: {
          minChunks: 2,
          priority: -20,
          name: 'defult',
          reuseExistingChunk: true
        }
      }
    }
  }
}
