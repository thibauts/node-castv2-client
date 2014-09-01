var util            = require('util');
var debug           = require('debug')('castv2-client');
var JsonController  = require('./json');

var DEFAULT_INTERVAL = 5; // seconds
var TIMEOUT_FACTOR = 3; // timeouts after 3 intervals

function HeartbeatController(client, sourceId, destinationId) {
  JsonController.call(this, client, sourceId, destinationId, 'urn:x-cast:com.google.cast.tp.heartbeat');

  this.interval = null;
  this.timeout = null;
  this.intervalValue = DEFAULT_INTERVAL;

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
  var self = this;

  this.once('pong', onpong);

  function onpong() {
    clearTimeout(self.timeout);    
    self.timeout = setTimeout(ontimeout, self.intervalValue * 1000 * TIMEOUT_FACTOR);
  }

  function ontimeout() {
    self.emit('timeout');
  }

  this.send({ type: 'PING' });
};

HeartbeatController.prototype.start = function(intervalValue) {
  var self = this;

  if(intervalValue) {
    this.intervalValue = intervalValue;
  }

  function oninterval() {
    self.ping();
  }

  this.interval = setInterval(oninterval, this.intervalValue * 1000);
  this.ping();
};

HeartbeatController.prototype.stop = function() {
  clearInterval(this.interval);
  clearTimeout(this.timeout);
};

module.exports = HeartbeatController;