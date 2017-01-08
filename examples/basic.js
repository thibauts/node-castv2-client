var MYPATH = "../index"; //castv2-client in production

var Client                = require(MYPATH).Client;
var DefaultMediaReceiver  = require(MYPATH).DefaultMediaReceiver;
var scanner               = require('chromecast-scanner');

function ondeviceup(host, callback) {

  var client = new Client();

  client.connect(host, function() {
    console.log('connected, launching app ...');

    client.launch(DefaultMediaReceiver, function(err, player) {
      var media = {

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
      };

      player.on('status', function(status) {
        console.log('status broadcast playerState=%s', status.playerState);
      });

      console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);

      player.load(media, { autoplay: true }, function(err, status) {
        console.log('media loaded playerState=%s', status.playerState);

        // Seek to 2 minutes after 5 seconds playing.
        setTimeout(function() {
          console.log("seeking");
          player.seek(2*60, function(err, status) {
            // Stop after 2 seconds playing
            setTimeout(function() {
              console.log("Stopping");
              player.stop(function() {
                console.log("Done!");
                callback(0); //Done
              });
            }, 2000);
              
          });
        }, 5000);

      });

    });

  });

  client.on('error', function(err) {
    console.log('Error: %s', err.message);
    client.close();
    callback(err); //Error
  });

}

function findAndConnect(callback) {
  scanner(function(err, service) {
    console.log('chromecast %s running on: %s',
      service.name,
      service.data);
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
