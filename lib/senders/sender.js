import debugFactory from 'debug';
import { EventEmitter } from 'events';
import util from 'util';
import Controller from '../controllers/controller';

const debug = debugFactory('castv2-client');

class Sender extends EventEmitter {
  constructor(client, senderId, receiverId) {
    super();
    this.client = client;
    this.senderId = senderId;
    this.receiverId = receiverId;
  }

  /**
   * Close the Sender
   */
  close() {
    this.senderId = undefined;
    this.receiverId = undefined;
    this.client = undefined;
  }

  /**
   * Create a controller using the Sender's properties
   * @param {Controller} controller
   * @param {*} args
   */
  createController(controller, ...args) {
    return new controller(this.client, this.senderId, this.receiverId, ...args);
  }
}

export default Sender;
