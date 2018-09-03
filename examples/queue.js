import scanner from 'chromecast-scanner';
import util from 'util';
import { PlatformSender } from '../index';
import { DefaultMediaReceiver } from '../index';

function ondeviceup(host, callback) {
  const client = new PlatformSender();

  client.connect(host).then(() => {
    console.log('connected, launching app ...');
    const mediaList = [
      {
        autoplay: true,
        preloadTime: 3,
        startTime: 1,
        activeTrackIds: [],
        playbackDuration: 2,
        media: {
          contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/dash/BigBuckBunnyAudio.mp4',
          contentType: 'audio/mpeg',
          streamType: 'BUFFERED'
        }
      },
      {
        autoplay: true,
        preloadTime: 3,
        startTime: 2,
        activeTrackIds: [],
        playbackDuration: 2,
        media: {
          contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/dash/ElephantsDreamAudio.mp4',
          contentType: 'audio/mpeg',
          streamType: 'BUFFERED'
        }
      },
      {
        autoplay: true,
        preloadTime: 3,
        startTime: 3,
        activeTrackIds: [],
        playbackDuration: 2,
        media: {
          contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/dash/ForBiggerBlazesAudio.mp4',
          contentType: 'audio/mpeg',
          streamType: 'BUFFERED'
        }
      }
    ];
    client.launch(DefaultMediaReceiver).then((player) => {
      console.log('app "%s" launched, loading medias...', player.session.displayName);
      function gotStatus(status) {
        console.log('status broadcast = %s', util.inspect(status), ' ');
        if (isDone, status.idleReason == 'FINISHED' && status.loadingItemId === undefined) {
          console.log('Done!');
          callback(0);
        }
      }
      player.on('status', gotStatus);
      let isDone = false;
      player.queueLoad(mediaList, {
        startIndex: 1,
        repeatMode: 'REPEAT_OFF'
      }).then((status) => {
        console.log('Loaded QUEUE');
        console.log(util.inspect(status));
        player.queueInsert([
          {
            autoplay: true,
            preloadTime: 4,
            startTime: 8,
            activeTrackIds: [],
            playbackDuration: 2,
            media: {
              contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/dash/ForBiggerEscapesAudio.mp4',
              contentType: 'audio/mpeg',
              streamType: 'BUFFERED',
              metadata: {
                metadataType: 3,
                title: 'Original title'
              }
            }
          }
        ]).then((status) => {
          console.log('Inserted in queue');
          console.log(util.inspect(status));
          // Get status before we modify the title bellow
          player.getStatus().then(gotStatus).catch(err => console.error(err));
          player.queueRemove([2], { currentItemId: 0 }).then((status) => {
            console.log('Removed from queue');
            console.log(util.inspect(status));
            player.queueUpdate([{
              itemId: 4,
              autoplay: true,
              preloadTime: 4,
              startTime: 4,
              activeTrackIds: [],
              playbackDuration: 2,
              media: {
                contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/dash/ForBiggerEscapesAudio.mp4',
                contentType: 'audio/mpeg',
                streamType: 'BUFFERED',
                metadata: {
                  metadataType: 3,
                  title: 'Modified title'
                }
              }
            }], { currentItemId: 4 }).then((status) => {
              console.log('Updated item');
              console.log(util.inspect(status));
              player.queueReorder([4, 3, 1], { currentItemId: 4 }).then((status) => {
                console.log('Reordered queue');
                console.log(util.inspect(status));
                // Get status - check that the title from itemId=4 has been modified
                player.getStatus().then((status) => {
                  gotStatus(status);
                  isDone = true;
                }).catch((err) => {
                  console.error('Status get error!', err);
                  callback(err);
                });
              }).catch((err) => {
                console.error('Queue reorder error!', err);
                callback(err);
              });
            }).catch((err) => {
              console.error('Queue update error!', err);
              callback(err);
            });
          }).catch((err) => {
            console.error('Queue removal error!', err);
            callback(err);
          });
        }).catch((err) => {
          console.error('Error!', err);
          callback(err);
        });
      }).catch((err) => {
        console.log(util.inspect(err));
        callback(err); // Error
      });
    }).catch((err) => {
      console.error('Launch error!', err);
      callback(err);
    });
  }).catch((err) => {
    console.error('Connect error!', err);
    callback(err);
  });

  client.on('error', (err) => {
    console.log('Error: %s', err.message);
    client.close();
    callback(err); // Error
  });
}

function findAndConnect(callback) {
  scanner((err, service) => {
    console.log('chromecast %s running on: %s', service.name, service.data);
    ondeviceup(service.data, callback);
  });
}

// module for testcase
export default findAndConnect;

// main
const main = () => {
  findAndConnect((rc) => {
    process.exit(rc);
  });
};
if (require.main === module) {
  main();
}
