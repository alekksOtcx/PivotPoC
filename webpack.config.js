var webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
var WebpackOpenBrowser  = require('webpack-open-browser').default;

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  watch: true,
  watchOptions: {
   aggregateTimeout: 200,
   poll: 1000,
   ignored: /node_modules/,
 },
  // Resolve to output directory and set file
  output: {
   path: path.resolve(__dirname, './dist/assets'),
   filename: '[name].bundle.js',
   clean: true
  },

  optimization: {
   runtimeChunk: 'single',
 },

  // Add Url param to open browser plugin
  plugins: [
   new HtmlWebpackPlugin({
      template: './dist/assets/index.html',
     }),
 ],

  // Set dev-server configuration
  devServer: {
   static: './dist',
   hot:true,
   open: true,
 },

  // Add babel-loader to transpile js and jsx files
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: "defaults",
                  },
                ],
                "@babel/preset-react",
              ],
            },
          },
        ],
      },
    ]
  },
};