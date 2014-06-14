var util            = require('util');
var debug           = require('debug')('castv2-client');
var JsonController  = require('./json');

var DEFAULT_INTERVAL = 5; // seconds

function HeartbeatController(client, sourceId, destinationId) {
  JsonController.call(this, client, sourceId, destinationId, 'urn:x-cast:com.google.cast.tp.heartbeat');

  this.interval = null;

  this.on('message', onmessage);
  this.once('close', onclose);

  var self = this;

  function onmessage(data, broadcast) {
    if(data.type === 'PONG') {
      self.emit('pong');
    }
  }

  function onclose() {
    self.removeListener('message', onmessage);
    self.stop();
  }
  
}

util.inherits(HeartbeatController, JsonController);

HeartbeatController.prototype.ping = function() {
  this.send({ type: 'PING' });
};

HeartbeatController.prototype.start = function(intervalValue) {
  var self = this;
  
  function oninterval() {
    self.ping();
  }

  this.interval = setInterval(oninterval, (intervalValue || DEFAULT_INTERVAL) * 1000);
  this.ping();
};

HeartbeatController.prototype.stop = function() {
  clearInterval(this.interval);
};

module.exports = HeartbeatController;