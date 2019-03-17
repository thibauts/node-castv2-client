import { Client } from 'castv2';
import { EventEmitter } from 'events';
import Controller from '../controllers/controller'

export default class Sender extends EventEmitter {
  client: Client;

  senderId: string | undefined;

  receiverId: string | undefined;

  constructor(client: Client, senderId: string, receiverId: string) {
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
  createController(Controller: Controller, ...args) {
    return new Controller(this.client, this.senderId, this.receiverId, ...args);
  }
}
