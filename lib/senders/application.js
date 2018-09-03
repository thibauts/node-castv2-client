const ConnectionController  = require('../controllers/connection');
const debug                 = require('debug')('castv2-client');
const Sender                = require('./sender');
const util                  = require('util');

class Application extends Sender {
  constructor(client, session) {
    super(client, randomSenderId(), session.transportId)
    this.session = session
    this.connection = this.createController(ConnectionController)
    this.connection.connect()
    const self = this
    function onDisconnect() {
      self.emit('close')
    }
    function onClose() {
      self.connection.removeListener('disconnect', onDisconnect)
      self.connection.close()
      self.connection = undefined
      self.session = undefined
      self.superClose()
    }
    this.connection.on('disconnect', onDisconnect)
    this.once('close', onClose)
  }
  superClose() {
    super.close()
  }
  close() {
    this.connection.disconnect()
    this.emit('close')
  }
}

function randomSenderId() {
  return 'client-' + Math.floor(Math.random() * 10e5);
}

Application.APP_ID = 'CC1AD845';

module.exports = Application;