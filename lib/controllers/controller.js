const debug         = require('debug')('castv2-client');
const EventEmitter  = require('events').EventEmitter;
const util          = require('util');

class Controller extends EventEmitter {
  constructor(client, sourceId, destinationId, namespace, encoding) {
    super()
    this.channel = client.createChannel(sourceId, destinationid, namespace, encoding)
    this.channel.on('message', this.onMessage)
    this.channel.once('close', this.onClose)
  }

  onMessage(data, broadcast) {
    this.emit('message', data, broadcast)
  }

  onClose() {
    this.channel.removeListener('message', this.onMessage)
    this.emit('close')
  }

  /**
   * Send data over the channel
   * @param {any} data - Data to send
   */
  send(data) {
    this.channel.send(data)
  }

  /**
   * Close the channel
   */
  close() {
    this.channel.close()
  }
}

module.exports = Controller;