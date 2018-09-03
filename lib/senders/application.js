import debugFactory from 'debug';
import util from 'util';
import ConnectionController from '../controllers/connection';
import Sender from './sender';

const debug = debugFactory('castv2-client');

class Application extends Sender {
  constructor(client, session) {
    super(client, randomSenderId(), session.transportId);
    this.session = session;
    this.connection = this.createController(ConnectionController);
    this.connection.connect();
    const self = this;
    function onDisconnect() {
      self.emit('close');
    }
    function onClose() {
      self.connection.removeListener('disconnect', onDisconnect);
      self.connection.close();
      self.connection = undefined;
      self.session = undefined;
      self.superClose();
    }
    this.connection.on('disconnect', onDisconnect);
    this.once('close', onClose);
  }

  superClose() {
    super.close();
  }

  close() {
    this.connection.disconnect();
    this.emit('close');
  }
}

function randomSenderId() {
  return `client-${Math.floor(Math.random() * 10e5)}`;
}

Application.APP_ID = 'CC1AD845';

export default Application;
