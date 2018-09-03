"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _controller = _interopRequireDefault(require("./controller"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class JsonController extends _controller.default {
  constructor(client, sourceId, destinationId, namespace) {
    super(client, sourceId, destinationId, namespace, 'JSON');
  }

}

var _default = JsonController;
exports.default = _default;