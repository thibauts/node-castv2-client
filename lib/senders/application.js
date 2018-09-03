"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _connection = _interopRequireDefault(require("../controllers/connection"));

var _sender = _interopRequireDefault(require("./sender"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function randomSenderId() {
  return `client-${Math.floor(Math.random() * 10e5)}`;
}

class Application extends _sender.default {
  constructor(client, session) {
    super(client, randomSenderId(), session.transportId);
    this.session = session;
    this.connection = this.createController(_connection.default);
    this.connection.connect();
    const self = this;

    function onDisconnect() {
      self.emit('close');
    }

    function onClose() {
      self.connection.removeListener('disconnect', onDisconnect);
      self.connection.close();
      self.connection = undefined;
      self.session = undefined;
      self.superClose();
    }

    this.connection.on('disconnect', onDisconnect);
    this.once('close', onClose);
  }

  superClose() {
    super.close();
  }

  close() {
    this.connection.disconnect();
    this.emit('close');
  }

}

Application.APP_ID = 'CC1AD845';
var _default = Application;
exports.default = _default;