import { EventEmitter } from 'events';

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
  createController(Controller, ...args) {
    return new Controller(this.client, this.senderId, this.receiverId, ...args);
  }
}

export default Sender;
