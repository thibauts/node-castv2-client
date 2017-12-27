var util            = require('util');
var debug           = require('debug')('castv2-client');
var JsonController  = require('./json');

class RequestResponseController extends JsonController {
  constructor(client, sourceId, destinationId, namespace) {
    super(client, sourceId, destinationId, namespace)
    this.lastRequestId = 0
  }

  request(data) {
    return new Promise(function (resolve, reject) {
      let requestId = ++this.lastRequestId
      function onMessage(response, broadcast) {
        if (response.requestId === requestId) {
          this.removeListener('message', onMessage)
          if (response.type === 'INVALID_REQUEST') return reject(new Error(`Invalid request: ${response.reason}`))
          delete response.requestId
          return resolve(response)
        }
      }
      this.on('message', onMessage)
      data.requestId = requestId
      this.send(data)
    })
  }
}

module.exports = RequestResponseController;