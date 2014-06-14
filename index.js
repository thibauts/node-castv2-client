module.exports.Controller                 = require('./lib/controllers/controller');
module.exports.JsonController             = require('./lib/controllers/json');
module.exports.RequestResponseController  = require('./lib/controllers/request-response');
module.exports.ConnectionController       = require('./lib/controllers/connection');
module.exports.HeartbeatController        = require('./lib/controllers/heartbeat');
module.exports.ReceiverController         = require('./lib/controllers/receiver');
module.exports.MediaController            = require('./lib/controllers/media');

module.exports.Client = module.exports.PlatformSender   = require('./lib/senders/platform');
module.exports.DefaultMediaReceiver                     = require('./lib/senders/default-media-receiver');