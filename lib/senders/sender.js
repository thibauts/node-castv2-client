"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = require("events");

class Sender extends _events.EventEmitter {
  constructor(client, senderId, receiverId) {
    super();
    this.client = client;
    this.senderId = senderId;
    this.receiverId = receiverId;
  }
  /**
   * Close the Sender
   */


  close() {
    this.senderId = undefined;
    this.receiverId = undefined;
    this.client = undefined;
  }
  /**
   * Create a controller using the Sender's properties
   * @param {Controller} controller
   * @param {*} args
   */


  createController(Controller, ...args) {
    return new Controller(this.client, this.senderId, this.receiverId, ...args);
  }

}

var _default = Sender;
exports.default = _default;