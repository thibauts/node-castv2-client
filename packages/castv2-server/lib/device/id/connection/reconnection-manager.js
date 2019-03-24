const logger = require('../../../log/logger');
const configuration = require("../../../config/config");

class ReconnectionManager {
    constructor(device) {
        this._device = device;
        this._interval = null;

        this.setListener();
    }

    setListener() {
        this._device.on('linkChanged', () => {
            this.evaluate();
        });
    }

    evaluate() {
        logger.log('info', 'ReconnectionManager.evaluate()', 'this._device.link: ' +  this._device.link + ', _interval: ' + this._interval, this._device.id);

        if (this._device.link === 'disconnected') {
            if (this._interval == null) {
                this._interval = 'starting';
                logger.log('info', 'ReconnectionManager.evaluate()', 'starting interval', this._device.id);
                if (configuration._reconnectTimeout > 0) {
                    logger.log('info', 'ReconnectionManager.evaluate()', 'setting interval, timeout: '+configuration.reconnectTimeout, this._device.id);
                    this._interval = setInterval(() => {
                        this.reconnect();
                    }, configuration.reconnectTimeout); //TODO: fix multiple reconnects if .connect() was called multiple times
                }
            }
        } else {
            logger.log('info', 'ReconnectionManager.evaluate()', 'this._device.link !== disconnected', this._device.id);
            if (this._interval != null) {
                logger.log('info', 'ReconnectionManager.evaluate()', 'clearInterval()', this._device.id);
                clearInterval(this._interval);
                this._interval = null;
            }
        }
    }

    reconnect() {
        logger.log('info', 'ReconnectionManager.reconnect()', '', this._device.id); //TODO: device has new address, recon man tries to reconnect to old address?
        if (this._device.link !== 'connected' && this._device.link !== 'connecting') {
            logger.log('info', 'ReconnectionManager.reconnect()', 'this._device.connect()', this._device.id);
            this._device.connect();
        }
    }

    stop() {
        logger.log('info', 'ReconnectionManager.stop()', '', this._device.id);
        if (this._interval != null) {
            clearInterval(this._interval);
            this._interval = null;
        }
    }
}

module.exports = ReconnectionManager;