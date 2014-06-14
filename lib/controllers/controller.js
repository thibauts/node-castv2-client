var EventEmitter  = require('events').EventEmitter;
var util          = require('util');
var debug         = require('debug')('castv2-client');

function Controller(client, sourceId, destinationId, namespace, encoding) {
  EventEmitter.call(this);

  this.channel = client.createChannel(sourceId, destinationId, namespace, encoding);

  this.channel.on('message', onmessage);
  this.channel.once('close', onclose);

  var self = this;

  function onmessage(data, broadcast) {
    self.emit('message', data, broadcast);
  }

  function onclose() {
    self.channel.removeListener('message', onmessage);
    self.emit('close');
  }
}

util.inherits(Controller, EventEmitter);

Controller.prototype.send = function(data) {
  this.channel.send(data);
};

Controller.prototype.close = function() {
  this.channel.close();
};

module.exports = Controller;