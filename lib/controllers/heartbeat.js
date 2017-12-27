const JsonController  = require('./json');
const debug           = require('debug')('castv2-client');
const util            = require('util');

const DEFAULT_INTERVAL = 5; // seconds
const TIMEOUT_FACTOR = 3; // timeouts after 3 intervals

class HeartbeatController extends JsonController {
  constructor(client, sourceId, destinationId) {
    super(client, sourceId, destinationId, 'urn:x-cast:com.google.cast.tp.heartbeat')
    this.pingTimer = null
    this.timeout = null
    this.intervalValue = DEFAULT_INTERVAL

    this.on('message', this.onMessage)
    this.once('close', this.onClose)
  }

  onMessage(data, broadcast) {
    if(typeof data === 'object' && typeof data.type === 'string' && data.type === 'PONG') this.emit('pong')
  }

  onClose() {
    this.removeListener('message', this.onMessage)
    this.stop()
  }

  ping() {
    if (this.timeout) return  // We already have a ping in progress.
     
    this.timeout = setTimeout(function() {
      this.emit('timeout')
    }, this.intervalValue * 1000 * TIMEOUT_FACTOR)

    this.once('pong', function() {
      clearTimeout(this.timeout)
      this.timeout = null

      this.pingTimer = setTimeout(function() {
        this.pingTimer = null
        this.ping()
      }, this.intervalValue * 1000)
    })

    this.send({
      type: 'PING' 
    })
  }

  start(intervalValue) {
    this.intervalValue = intervalValue || this.intervalValue
    this.ping()
  }

  stop() {
    if (this.pingTimer) clearTimeout(this.pingTimer)
    if (this.timeout) clearTimeout(this.timeout)
    this.removeAllListeners('pong')
  }
}

module.exports = HeartbeatController;