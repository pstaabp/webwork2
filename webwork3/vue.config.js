// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//     .BundleAnalyzerPlugin;
// eslint-disable-next-line no-undef
module.exports = {
  devServer: {
    proxy: {
      "^/webwork3": {
        target: "http://localhost:5000",
        pathRewrite: { "^/webwork3/": "" },
      },
    },
    watchOptions: {
      poll: true,
    },
  },
  // configureWebpack: {
  //     plugins: [new BundleAnalyzerPlugin()]
  // },
  publicPath: "/webwork3/",
  transpileDependencies: ["vuex-module-decorators"],
};
