var path = require('path');
var nodeplayerConfig = require('nodeplayer').config;

var defaultConfig = {};

defaultConfig.queueStorePath = nodeplayerConfig.getBaseDir() + path.sep + 'stored-queue.json';

module.exports = defaultConfig;
