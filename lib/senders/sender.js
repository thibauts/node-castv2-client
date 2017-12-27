const Controller    = require('../controllers/controller')
const debug         = require('debug')('castv2-client');
const EventEmitter  = require('events').EventEmitter;
const util          = require('util');

class Sender extends EventEmitter {
  constructor(client, senderId, receiverId) {
    super()
    this.client = client
    this.senderId = senderId
    this.receiverId = receiverId
  }
  
  /** 
   * Close the Sender
   */
  close() {
    this.senderId = undefined
    this.receiverId = undefined
    this.client = undefined
  }

  /**
   * Create a controller using the Sender's properties
   * @param {Controller} controller 
   * @param {*} args 
   */
  createController(controller, ...args) {
    return new controller(this.client, this.senderId, this.receiverId, ...args)
  }
}

module.exports = Sender;