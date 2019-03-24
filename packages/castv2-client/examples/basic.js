import scanner from 'chromecast-scanner';
import { PlatformSender, DefaultMediaReceiver } from '../src';

async function ondeviceup(host) {
  /**
   * Client
   * @type {PlatformSender}
   */
  const client = new PlatformSender();

  await client.connect(host);
  console.log('connected, launching app ...');

  const player = await client.launch(DefaultMediaReceiver);
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
  const status1 = await player.load(media, {
    autoplay: true
  });

  console.log('media loaded playerState=%s', status1.playerState);
  // Seek to 2 minutes after 5 seconds playing.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('seeking');
      player.seek(2 * 60, (err, status2) => {
        // Stop after 2 seconds playing
        console.log(status2);
        if (err) {
          reject(err);
        }
        setTimeout(() => {
          console.log('Stopping');
          player.stop(() => {
            console.log('Done!');
            resolve();
          });
        }, 2000);
      });
    }, 5000);

    client.on('error', (err) => {
      console.log('Error: %s', err.message);
      client.close();
      reject(err);
    });
  });
}

export default function findAndConnect() {
  return new Promise((resolve, reject) => {
    scanner((err, service) => {
      if (err) {
        reject(err);
      }
      console.log('chromecast %s running on: %s', service.name, service.data);
      return ondeviceup('192.168.7.94').then(() => resolve(service));
    });
  });
}
