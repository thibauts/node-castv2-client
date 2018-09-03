"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _requestResponse = _interopRequireDefault(require("./request-response"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ReceiverController extends _requestResponse.default {
  constructor(client, sourceId, destinationId) {
    super(client, sourceId, destinationId, 'urn:x-cast:com.google.cast.receiver');
    const self = this;

    function onMessage(data, broadcast) {
      if (!broadcast) return;
      if (data.type === 'RECEIVER_STATUS') self.emit('status', data.status);
    }

    function onClose() {
      self.removeListener('message', onMessage);
    }

    this.on('message', onMessage);
    this.once('close', onClose);
  }
  /**
   * Get the status
   * @returns {Promise}
   */


  getStatus() {
    return new Promise((resolve, reject) => {
      this.request({
        type: 'GET_STATUS'
      }).then(response => resolve(response.status)).catch(err => reject(err));
    });
  }
  /**
   * Get app availability
   * @param {String|Array} appId - App ID
   * @returns {Promise}
   */


  getAppAvailability(appId) {
    return new Promise((resolve, reject) => {
      const data = {
        type: 'GET_APP_AVAILABILITY',
        appId: Array.isArray(appId) ? appId : [appId]
      };
      this.request(data).then(response => resolve(response.availability)).catch(err => reject(err));
    });
  }
  /**
   * Launch an App with its ID
   * @param {String} appId - App ID
   * @returns {Promise}
   */


  launch(appId) {
    return new Promise((resolve, reject) => {
      this.request({
        type: 'LAUNCH',
        appId
      }).then(response => {
        if (response.type === 'LAUNCH_ERROR') return reject(new Error(`Launch failed. Reason: ${response.reason}`));
        return resolve(response.status.applications || []);
      }).catch(err => reject(err));
    });
  }
  /**
   * Stop a session with its ID
   * @param {String} sessionId - Session ID
   * @returns {Promise}
   */


  stop(sessionId) {
    return new Promise((resolve, reject) => {
      const data = {
        type: 'STOP',
        sessionId
      };
      this.request(data).then(response => resolve(response.status.applications || [])).catch(err => reject(err));
    });
  }
  /**
   * Set the volume
   * @param {Object} options - Options
   * @returns {Promise}
   */


  setVolume(options) {
    return new Promise((resolve, reject) => {
      const data = {
        type: 'SET_VOLUME',
        volume: options
      };
      this.request(data).then(response => resolve(response.status.volume || [])).catch(err => reject(err));
    });
  }
  /**
   * Get the volume
   * @returns {Promise}
   */


  getVolume() {
    return new Promise((resolve, reject) => {
      this.getStatus().then(status => resolve(status.volume)).catch(err => reject(err));
    });
  }
  /**
   * Get the sessions
   * @returns {Promise}
   */


  getSessions() {
    return new Promise((resolve, reject) => {
      this.getStatus().then(status => resolve(status.applications || [])).catch(err => reject(err));
    });
  }

}

var _default = ReceiverController;
exports.default = _default;