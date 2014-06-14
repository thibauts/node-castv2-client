var util            = require('util');
var debug           = require('debug')('castv2-client');
var JsonController  = require('./json');

function RequestResponseController(client, sourceId, destinationId, namespace) {
  JsonController.call(this, client, sourceId, destinationId, namespace);

  this.lastRequestId = 0;
}

util.inherits(RequestResponseController, JsonController);

RequestResponseController.prototype.request = function(data, callback) {
  var requestId = ++this.lastRequestId;

  var self = this;

  function onmessage(response, broadcast) {
    if(response.requestId === requestId) {
      self.removeListener('message', onmessage);

      if(response.type === 'INVALID_REQUEST') {
        return callback(new Error('Invalid request: ' + response.reason));
      }

      delete response.requestId;
      callback(null, response);
    }
  }

  this.on('message', onmessage);
  
  data.requestId = requestId;
  this.send(data);
};

module.exports = RequestResponseController;