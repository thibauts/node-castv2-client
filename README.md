castv2-client
=============
### A Chromecast client based on the new (CASTV2) protocol

This module implements a Chromecast client over the new (CASTV2) protocol. A sender app for the `DefaultMediaReceiver` application is provided, as well as an `Application` base class and implementations of the basic protocols (see the `controllers` directory) that should make implementing custom senders a breeze.

This implementation tries to stay close and true to the protocol. For details about protocol internals please see [https://github.com/thibauts/node-castv2](https://github.com/thibauts/node-castv2#protocol-description). 

For advanced use, like using [subtitles](https://github.com/thibauts/node-castv2-client/wiki/How-to-use-subtitles-with-the-DefaultMediaReceiver-app) with the DefaultMediaReceiver check the [wiki](https://github.com/thibauts/node-castv2-client/wiki).

Installation
------------

``` bash
$ npm install @amilajack/castv2-client
```

On windows, to avoid native modules dependencies, use

``` bash
$ npm install @amilajack/castv2-client --no-optional
```

Examples
--------

### Launching a stream on the device

```javascript
import { Client } from 'castv2-client';
import { DefaultMediaReceiver } from 'castv2-client';
import mdns from 'mdns';

const browser = mdns.createBrowser(mdns.tcp('googlecast'));

browser.on('serviceUp', service => {
  console.log('found device "%s" at %s:%d', service.name, service.addresses[0], service.port);
  ondeviceup(service.addresses[0]);
  browser.stop();
});

browser.start();

function ondeviceup(host) {

  const client = new Client();

  client.connect(host, () => {
    console.log('connected, launching app ...');

    client.launch(DefaultMediaReceiver, (err, player) => {
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
      };

      player.on('status', status => {
        console.log('status broadcast playerState=%s', status.playerState);
      });

      console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);

      player.load(media, { autoplay: true }, (err, status) => {
        console.log('media loaded playerState=%s', status.playerState);

        // Seek to 2 minutes after 15 seconds playing.
        setTimeout(() => {
          player.seek(2*60, (err, status) => {
            //
          });
        }, 15000);
      });
    });    
  });

  client.on('error', err => {
    console.log('Error: %s', err.message);
    client.close();
  });
}
```

### Other examples

Check the `examples` directory.


Contributors
------------

* [amilajack](https://github.com/amilajack) (Amila Welihinda)
* [xat](https://github.com/xat) (Simon Kusterer)
* [angelnu](https://github.com/angelnu) (Angel Nunez Mencias)
