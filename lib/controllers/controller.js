"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _debug = _interopRequireDefault(require("debug"));

var _events = require("events");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug.default)('castv2-client');

class Controller extends _events.EventEmitter {
  constructor(client, sourceId, destinationId, namespace, encoding) {
    super();
    this.channel = client.createChannel(sourceId, destinationId, namespace, encoding);
    const self = this;

    function onMessage(data, broadcast) {
      self.emit('message', data, broadcast);
    }

    function onClose() {
      self.channel.removeListener('message', onMessage);
      self.emit('close');
    }

    this.channel.on('message', onMessage);
    this.channel.once('close', onClose);
  }
  /**
   * Send data over the channel
   * @param {any} data - Data to send
   */


  send(data) {
    debug('Sending', data);
    this.channel.send(data);
  }
  /**
   * Close the channel
   */


  close() {
    this.channel.close();
  }

}

var _default = Controller;
exports.default = _default;