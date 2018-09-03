import scanner from 'chromecast-scanner';
import { PlatformSender } from '../';
import { DefaultMediaReceiver } from '../';


function ondeviceup(host, callback) {
  /**
   * Client
   * @type {PlatformSender}
   */
  const client = new PlatformSender();
  console.log(host);
  client.connect(host).then(() => {
    console.log('connected, launching app ...');
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
          title: 'Big Buck Bunny',
          images: [
            { url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
          ]
        }
      };
      player.on('status', status => console.log('status broadcast playerState=%s', status.playerState));
      console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);
      player.load(media, {
        autoplay: true
      }).then((status) => {
        console.log('media loaded playerState=%s', status.playerState);
        // Seek to 2 minutes after 5 seconds playing.
        setTimeout(() => {
          console.log('seeking');
          player.seek(2 * 60, (err, status) => {
            // Stop after 2 seconds playing
            setTimeout(() => {
              console.log('Stopping');
              player.stop(() => {
                console.log('Done!');
                callback(0);
              });
            }, 2000);
          });
        }, 5000);
      }).catch((err) => {
        console.error('Media load error!', err);
        callback(err);
      });
    }).catch((err) => {
      console.error('Launch error!', err);
      callback(err);
    });
  }).catch((err) => {
    console.error('Connection error!', err);
    callback(err);
  });


  client.on('error', (err) => {
    console.log('Error: %s', err.message);
    client.close();
    callback(err);
  });
}

function findAndConnect(callback) {
  scanner((err, service) => {
    console.log('chromecast %s running on: %s', service.name, service.data);
    ondeviceup('192.168.7.94', callback);
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
