var MYPATH = "../index"; //castv2-client in production

var Client                = require(MYPATH).Client;
var DefaultMediaReceiver  = require(MYPATH).DefaultMediaReceiver;

var util                  = require("util");
var mdns                  = require('multicast-dns');
var txt                   = require('dns-txt')();
var find                  = require('array-find');

function connectToDevice(host, callback) {

  var client = new Client();

  client.connect(host, function() {
  console.log('connected, launching app ...');

  client.launch(DefaultMediaReceiver, function(err, player) {

  var mediaList = [
    {
      autoplay : true,
      preloadTime : 3,
      startTime : 1,
      activeTrackIds : [],
      playbackDuration: 4,
      media: {
        contentId: "http://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/dash/BigBuckBunnyAudio.mp4",
        contentType: "audio/mpeg",
        streamType: 'BUFFERED'
      }
    },
    {
      autoplay : true,
      preloadTime : 3,
      startTime : 2,
      activeTrackIds : [],
      playbackDuration: 4,
      media: {
        contentId: "http://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/dash/ElephantsDreamAudio.mp4",
        contentType: "audio/mpeg",
        streamType: 'BUFFERED'
      }
    },
    {
      autoplay : true,
      preloadTime : 3,
      startTime : 3,
      activeTrackIds : [],
      playbackDuration: 4,
      media: {
        contentId: "http://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/dash/ForBiggerBlazesAudio.mp4",
        contentType: "audio/mpeg",
        streamType: 'BUFFERED'
      }
    }
  ];

  console.log('app "%s" launched, loading medias...', player.session.displayName);

  player.on('status', function(status) {
    console.log('status broadcast = %s', util.inspect(status)," ");
  });

  // loads multiple items
  player.queueLoad(
    mediaList,
    {
      startIndex:1,
      repeatMode: "REPEAT_OFF"
    },
    function(err, status) {
      console.log("Loaded QUEUE");
      if (err) {
        console.log(util.inspect(err));
        callback(err); //Error
        return;
      };
      console.log(util.inspect(status));
      player.queueInsert(
        [
          {
            autoplay : true,
            preloadTime : 4,
            startTime : 8,
            activeTrackIds : [],
            playbackDuration: 4,
            media: {
              contentId: "http://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/dash/ForBiggerEscapesAudio.mp4",
              contentType: "audio/mpeg",
              streamType: 'BUFFERED',
              metadata: {
                metadataType: 3,
                title: "Original title"
              }
            }
          }
        ],
        function(err, status) {
          console.log("Inserted in QUEUE");
          if (err) {
            console.log(util.inspect(err));
            callback(err); //Error
            return;
          };
          console.log(util.inspect(status));
          player.queueRemove([2],{currentItemId:0}, function(err, status) {
            console.log("Removed from QUEUE");
            if (err) {
              console.log(util.inspect(err));
              callback(err); //Error
              return;
            };
            console.log(util.inspect(status));
            player.queueUpdate(
              [
                {
                  itemId: 4,
                  autoplay : true,
                  preloadTime : 4,
                  startTime : 4,
                  activeTrackIds : [],
                  playbackDuration: 4,
                  media: {
                    contentId: "http://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/dash/ForBiggerEscapesAudio.mp4",
                    contentType: "audio/mpeg",
                    streamType: 'BUFFERED',
                    metadata: {
                      metadataType: 3,
                      title: "Modified title"
                    }
                  }
                }
              ],
              {currentItemId: 4},
              function(err, status) {
                console.log("Updated Item");
                if (err) {
                  console.log(util.inspect(err));
                  callback(err); //Error
                  return;
                };
                console.log(util.inspect(status));
                player.queueReorder([4,3,1], {currentItemId:4}, function(err, status) {
                  console.log("Reordered QUEUE");
                  if (err) {
                    console.log(util.inspect(err));
                    callback(err);
                    return;
                  };
                  console.log(util.inspect(status));
                  console.log("Done!");
                  callback(0); //OK
                });
              });
            });
          });
        }
      );
    });
  });

  client.on('error', function(err) {
    console.log('Error: %s', err.message);
    client.close();
    callback(err); //Error
  });

}

function findAndConnect(callback) {
  var testDeviceAddress = process.env.ADDR;
  if (testDeviceAddress) {
    //Connect to Chromecast specified by environment variable ADDR
    //Usage: env ADR=<IP> node <this file>
    connectToDevice(testDeviceAddress, callback);
  } else {

    //Search for a Chromecast
    var browser = mdns();

    browser.on('response', function(response) {
      var txt_field = find(response.additionals, function (entry) {
        return entry.type === 'TXT';
      });

      var srv_field = find(response.additionals, function (entry) {
        return entry.type === 'SRV';
      });

      var a_field = find(response.additionals, function (entry) {
        return entry.type === 'A';
      });

      if (!txt_field || !srv_field || !a_field) {
        return;
      }

      var ip   = a_field.data;
      var name = txt.decode(txt_field.data).fn;
      var port = srv_field.data.port;

      console.log('found device "%s" at %s:%d', name, ip, port);
      connectToDevice(ip, callback);
      browser.destroy();
    });

    //Send query to find Chromecasts
    browser.query({
      questions:[ {
        name: '_googlecast._tcp.local',
        type: 'PTR'
      }]
    });
  };
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
