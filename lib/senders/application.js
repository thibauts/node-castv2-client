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

    this.connection.on('disconnect', this.onDisconnect)
    this.on('close', this.onClose)
  }

  onDisconnect() {
    this.emit('close')
  }

  onClose() {
    this.removeListener('close', this.onClose)
    this.connection.removeListener('disconnect', this.onDisconnect)
    this.connection.close()
    this.connection = undefined
    this.session = undefined
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

module.exports = Application;