const googleTTS = require('google-tts-api');
const logger = require('../../log/logger');

class GoogleTTS {
    static init() {

    }

    static replace(mediaList) {
        return new Promise( function(resolve, reject) {

            let googleTTSPromised = 0;
            let googleTTSResolved = 0;
            let that = this;

            mediaList.forEach(function(mediaElement, index){
                if (mediaElement.googleTTS && mediaElement.googleTTS!=null) {
                    if (mediaElement.media.metadata.title.length > 200) {
                        let messageParts = that.splitGoogleTTS(mediaElement.media.metadata.title);

                        messageParts.forEach(function(part, partIndex) {
                            let newMediaElement = JSON.parse(JSON.stringify(mediaElement));
                            newMediaElement.media.metadata.title = part;
                            logger.log('debug', 'that.splitGoogleTTS()', 'partIndex: '+partIndex+', part: '+ part + ', mediaList: '+JSON.stringify(mediaList));
                            if (partIndex === 0) {
                                mediaList.splice(index, 1, newMediaElement);
                            } else {
                                mediaList.splice(index+partIndex, 0, newMediaElement);
                            }
                        });
                    }
                }
            });

            mediaList.forEach(function(mediaElement){
                if (mediaElement.googleTTS && mediaElement.googleTTS!=null) {
                    googleTTSPromised++;
                } else {
                    delete mediaElement.googleTTS
                }
            });

            mediaList.forEach(function(mediaElement, index){
                if (mediaElement.googleTTS && mediaElement.googleTTS!=null) {
                    googleTTS(mediaElement.media.metadata.title, mediaElement.googleTTS, 1)
                        .then(function (url) {
                            mediaElement.media.contentId = url;
                            mediaElement.media.mediaType = 'audio/mp3';
                            mediaElement.media.mediaStreamType = 'BUFFERED';
                            googleTTSResolved++;
                            if (googleTTSResolved === googleTTSPromised) {
                                resolve(mediaList);
                            }
                        })
                        .catch(function (err) {
                            logger.log('error', 'this.splitGoogleTTS()', 'googleTTS error: '+err);
                            mediaList.splice(index, 1);
                            googleTTSPromised--;
                            if (googleTTSResolved === googleTTSPromised) {
                                resolve(mediaList);
                            }
                        })
                }
            });

            if (googleTTSResolved === googleTTSPromised) {
                resolve(mediaList);
            }

            setTimeout(function() {
                reject('Google TTS timeout.');
            }, 5000);
        });
    }

    static splitGoogleTTS(message) {
        let messageChunks = message.split(' ');
        let messagesIndex = 0;
        let messages = [];

        messageChunks.forEach(function(chunk) {
            let added = false;

            while(added === false) {
                if (messages[messagesIndex]) {
                    if (chunk.length > 200) {
                        messagesIndex++;
                        messages[messagesIndex] = chunk.substring(0, 200);
                        chunk = chunk.substring(200);
                    }
                    if (!messages[messagesIndex]) {
                        messages[messagesIndex] = '';
                    }
                    if (messages[messagesIndex].length+1+chunk.length <= 200) {
                        messages[messagesIndex] = messages[messagesIndex]+' '+chunk;
                        added = true;
                    } else {
                        messagesIndex++;
                    }
                } else {
                    if (chunk.length > 200) {
                        messages[messagesIndex] = chunk.substring(0, 200);
                        chunk = chunk.substring(200);
                        messagesIndex++;
                    }
                    messages[messagesIndex] = chunk;
                    added = true;
                }
            }
        });

        return messages;
    };
}

module.exports = GoogleTTS;