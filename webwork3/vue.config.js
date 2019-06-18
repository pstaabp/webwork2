module.exports = {
    devServer: {
      //proxy: 'http://localhost:5000'
      proxy: {
        '^/webwork3': {
          target: 'http://localhost:5000',
          pathRewrite: {'^/webwork3/' : ''}
        }
    }
  },
  publicPath: '/webwork3/'
}
