const Client = require('castv2').Client;
const events = require('events');
const logger = require('../../../log/logger');
const requestId = require('./request-id-manager');

class CastReceiver extends events {
    constructor(address, id) {
        super();

        this._address = address;
        this._client = null;
        this._connection = null;
        this._heartbeat = null;
        this._id = id;
        this._receiver = null;
        this._heartBeatIntervall = null;
        this._sessionId = null;
        this._link = 'disconnected';

        this._status = {
            volume: 0,
            muted: false,
            application: ''
        };
    }

    connect() {
        try {
            logger.log('info', 'CastReceiver.connect()', 'host: ' + this._address.host + ', port: ' + this._address.port, this._id );
            let that = this;
            this._client = new Client();
            this.link = 'disconnected';

            this._client.connect(this._address, function() {
                try {
                    that._connection = that._client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
                    that._heartbeat = that._client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.heartbeat', 'JSON');
                    that._receiver = that._client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.receiver', 'JSON');

                    that._receiver.on('message', function(data, broadcast) {
                        console.log("message broadcast: "+broadcast);
                        that.parse(data);
                        that.link = 'connected';
                    });

                    that._receiver.on('error', function(error) {
                        logger.log('error', 'CastReceiver.connect()', 'receiver error: '+error, that._id);
                        that.disconnect();
                    });

                    that._connection.on('error', function(error) {
                        logger.log('error', 'CastReceiver.connect()', 'connection error: '+error, that._id);
                        that.disconnect();
                    });

                    that._heartBeatIntervall = setInterval(function() {
                        // if (that._heartbeat) { //TODO: 'CastReceiver.connect(): heartBeatIntervall exception: TypeError: Cannot read property 'send' of null'
                            try {
                                that._heartbeat.send({ type: 'PING' });
                            } catch (e) {
                                logger.log('error', 'CastReceiver.connect()', 'heartBeatIntervall exception: '+e, that._id);
                                that.disconnect();
                            }
                        // }
                    }, 5000);

                    that._connection.send({ type: 'CONNECT' });
                    that.link = 'connecting';
                    that._receiver.send({ type: 'GET_STATUS', requestId: requestId.get() });
                } catch (e) {
                    logger.log('error', 'CastReceiver.connect()', 'exception: '+e, that._id);
                    that.disconnect();
                }
            });
            this._client.on('error', function(err) {
                logger.log('error', 'CastReceiver.connect()', 'castDevice.castConnectionReceiver.client error: '+err, that._id);
                that.disconnect();
            });
        } catch (e) {
            logger.log('error', 'CastReceiver.connect()', 'exception: '+e, this._id);
            this.disconnect();
        }
    };

    parse(receiverStatus) {
        try {
            logger.log('info', 'CastReceiver.parse()', 'receiverStatus: ' + JSON.stringify(receiverStatus), this._id );

            if (receiverStatus.type === 'RECEIVER_STATUS') {
                if (receiverStatus.status.applications) {
                        if (receiverStatus.status.applications[0].isIdleScreen!==true) {
                            logger.log('info', 'CastReceiver.parse()', 'isIdleScreen: '+receiverStatus.status.applications[0].isIdleScreen+', sessionId changed to: '+receiverStatus.status.applications[0].sessionId+', from: '+this._sessionId, this._id);
                            this.sessionId = receiverStatus.status.applications[0].sessionId;
                        }
                    if ( receiverStatus.status.applications[0].displayName ) {
                        this.status = { 'application': receiverStatus.status.applications[0].displayName };
                    }
                } else {
                    logger.log('info', 'CastReceiver.parse()', 'resetting', this._id);
                    this.sessionId = null;
                    this.status = { 'application': '' };
                }
                if (receiverStatus.status.volume) {
                    this.status = {
                        'volume': Math.round(receiverStatus.status.volume.level*100),
                        'muted': receiverStatus.status.volume.muted
                    };
                }
            }
        } catch(e) {
            logger.log('error', 'CastReceiver.parse()', 'exception: '+e, this._id);
        }
    }

    disconnect() {
        logger.log('info', 'CastReceiver.disconnect()', 'host: ' + this._address.host + ', port: ' + this._address.port + ', heartbeat: '+this._heartBeatIntervall, this._id );
        try {
            clearInterval(this._heartBeatIntervall); //TODO: check if exists
            if (this._link !== 'disconnected') {
                this.link = 'disconnected';
                this.sessionId = null; //TODO: maybe causes disconnect routine to fire twice
                //castDevice.castConnectionReceiver.connection.send({ type: 'CLOSE' });
                this._client.close();
                delete this._receiver; //TODO: better set null?
            }
        } catch (e) {
            //castDevice.castConnectionReceiver = null;
            logger.log('error', 'CastReceiver.disconnect()', 'exception: '+e, this.id);
        }
    };

    volume(targetLevel) {
        logger.log('info', 'CastReceiver.volume()', targetLevel, this.id);
        if (this._receiver && this.link === 'connected') {
            this._receiver.send({ type: 'SET_VOLUME', volume: { level: targetLevel }, requestId: requestId.get() });
            return {response:'ok'};
        } else {
            return {response:'error', error:'disconnected'};
        }
    }

    muted(isMuted) {
        logger.log('info', 'CastReceiver.muted()', isMuted, this.id);
        if (this._receiver && this.link === 'connected') {
            this._receiver.send({ type: 'SET_VOLUME', volume: { muted: isMuted }, requestId: requestId.get() });
            return {response:'ok'};
        } else {
            return {response:'error', error:'disconnected'};
        }
    }

    stop() {
        logger.log('info', 'CastReceiver.stop()', '', this.id);
        if (this._sessionId && this.link === 'connected') {
            this._receiver.send({ type: 'STOP', sessionId: this.sessionId, requestId: requestId.get() });
            return {response:'ok'};
        } else {
            return {response:'error', error:'nothing playing'};
        }
    }

    get link() {
        return this._link;
    }

    set link(value) { //TODO: should be private
        if (value === "connecting" || value === "connected" || value === "disconnected") {
            this._link = value;
            this.emit('linkChanged', value);
        }
    }


    get status() {
        return this._status;
    }

    set status(status) {
        let changed = false;
        for (let key in status) {
            let value = status[key];
            if (this.status[key] !== value) {
                this.status[key] = value;
                changed = true;
            }
        }

        if (changed) {
            this.emit('statusChanged', this._status);
        }
    }

    get sessionId() {
        return this._sessionId;
    }

    set sessionId(value) {
        logger.log('info', 'castReceiver.setSessionId', value, this._id);
        if (value !== this._sessionId) {
            logger.log('info', 'castReceiver.setSessionId', 'did set: '+value, this._id);
            this._sessionId = value;
            this.emit('sessionIdChanged', value);
        }
    }

    set address(value) {
        this._address = value;
    }
}

module.exports = CastReceiver;