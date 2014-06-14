var util            = require('util');
var debug           = require('debug')('castv2-client');
var JsonController  = require('./json');

function ConnectionController(client, sourceId, destinationId) {
  JsonController.call(this, client, sourceId, destinationId, 'urn:x-cast:com.google.cast.tp.connection');

  this.on('message', onmessage);
  this.once('close', onclose);

  var self = this;

  function onmessage(data, broadcast) {
    if(data.type === 'CLOSE') {
      self.emit('disconnect');
    }
  }

  function onclose() {
    self.removeListener('message', onmessage);
  }

}

util.inherits(ConnectionController, JsonController);

ConnectionController.prototype.connect = function() {
  this.send({ type: 'CONNECT' });
};

ConnectionController.prototype.disconnect = function() {
  this.send({ type: 'CLOSE' });
};

module.exports = ConnectionController;