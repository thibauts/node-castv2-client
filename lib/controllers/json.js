const Controller    = require('./controller');
const debug         = require('debug')('castv2-client');
const util          = require('util');

class JsonController extends Controller {
  constructor(client, sourceId, destinationId, namespace) {
    super(client, sourceId, destinationId, namespace, 'JSON')
  }
}

module.exports = JsonController;