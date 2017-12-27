var util                      = require('util');
var debug                     = require('debug')('castv2-client');
var RequestResponseController = require('./request-response');

class ReceiverController extends RequestResponseController {
  constructor(client, sourceId, destinationId) {
    super(client, sourceId, destinationId, 'urn:x-cast:com.google.cast.receiver')

    this.on('message', this.onMessage)
    this.on('close', this.onClose)
  }

  onMessage(data, broadcast) {
    if (!broadcast) return
    if (data.type === 'RECEIVER_STATUS') this.emit('status', data.status)
  }

  onClose() {
    this.removeListener('message', this.onMessage)
  }

  /**
   * Get the status
   * @returns {Promise}
   */
  getStatus() {
    return new Promise((resolve, reject) => {
      this.request({
        type: 'GET_STATUS'
      }).then((response) => resolve(response.status))
      .catch((err) => reject(err))
    })
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
      }
      this.request(data).then((response) => resolve(response.availability))
        .catch((err) => reject(err))
    })
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
        appId: appId
      }).then((response) => {
        if (response.type === 'LAUNCH_ERROR') return reject(new Error(`Launch failed. Reason: ${response.reason}`))
        resolve(response.status.applications || [])
      }).catch((err) => reject(err))
    })
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
        sessionId: sessionId
      }
      this.request(data).then((response) => resolve(response.status.applications || []))
        .catch((err) => reject(err))
    })
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
      }
      this.request(data).then((response) => resolve(response.status.volume || []))
        .catch((err) => reject(err))
    })
  }

  /**
   * Get the volume
   * @returns {Promise}
   */
  getVolume() {
    return new Promise((resolve, reject) => {
      this.getStatus().then((status) => {
        return resolve(status.volume)
      }).catch((err) => reject(err))
    })
  }

  /**
   * Get the sessions
   * @returns {Promise}
   */
  getSessions() {
    return new Promise((resolve, reject) => {
      this.getStatus().then((status) => {
        return resolve(status.applications || [])
      }).catch((err) => reject(err))
    })
  }
}

module.exports = ReceiverController;
