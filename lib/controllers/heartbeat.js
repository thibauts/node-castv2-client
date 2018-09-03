"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _debug = _interopRequireDefault(require("debug"));

var _json = _interopRequireDefault(require("./json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug.default)('castv2-client');
const DEFAULT_INTERVAL = 5; // seconds

const TIMEOUT_FACTOR = 3; // timeouts after 3 intervals

class HeartbeatController extends _json.default {
  constructor(client, sourceId, destinationId) {
    super(client, sourceId, destinationId, 'urn:x-cast:com.google.cast.tp.heartbeat');
    this.pingTimer = null;
    this.timeout = null;
    this.intervalValue = DEFAULT_INTERVAL;
    const self = this;

    function onMessage(data) {
      if (data.type === 'PONG') self.emit('pong');
    }

    function onClose() {
      self.removeListener('message', onMessage);
      self.stop();
    }

    this.on('message', onMessage);
    this.once('close', onClose);
  }

  ping() {
    debug('Received a .ping() before checking timeout');
    if (this.timeout) return; // We already have a ping in progress.

    debug('We do not have a timeout, so we are continuing');
    this.timeout = setTimeout(() => {
      this.emit('timeout');
    }, this.intervalValue * 1000 * TIMEOUT_FACTOR);
    this.once('pong', () => {
      clearTimeout(this.timeout);
      this.timeout = null;
      this.pingTimer = setTimeout(() => {
        this.pingTimer = null;
        this.ping();
      }, this.intervalValue * 1000);
    });
    this.send({
      type: 'PING'
    });
  }

  start(intervalValue) {
    this.intervalValue = intervalValue || this.intervalValue;
    this.ping();
  }

  stop() {
    if (this.pingTimer) clearTimeout(this.pingTimer);
    if (this.timeout) clearTimeout(this.timeout);
    this.removeAllListeners('pong');
  }

}

var _default = HeartbeatController;
exports.default = _default;