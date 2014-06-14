var util          = require('util');
var debug         = require('debug')('castv2-client');
var Controller    = require('./controller');

function JsonController(client, sourceId, destinationId, namespace) {
  Controller.call(this, client, sourceId, destinationId, namespace, 'JSON');
}

util.inherits(JsonController, Controller);

module.exports = JsonController;