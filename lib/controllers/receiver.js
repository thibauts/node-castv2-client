var util                      = require('util');
var debug                     = require('debug')('castv2-client');
var RequestResponseController = require('./request-response');

function ReceiverController(client, sourceId, destinationId) {
  RequestResponseController.call(this, client, sourceId, destinationId, 'urn:x-cast:com.google.cast.receiver');

  this.on('message', onmessage);
  this.once('close', onclose);

  var self = this;

  function onmessage(data, broadcast) {
    if(!broadcast) return;
    if(data.type === 'RECEIVER_STATUS') {
      self.emit('status', data.status);
    }
  }

  function onclose() {
    self.removeListener('message', onmessage);
  }

}

util.inherits(ReceiverController, RequestResponseController);

ReceiverController.prototype.getStatus = function(callback) {
  this.request({ type: 'GET_STATUS' }, function(err, response) {
    if(err) return callback(err);
    callback(null, response.status);
  });
};

ReceiverController.prototype.getAppAvailability = function(appId, callback) {
  var data = {
    type: 'GET_APP_AVAILABILITY',
    appId: Array.isArray(appId) ? appId : [appId]
  };

  this.request(data, function(err, response) {
    if(err) return callback(err);
    callback(null, response.availability);
  });
};

ReceiverController.prototype.launch = function(appId, callback) {
  this.request({ type: 'LAUNCH', appId: appId }, function(err, response) {
    if(err) return callback(err);
    callback(null, response.status.applications || []);
  });
};

ReceiverController.prototype.stop = function(sessionId, callback) {
  this.request({ type: 'STOP', sessionId: sessionId }, function(err, response) {
    if(err) return callback(err);
    callback(null, response.status.applications || []);
  });
};

ReceiverController.prototype.setVolume = function(options, callback) {
  var data = {
    type: 'SET_VOLUME',
    volume: options // either `{ level: 0.5 }` or `{ muted: true }`
  };

  this.request(data, function(err, response) {
    if(err) return callback(err);
    callback(null, response.status.volume);
  });
};

ReceiverController.prototype.getVolume = function(callback) {
  this.getStatus(function(err, status) {
    if(err) return callback(err);
    callback(null, status.volume);
  });
};

ReceiverController.prototype.getSessions = function(callback) {
  this.getStatus(function(err, status) {
    if(err) return callback(err);
    callback(null, status.applications || []);
  });
};

module.exports = ReceiverController;
