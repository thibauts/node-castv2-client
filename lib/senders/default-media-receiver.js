var util        = require('util');
var debug       = require('debug')('castv2-client');
var Application = require('./application');
var MediaController = require('../controllers/media');

function DefaultMediaReceiver(client, session) {
  Application.apply(this, arguments);

  this.media = this.createController(MediaController);

  this.media.on('status', onstatus);

  var self = this;

  function onstatus(status) {
    self.emit('status', status);
  }

}

DefaultMediaReceiver.APP_ID = 'CC1AD845';

util.inherits(DefaultMediaReceiver, Application);

DefaultMediaReceiver.prototype.getStatus = function(callback) {
  this.media.getStatus.apply(this.media, arguments);
};

DefaultMediaReceiver.prototype.load = function(media, options, callback) {
  this.media.load.apply(this.media, arguments);
};

DefaultMediaReceiver.prototype.play = function(callback) {
  this.media.play.apply(this.media, arguments);
};

DefaultMediaReceiver.prototype.pause = function(callback) {
  this.media.pause.apply(this.media, arguments);
};

DefaultMediaReceiver.prototype.stop = function(callback) {
  this.media.stop.apply(this.media, arguments);
};

DefaultMediaReceiver.prototype.seek = function(currentTime, callback) {
  this.media.seek.apply(this.media, arguments);
};

module.exports = DefaultMediaReceiver;