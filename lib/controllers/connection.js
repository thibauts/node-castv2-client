var util            = require('util');
var debug           = require('debug')('castv2-client');
var JsonController  = require('./json');

class ConnectionController extends JsonController {
  constructor(client, sourceId, destinationId) {
    super(client, sourceId, destinationId, 'urn:x-cast:com.google.cast.tp.connection')

    this.on('message', this.onMessage)
    this.once('close', this.onClose)
  }

  onMessage(data, broadcast) {
    if (typeof data === 'object' && typeof data.type === 'string' && data.type === 'CLOSE') this.emit('disconnect')
  }

  onClose() {
    this.removeListener('message', this.onMessage)
  }
  /** 
   * Connect
   */
  connect() {
    this.send({
      type: 'CONNECT'
    })
  }
  
  /**
   * Disconnect
   */
  disconnect() {
    this.send({
      type: 'CLOSE'
    })
  }
}

module.exports = ConnectionController;