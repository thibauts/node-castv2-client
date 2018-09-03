import Controller from './controller';

class JsonController extends Controller {
  constructor(client, sourceId, destinationId, namespace) {
    super(client, sourceId, destinationId, namespace, 'JSON');
  }
}

export default JsonController;
