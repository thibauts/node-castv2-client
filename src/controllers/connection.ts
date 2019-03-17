import { Client } from 'castv2';
import JsonController from './json';

export default class ConnectionController extends JsonController {
  constructor(client: Client, sourceId: string, destinationId: string) {
    super(client, sourceId, destinationId, 'urn:x-cast:com.google.cast.tp.connection');
    const onMessage = (data: { type: string }) => {
      if (data.type === 'CLOSE') this.emit('disconnect');
    };
    const onClose = () => {
      this.removeListener('message', onMessage);
    };
    this.on('message', onMessage);
    this.once('close', onClose);
  }

  /**
   * Connect
   */
  connect() {
    this.send({
      type: 'CONNECT'
    });
  }

  /**
   * Disconnect
   */
  disconnect() {
    this.send({
      type: 'CLOSE'
    });
  }
}
