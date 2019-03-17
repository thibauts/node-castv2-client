import { Client } from 'castv2';
import debugFactory from 'debug';
import { EventEmitter } from 'events';

const debug = debugFactory('castv2-client');

export default class Controller extends EventEmitter {
  constructor(client: Client, sourceId: string, destinationId: string, namespace: string, encoding: string) {
    super();
    this.channel = client.createChannel(sourceId, destinationId, namespace, encoding);
    const self = this;
    function onMessage(data: Record<string, string>, broadcast: Record<string, string>) {
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
  send(data: Record<string, string>) {
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
