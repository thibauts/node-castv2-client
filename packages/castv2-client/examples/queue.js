import scanner from 'chromecast-scanner';
import util from 'util';
import { PlatformSender, DefaultMediaReceiver } from '../src';

async function ondeviceup(host) {
  const client = new PlatformSender();

  client.on('error', (err) => {
    console.log('Error: %s', err.message);
    client.close();
    throw new Error(err);
  });

  await client.connect(host);
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

  const player = await client.launch(DefaultMediaReceiver);
  console.log('app "%s" launched, loading medias...', player.session.displayName);
  let isDone = false;

  function gotStatus(status) {
    console.log('status broadcast = %s', util.inspect(status), ' ');
    console.log(status);
    if (isDone && status.idleReason === 'FINISHED' && !status.loadingItemId) {
      console.log('Done!');
    }
  }

  player.on('status', gotStatus);

  const status1 = await player.queueLoad(mediaList, {
    startIndex: 1,
    repeatMode: 'REPEAT_OFF'
  });

  console.log('Loaded QUEUE');
  console.log(util.inspect(status1));
  await player.queueInsert([
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
  ]);

  const status3 = await player.queueRemove([2], { currentItemId: 0 });
  console.log('Removed from queue');
  console.log(util.inspect(status3));
  const status4 = await player.queueUpdate([{
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
  }], { currentItemId: 4 });

  console.log('Updated item');
  console.log(util.inspect(status4));
  const status5 = await player.queueReorder([4, 3, 1], { currentItemId: 4 });

  console.log('Reordered queue');
  console.log(util.inspect(status5));
  // Get status - check that the title from itemId=4 has been modified
  const status6 = await player.getStatus();
  gotStatus(status6);
  isDone = true;
}

export default function findAndConnect() {
  return new Promise(resolve => scanner((err, service) => {
    console.log('chromecast %s running on: %s', service.name, service.data);
    return resolve(ondeviceup(service.data));
  }));
}
