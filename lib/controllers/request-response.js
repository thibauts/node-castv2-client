"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _json = _interopRequireDefault(require("./json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RequestResponseController extends _json.default {
  constructor(client, sourceId, destinationId, namespace) {
    super(client, sourceId, destinationId, namespace);
    this.lastRequestId = 0;
  }
  /**
   * Object to request
   * @param {Object} data - data
   */


  request(data) {
    return new Promise((resolve, reject) => {
      const requestId = ++this.lastRequestId;
      const self = this;

      function onMessage(response) {
        if (response.requestId === requestId) {
          self.removeListener('message', onMessage);
          if (response.type === 'INVALID_REQUEST') return reject(new Error(`Invalid request: ${response.reason}`));
          delete response.requestId;
          return resolve(response);
        }
      }

      this.on('message', onMessage);
      data.requestId = requestId;
      this.send(data);
    });
  }

}

var _default = RequestResponseController;
exports.default = _default;