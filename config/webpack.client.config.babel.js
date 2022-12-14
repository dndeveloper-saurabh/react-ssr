const merge = require("webpack-merge")
const baseConfig = require("./webpack.base.config")
const project = require("./project.config")
const { assetUrl } = require("./env.config").default
const path = require("path")
const webpack = require("webpack")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const ManifestPlugin = require("webpack-manifest-plugin")
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin
const LoadablePlugin = require("@loadable/webpack-plugin")

const devMode = project.globals.__DEV__

const config = {
  devtool: project.globals.__PROD__ ? false : "source-map",
  entry: {
    app: [
      ...(project.globals.__DEV__
        ? [
            "react-hot-loader/patch",
            "webpack-hot-middleware/client?timeout=1000&reload=true"
          ]
        : []),
      project.paths.client("renderer/client")
    ]
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          babelrc: false,
          extends: path.resolve(__dirname, "../.client.babelrc")
        }
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          babelrc: false,
          extends: path.resolve(__dirname, "../.client.babelrc")
        }
      },
      {
        test: /\.css$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              minimize: true,
              url: true
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "sass-loader" }
        ]
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        loader: 'file-loader'
      },
      {
        test: /\.svg(\?.*)?$/,
        loader:
          "url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml"
      },
    ]
  },
  output: {
    filename: project.globals.__DEV__ ? "[name].js" : `[name].[chunkhash].js`,
    publicPath: assetUrl,
    path: project.paths.dist()
  },
  plugins: [
    ...(project.globals.__DEV__
      ? [new webpack.HotModuleReplacementPlugin()]
      : [
          new ManifestPlugin(),
          new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false
          })
        ]),
    new LoadablePlugin({
      writeToDisk: true
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? "[name].css" : "[name].[hash].css",
      chunkFilename: devMode ? "[id].css" : "[id].[hash].css"
    })
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        commons: {
          test: /[\\/]node_modules[\\/].+\.js$/,
          name: "vendor",
          chunks: "all"
        }
      }
    }
  }
}

module.exports = merge(config, baseConfig)
