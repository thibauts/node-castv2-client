"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _json = _interopRequireDefault(require("./json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ConnectionController extends _json.default {
  constructor(client, sourceId, destinationId) {
    super(client, sourceId, destinationId, 'urn:x-cast:com.google.cast.tp.connection');

    const onMessage = data => {
      if (data.type === 'CLOSE') this.emit('disconnect');
    };

    const onClose = () => {
      this.removeListener('message', onMessage);
    };

    this.on('message', onMessage);
    this.once('close', onClose);
  }
  /**
   * Connect
   */


  connect() {
    this.send({
      type: 'CONNECT'
    });
  }
  /**
   * Disconnect
   */


  disconnect() {
    this.send({
      type: 'CLOSE'
    });
  }

}

var _default = ConnectionController;
exports.default = _default;