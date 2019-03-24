const Callback = require("./callback");
const logger = require("./../log/logger");

class CallbackManager {
    static init() {
        CallbackManager._callbacks = new Map();
    }

    static get callbacks() {
        let callbacks = [];
        CallbackManager._callbacks.forEach(callback => {
            callbacks.push(callback.toObject());
        });
        return callbacks;
    }

    static getCallback(url) {
        return CallbackManager._callbacks.get(url);
    }

    static setCallback(url, settings) {
        CallbackManager._callbacks.set(url, new Callback(url, settings));
    }

    static deleteCallback(url) {
        CallbackManager._callbacks.delete(url);
    }

    static send(status) {
        logger.info('CallbackManager.send()', 'status: '+JSON.stringify(status), '');
        CallbackManager._callbacks.forEach(callback => {
            callback.send(status);
        });
    }
}

module.exports = CallbackManager;