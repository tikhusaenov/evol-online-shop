'use strict';

/**
 * Настройки поумолчанию
 */
module.exports = {
  account: {
    id: '875c9b8e538ac2327929356d7e4a347e',
    token: '58426a139b06f0ed54041cfdae3ed20f',
    url: 'https://www.evol-market.com/',
    http: true
  },
  theme: {
    id: '1463785',
    root: '.',
    backup: true,
    assetsSync: true,
    excludeFiles: [],
    onUpdate: function onUpdate() {
      // обновление темы
    },
    assetsDomain: 'https://assets.insales.ru'
  },
  util: {
    openBrowser: true
  },
  plugins: {
    exclude: ['*.min.js', '*.min.css', '*.liquid']
  },
  chokidarOptions: {
    ignored: /[\/\\]\./,
    ignoreInitial: true,
    followSymlinks: true,
    usePolling: false,
    interval: 200,
    delay: 0,
    binaryInterval: 300,
    alwaysStat: true,
    depth: 99,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100
    },
    ignorePermissionErrors: true
  }
};