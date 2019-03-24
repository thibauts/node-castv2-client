const logger = require('../../log/logger');
const url = require('url');
const http = require('http');

class Callback {
    constructor(callbackUrl, device) {
        logger.log('debug', 'Callback ()', 'callbackUrl: '+ JSON.stringify(callbackUrl), device.id);
        this._device = device;
        this._url = null;

        try {
            this._url = url.parse(`http://${callbackUrl}`);
        } catch(e) {
            console.log(e);
            //TODO:
        }

        this._device.on('statusChanged', this.trigger);
        this.send(this._device.toObject());
    }

    stop() { //TODO: is this required?
        logger.log('info', 'Callback.stop()', '', this._device.id);
        this._device.removeListener('statusChanged', this.trigger);
    }

    trigger() { //Beware of context: this==CastDevice, this!=Callback
        this.callback.send(this.toObject());
    }

    send(status) {
        logger.log( 'info', 'Callback.send()', 'to: '+ JSON.stringify(this._url) +', status: ' + JSON.stringify(status), status.id );

        try {
            let data = JSON.stringify(status);

            let options = {
                hostname: this._url.hostname,
                port: this._url.port,
                path: this._url.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data) //TODO: without import?
                }
            };

            let req = http.request(options, res => {
                res.setEncoding('utf8');
            });

            req.on('error', err => {
                logger.log('error', 'sendCallBack()', 'cannot send callback: ' + JSON.stringify(this._url) + ', err: ' + err, status.id);
            });

            req.write(data);
            req.end();
        } catch (e) {
            logger.log('error', 'sendCallBack()', 'cannot send callback: ' + JSON.stringify(this._url) + ', error: ' + e, status.id);
        }
    }
}

module.exports = Callback;