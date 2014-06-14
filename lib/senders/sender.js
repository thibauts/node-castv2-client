var EventEmitter  = require('events').EventEmitter;
var util          = require('util');
var debug         = require('debug')('castv2-client');

function Sender(client, senderId, receiverId) {
  EventEmitter.call(this);

  this.client = client;
  this.senderId = senderId;
  this.receiverId = receiverId;
}

util.inherits(Sender, EventEmitter);

Sender.prototype.close = function() {
  this.senderId = null;
  this.receiverId = null;
  this.client = null;
};

Sender.prototype.createController = function() {
  var args = Array.prototype.slice.call(arguments);
  var Controller = args.shift();
  return construct(Controller, [this.client, this.senderId, this.receiverId].concat(args));
};

function construct(contructor, args) {
  function fn() {
    return contructor.apply(this, args);
  }
  fn.prototype = contructor.prototype;
  return new fn();
}

module.exports = Sender;