var util            = require('util');
var debug           = require('debug')('castv2-client');
var JsonController  = require('./json');

class ConnectionController extends JsonController {
  constructor(client, sourceId, destinationId) {
    super(client, sourceId, destinationId, 'urn:x-cast:com.google.cast.tp.connection')
    const self = this
    function onMessage(data, broadcast) {
      if (data.type === 'CLOSE') self.emit('disconnect')
    }
    function onClose() {
      self.removeListener('message', onMessage)
    }
    this.on('message', onMessage)
    this.once('close', onClose)
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