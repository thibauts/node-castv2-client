const Castv2Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
const GoogleTts = require('../google-tts');
const logger = require('../../../log/logger');

class CastDefaultMediaReceiver {
    constructor(address, id) {
        this._address = address;
        this._id = id;
        this._castv2Client = null;
    }

    play(media) {
        try {
            logger.log('info', 'CastDevice.playMedia()', 'media: ' + JSON.stringify(media), this._id);

            this._castv2Client = new Castv2Client();
            let mediaList = [];
            let that = this;

            media.forEach(function(element, index) {
                let mediaElement =  {
                    autoplay : true,
                    preloadTime : 5,
                    activeTrackIds : [],
                    googleTTS: element.googleTTS,
                    //playbackDuration: 4,
                    //startTime : 1,
                    media: {
                        contentId: element.mediaUrl,
                        contentType: element.mediaType,
                        streamType: element.mediaStreamType,
                        metadata: {
                            type: 0,
                            metadataType: 0,
                            title: element.mediaTitle,
                            subtitle: element.mediaSubtitle,
                            images: [ { url: element.mediaImageUrl } ]
                        }
                    }
                };
                logger.log('info', 'CastDevice.playMedia()', 'mediaElement: ' + JSON.stringify(mediaElement), that.id);
                mediaList.push(mediaElement);
            });

            GoogleTts.replace(mediaList) //TODO:
                .then(newMediaList => {
                    logger.log('info', 'CastDevice.playMedia()', 'newMediaList: ' + JSON.stringify(newMediaList), that.id);

                    this._castv2Client.connect(this._address, () => {
                        this._castv2Client.launch(DefaultMediaReceiver, function(err, player) {
                            player.queueLoad(newMediaList, {startIndex:0, repeatMode: "REPEAT_OFF"}, function(err, status) {
                                logger.log('info', 'CastDevice.playMedia()', 'loaded queue: ' + status, that.id);
                            });
                        });
                    });

                    setTimeout(() => {
                        try{ this._castv2Client.close(); } catch(e) { logger.log('error', 'CastDevice.playMedia()', 'this._castv2Client.close() exception: '+e, that.id ); }
                    }, 5000);
                })
                .catch(error => {
                    logger.log('error', 'CastDevice.playMedia()', 'replaceGoogleTts error: '+error, that.id );
                });

            return {response:'ok'};
        } catch(e) {
            logger.log('error', 'CastDevice.playMedia()', 'exception: '+e, this._id );
        }
    }
}

module.exports = CastDefaultMediaReceiver;