import debugFactory from 'debug';
import util from 'util';
import Controller from './controller';

const debug = debugFactory('castv2-client');

class JsonController extends Controller {
  constructor(client, sourceId, destinationId, namespace) {
    super(client, sourceId, destinationId, namespace, 'JSON');
  }
}

export default JsonController;
