"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _castv = require("castv2");

var _sender = _interopRequireDefault(require("./sender"));

var _connection = _interopRequireDefault(require("../controllers/connection"));

var _heartbeat = _interopRequireDefault(require("../controllers/heartbeat"));

var _receiver = _interopRequireDefault(require("../controllers/receiver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PlatformSender extends _sender.default {
  constructor() {
    super(new _castv.Client(), 'sender-0', 'receiver-0');
    /**
     * ConnectionController
     * @type {ConnectionController}
     */

    this.connection = null;
    /**
     * HeartbeatController
     * @type {HeartbeatController}
     */

    this.heartbeat = null;
    /**
     * ReceiverController
     * @type {ReceiverController}
     */

    this.receiver = null;
  }
  /**
   * Connect
   * @param {Object} options - Options
   * @returns {Promise}
   */


  connect(options) {
    const self = this;
    return new Promise(resolve => {
      this.client.on('error', err => {
        this.emit('error', err);
      });
      this.client.connect(options, () => {
        this.connection = this.createController(_connection.default);
        this.heartbeat = this.createController(_heartbeat.default);
        this.receiver = this.createController(_receiver.default);

        function onStatus(status) {
          self.emit('status', status);
        }

        this.receiver.on('status', onStatus);
        this.client.once('close', () => {
          this.heartbeat.stop();
          this.receiver.removeListener('status', onStatus);
          this.receiver.close();
          this.heartbeat.close();
          this.connection.close();
          this.receiver = undefined;
          this.heartbeat = undefined;
          this.connection = undefined;
          super.close();
        });
        this.heartbeat.once('timeout', () => {
          this.emit('error', new Error('Device timeout'));
        });
        this.connection.connect();
        this.heartbeat.start();
        resolve();
      });
    });
  }
  /**
   * Close
   */


  close() {
    this.client.close();
  }
  /**
   * Get the status
   * @returns {Promise}
   */


  getStatus() {
    return this.receiver.getStatus();
  }
  /**
   * Get the sessions
   * @returns {Promise}
   */


  getSessions() {
    return this.receiver.getSessions();
  }
  /**
   * Get app availability
   * @param {String} appId - App ID
   * @returns {Promise}
   */


  getAppAvailability(appId) {
    return new Promise((resolve, reject) => {
      this.receiver.getAppAvailability(appId).then(availability => {
        for (key in availability) {
          availability[ky] = availability[key] === 'APP_AVAILABLE';
        }

        resolve(availability);
      }).catch(err => reject(err));
    });
  }
  /**
   * Join
   * @param {String} session - Session
   * @param {Application} application - Application
   * @returns {Promise}
   */


  join(session, application) {
    return new Promise(resolve => {
      process.nextTick(() => resolve(new application(this.client, session)));
    });
  }
  /**
   * Launch an application
   * @param {Application} application - Application
   * @returns {Promise}
   */


  launch(application) {
    return new Promise((resolve, reject) => {
      this.receiver.launch(application.APP_ID).then(sessions => {
        const filtered = sessions.filter(session => session.appId === application.APP_ID);
        const session = filtered.shift();
        return this.join(session, application).then(response => resolve(response)).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  }
  /**
   * Close an application and stop it
   * @param {Application} application - Application to stop
   * @returns {Promise}
   */


  stop(application) {
    const {
      session
    } = application;
    application.close();
    return this.receiver.stop(session.sessionId);
  }
  /**
   * Set the volume
   * @param {Object} volume - Volume
   * @returns {Promise}
   */


  setVolume(volume) {
    return this.receiver.setVolume(volume);
  }
  /**
   * Get the volume
   * @returns {Promise}
   */


  getVolume() {
    return this.receiver.getVolume();
  }

}

var _default = PlatformSender;
exports.default = _default;