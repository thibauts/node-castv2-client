import debugFactory from 'debug';
import { EventEmitter } from 'events';

const debug = debugFactory('castv2-client');

class Controller extends EventEmitter {
  constructor(client, sourceId, destinationId, namespace, encoding) {
    super();
    this.channel = client.createChannel(sourceId, destinationId, namespace, encoding);
    const self = this;
    function onMessage(data, broadcast) {
      self.emit('message', data, broadcast);
    }
    function onClose() {
      self.channel.removeListener('message', onMessage);
      self.emit('close');
    }
    this.channel.on('message', onMessage);
    this.channel.once('close', onClose);
  }

  /**
   * Send data over the channel
   * @param {any} data - Data to send
   */
  send(data) {
    debug('Sending', data);
    this.channel.send(data);
  }

  /**
   * Close the channel
   */
  close() {
    this.channel.close();
  }
}

export default Controller;
