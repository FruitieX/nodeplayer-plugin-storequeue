'use strict';

var MODULE_NAME = 'plugin-storequeue';

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var _ = require('underscore');

var nodeplayerConfig = require('nodeplayer').config;
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
        var storedQueue = require(config.queueStorePath);
        player.queue = storedQueue.queue;
        player.playbackPosition = storedQueue.position || 0;
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
    fs.writeFileSync(config.queueStorePath, JSON.stringify({
        queue: player.queue,
        position: 0
    }, undefined, 4));
};

process.on('SIGINT', function() {
    console.log('saving playback queue...');
    fs.writeFileSync(config.queueStorePath, JSON.stringify({
        queue: player.queue,
        position: new Date().getTime() - player.playbackStart + player.playbackPosition
    }, undefined, 4));
    process.exit(0);
});

exports.postSongsRemoved = exports.postQueueModify;
