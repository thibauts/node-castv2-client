var MYPATH = "../index"; //castv2-client in production

var Client                = require(MYPATH).Client;
var DefaultMediaReceiver  = require(MYPATH).DefaultMediaReceiver;
var scanner               = require("./lib/scanner");

var util                  = require("util");

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
      playbackDuration: 2,
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
      playbackDuration: 2,
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
      playbackDuration: 2,
      media: {
        contentId: "http://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/dash/ForBiggerBlazesAudio.mp4",
        contentType: "audio/mpeg",
        streamType: 'BUFFERED'
      }
    }
  ];

  console.log('app "%s" launched, loading medias...', player.session.displayName);

  player.on('status', gotStatus);

  //Done re-ordering?
  var isDone = false;

  function gotStatus(status) {
    console.log('status broadcast = %s', util.inspect(status)," ");
    if (
      isDone,
      status.idleReason == "FINISHED" &&
      status.loadingItemId === undefined)
    {
      console.log("Done!");
      callback(0);
    }
  }

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
            playbackDuration: 2,
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
          //Get status before we modify the title bellow
          player.getStatus(function (err, status){
            gotStatus(status);
          });
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
                  playbackDuration: 2,
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
                  //Get status - check that the title from itemId=4 has been modified
                  player.getStatus(function (err, status){
                    gotStatus(status);
                    isDone = true;
                  });
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
  scanner(function(ip, name, port){
    connectToDevice(ip, callback);
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
