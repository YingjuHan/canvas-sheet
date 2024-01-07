module.exports = {
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/canvas-spreadsheet/'
    : '/',
  configureWebpack: (config) => {
    config.devtool = 'source-map'
  }
};
