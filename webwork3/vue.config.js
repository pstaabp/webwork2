module.exports = {
  devServer: {
    proxy: {
      '^/webwork3': {
        target: 'http://localhost:5000',
        pathRewrite: {'^/webwork3/' : ''}
      }
    },
    watchOptions: {
        poll: true
    }
  },

  publicPath: '/webwork3/'
}
