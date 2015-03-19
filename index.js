'use strict';

var MODULE_NAME = 'plugin-storequeue';

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var _ = require('underscore');

var nodeplayerConfig = require('nodeplayer-config');
var coreConfig = nodeplayerConfig.getConfig();
var defaultConfig = require('./default-config.js');
var config = nodeplayerConfig.getConfig(MODULE_NAME, defaultConfig);

var player;
var logger;

exports.init = function(_player, _logger, callback) {
    player = _player;
    logger = _logger;

    mkdirp.sync(path.dirname(config.queueStorePath));
    try {
        player.queue = require(config.queueStorePath);
        _.each(player.queue, function(song) {
            logger.verbose('added stored song to queue: ' + song.songID);
        });
    } catch (e) {
        logger.warn('no stored queue found');
    }

    callback();
};

exports.onBackendsInitialized = function() {
    player.prepareSongs();
};

exports.postQueueModify = function(queue) {
    fs.writeFileSync(config.queueStorePath, JSON.stringify(player.queue, undefined, 4));
};
exports.postSongsRemoved = exports.postQueueModify;
