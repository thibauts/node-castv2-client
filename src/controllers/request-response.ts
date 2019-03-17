import { Client } from 'castv2';
import JsonController from './json';

interface Response {
  requestId: number,
  type: string,
  reason: string
}

export default class RequestResponseController extends JsonController {
  public lastRequestId: number;

  constructor(client: Client, sourceId: string, destinationId: string, namespace: string) {
    super(client, sourceId, destinationId, namespace);
    this.lastRequestId = 0;
  }

  /**
   * Object to request
   * @param data - data
   */
  request(data: Record<string, any>): Promise<Response> {
    return new Promise((resolve, reject) => {
      const requestId = ++this.lastRequestId;
      const self = this;
      function onMessage(response: Response) {
        if (response.requestId === requestId) {
          self.removeListener('message', onMessage);
          if (response.type === 'INVALID_REQUEST') {
            return reject(new Error(`Invalid request: ${response.reason}`));
          }
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
