var PlatformSender                = require('../index').PlatformSender;
var DefaultMediaReceiver  = require('../index').DefaultMediaReceiver;
var scanner               = require("chromecast-scanner");


function ondeviceup(host, callback) {
  /**
   * Client
   * @type {PlatformSender}
   */
  var client = new PlatformSender();

  client.connect(host).then(() => {
    console.log('connected, launching app ...')
    client.launch(DefaultMediaReceiver).then((player) => {
      const media = {
        // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
        contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
        contentType: 'video/mp4',
        streamType: 'BUFFERED', // or LIVE

        // Title and cover displayed while buffering
        metadata: {
          type: 0,
          metadataType: 0,
          title: "Big Buck Bunny", 
          images: [
            { url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
          ]
        }        
      }
      player.on('status', (status) => console.log('status broadcast playerState=%s', status.playerState))
      console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId)
      player.load(media, {
        autoplay: true
      }).then((status) => {
        console.log('media loaded playerState=%s', status.playerState);
        // Seek to 2 minutes after 5 seconds playing.
        setTimeout(function() {
          console.log('seeking')
          player.seek(2*60, function(err, status) {
            // Stop after 2 seconds playing
            setTimeout(function() {
              console.log('Stopping')
              player.stop(function() {
                console.log('Done!')
                callback(0)
              })
            }, 2000)
          })
        }, 5000)
      }).catch((err) => {
        console.error('Media load error!', err)
        callback(err)
      })
    }).catch((err) => {
      console.error('Launch error!', err)
      callback(err)
    })
  }).catch((err) => {
    console.error('Connection error!', err)
    callback(err)
  })


  client.on('error', function(err) {
    console.log('Error: %s', err.message)
    client.close()
    callback(err)
  });

}

function findAndConnect(callback) {
  scanner(function(err, service) {
    console.log('chromecast %s running on: %s', service.name, service.data);
    ondeviceup(service.data, callback);
  });
}

//module for testcase
module.exports = findAndConnect;

//main
var main = function () { 
  findAndConnect(function(rc){
    process.exit(rc);
  });
} 
if (require.main === module) { 
    main(); 
}
