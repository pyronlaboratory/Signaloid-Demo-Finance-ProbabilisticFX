module.exports = {
  '/api-signaloid': {
    target: 'https://api.signaloid.io',
    secure: true,
    changeOrigin: true,
    pathRewrite: {
      '^/api-signaloid': '',
    },
    logLevel: 'debug',
    bypass: function (req, res, proxyOptions) {
      if (req.method === 'POST' && req.url.includes('samples')) {
        req.method = 'GET';
      }
    },
  },
};
