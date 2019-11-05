const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    publicPath: './',
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
  }
}
