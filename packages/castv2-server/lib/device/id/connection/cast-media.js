const Client = require('castv2').Client;
const events = require('events');
const logger = require('../../../log/logger');
const requestId = require('./request-id-manager');

class CastMedia extends events {
    constructor(address, id) {
        super();

        this._address = address;
        this._client = null;
        this._connection = null;
        this._heartbeat = null;
        this._id = id;
        this._media = null;
        this._heartBeatIntervall = null;
        this._sessionId = null;
        this._mediaSessionId = null; //TODO: why is this unused?
        this._link = 'disconnected';

        this._status = {
            status: '',
            title: '',
            subtitle: '',
            image: ''
        };
    }

    connect(sessionId) {
        if (sessionId) {
            this._sessionId = sessionId;
            try {
                logger.log('info', 'CastMedia.connect()', 'host: ' + this._address.host + ', port: ' + this._address.port + ', sessionId: ' + this._sessionId, this._id);
                let that = this;
                this._client = new Client();

                this._client.connect(this._address, function() { //TODO: use address => {}
                    try {
                        that._connection = that._client.createChannel('sender-0', that._sessionId, 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
                        that._heartbeat = that._client.createChannel('sender-0', that._sessionId, 'urn:x-cast:com.google.cast.tp.heartbeat', 'JSON');
                        that._media = that._client.createChannel('sender-0', that._sessionId, 'urn:x-cast:com.google.cast.media', 'JSON');

                        that._media.on('message', function(data, broadcast) {
                            that.parse(data);
                            that.link = 'connected';
                        });

                        that._media.on('error', function(error) {
                            logger.log('error', 'CastMedia.connect()', 'media error: '+error, that._id);
                            that.disconnect();
                        });

                        that._connection.on('error', function(error) {
                            logger.log('error', 'CastMedia.connect()', 'connection error: '+error, that._id);
                            that.disconnect();
                        });

                        that._heartBeatIntervall = setInterval(function() {
                            try {
                                if (that._media && that.link==='connected') {
                                    that._heartbeat.send({ type: 'PING' });
                                }
                            } catch(e) {
                                logger.log('error', 'CastMedia.connect()', 'heartbeat exception: '+e, that._id);
                                that.disconnect();
                            }
                        }, 5000);

                        that._connection.send({ type: 'CONNECT' });
                        that._media.send({ type: 'GET_STATUS', requestId: requestId.get() });
                    } catch(e) {
                        logger.log('error', 'CastMedia.connect()', 'exception: '+e, that._id);
                        that.disconnect();
                    }
                });
                this._client.on('error', function(err) {
                    logger.log('error','CastMedia.connect()', 'client error: '+err, that._id);
                    that.disconnect();
                });
            } catch(e) {
                logger.log('error', 'CastMedia.connect()', 'exception: '+e, this._id);
                this.disconnect();
            }
        }
    };

    parse(mediaStatus) {
        try {
            logger.log('info', 'CastMedia.parse()', 'mediaStatus: ' + JSON.stringify(mediaStatus), this._id );

            if (mediaStatus.type === 'MEDIA_STATUS') {
                if (mediaStatus.status[0]) {
                    if (mediaStatus.status[0].media) {
                        if (mediaStatus.status[0].media.metadata) {
                            let metadataType = mediaStatus.status[0].media.metadata.metadataType;
                            if(metadataType<=1) {
                                this.status = {
                                    'title': mediaStatus.status[0].media.metadata.title,
                                    'subtitle': mediaStatus.status[0].media.metadata.subtitle
                                };
                            }
                            if(metadataType===2) {
                                this.status = {
                                    'title': mediaStatus.status[0].media.metadata.seriesTitle,
                                    'subtitle': mediaStatus.status[0].media.metadata.subtitle
                                };
                            }
                            if(metadataType>=3 && metadataType<=4) {
                                this.status = {
                                    'title': mediaStatus.status[0].media.metadata.title,
                                    'subtitle': mediaStatus.status[0].media.metadata.artist
                                };
                            }
                            if (metadataType>=0 && metadataType<4) {
                                this.status = {
                                    'image': mediaStatus.status[0].media.metadata.images[0].url
                                };
                            }
                        }
                    }

                    if (mediaStatus.status[0].mediaSessionId) {
                        this._mediaSessionId = mediaStatus.status[0].mediaSessionId;
                    }

                    if (mediaStatus.status[0].playerState) {
                        this.status = {
                            'status':  mediaStatus.status[0].playerState
                        };
                    }
                }
            }
        } catch(e) {
            logger.log('error', 'CastMedia.parse()', 'exception: '+e, this._id);
        }
    }

    disconnect() {
        if (this._media) {
            logger.log('info', 'CastMedia.disconnect()', 'host: ' + this._address.host + ', port: ' + this._address.port, this._id);
            try {
                clearInterval(this._heartBeatIntervall);
                if (this._media!=null) {
                    //castDevice._connection.send({ type: 'CLOSE' });
                    this._client.close();
                    this.link = 'disconnected';
                    this.status = {
                        status: '',
                        title: '',
                        subtitle: '',
                        image: ''
                    };
                    delete this._media;
                }
            } catch(e) {
                logger.log('error', 'CastMedia.disconnect()', 'exception: '+e, this.id);
                //castDevice.castConnectionMedia = null;
            }
        }
    };

    play() {
        logger.log('info', 'CastMedia.play()', 'this._media:' +this._media + 'this.link: '+this.link, this.id);
        if (this._media != null && this.link === 'connected' && this._sessionId && this._mediaSessionId) {
            try {
                this._media.send({ type: 'PLAY', requestId: requestId.get(), mediaSessionId: this._mediaSessionId, sessionId: this._sessionId });
                return {response:'ok'};
            } catch (e) {
                return {response: 'error', error: e};
            }
        } else {
            return {response:'error', error:'nothing playing'};
        }
    }

    pause() {
        logger.log('info', 'CastMedia.pause()', 'this._media:' +this._media + 'this.link: '+this.link, this.id);
        if (this._media != null && this.link === 'connected' && this._sessionId && this._mediaSessionId) {
            try {
                this._media.send({ type: 'PAUSE', requestId: requestId.get(), mediaSessionId: this._mediaSessionId, sessionId: this._sessionId });
                return {response:'ok'};
            } catch (e) {
                return {response: 'error', error: e};
            }
        } else {
            return {response:'error', error:'nothing playing'};
        }
    }

    seek(to) {
        logger.log('info', 'CastMedia.seek()', 'to: '+to, this.id);
        if (this._media != null && this.link === 'connected' && this._sessionId && this._mediaSessionId) {
            try {
                this._media.send({ type: 'SEEK', currentTime: to, requestId: requestId.get(), mediaSessionId: this._mediaSessionId, sessionId: this._sessionId });
                return {response:'ok'};
            } catch (e) {
                return {response: 'error', error: e};
            }
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

    set address(value) {
        this._address = value;
    }
}

module.exports = CastMedia;