// eslint-disable-next-line no-undef, @typescript-eslint/naming-convention
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;

// eslint-disable-next-line
const webpack = require("webpack");

// eslint-disable-next-line no-undef
module.exports = {
  //...
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@": resolve("src"),
      // Alias for using source of BootstrapVue
      "bootstrap-vue$": "bootstrap-vue/src/index.js",
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        // Exclude transpiling `node_modules`, except `bootstrap-vue/src`
        exclude: /node_modules\/(?!bootstrap-vue\/src\/)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["env"],
          },
        },
      },
    ],
  },
  query: {
    plugins: ["lodash"],
    presets: [["@babel/env", { targets: { node: 6 } }]],
  },
  plugins: [
    //  new BundleAnalyzerPlugin();
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
};
