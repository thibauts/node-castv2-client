import debugFactory from 'debug';
import JsonController from './json';

class RequestResponseController extends JsonController {
  constructor(client, sourceId, destinationId, namespace) {
    super(client, sourceId, destinationId, namespace);
    this.lastRequestId = 0;
  }

  /**
   * Object to request
   * @param {Object} data - data
   */
  request(data) {
    return new Promise((resolve, reject) => {
      const requestId = ++this.lastRequestId;
      const self = this;
      function onMessage(response) {
        if (response.requestId === requestId) {
          self.removeListener('message', onMessage);
          if (response.type === 'INVALID_REQUEST') return reject(new Error(`Invalid request: ${response.reason}`));
          delete response.requestId;
          return resolve(response);
        }
      }
      this.on('message', onMessage);
      data.requestId = requestId;
      this.send(data);
    });
  }
}

export default RequestResponseController;
