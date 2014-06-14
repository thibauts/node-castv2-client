castv2-client
=============
### A Chromecast client based on the new (CASTV2) protocol

This module implements a Chromecast client over the new (CASTV2) protocol. A sender app for the `DefaultMediaReceiver` application is provided, as well as an `Application` base class and implementations of the basic protocols (see the `controllers` directory) that should make implementing custom senders a breeze.

This implementation tries to stay close and true to the protocol. For details about protocol internals please see [https://github.com/thibauts/node-castv2](https://github.com/thibauts/node-castv2#protocol-description). 

Installation
------------

``` bash
$ npm install castv2-client
```

Examples
--------

Launching a stream on the device :

``` javascript
var Client                = require('castv2-client').Client;
var DefaultMediaReceiver  = require('castv2-client').DefaultMediaReceiver;
var mdns                  = require('mdns');

var browser = mdns.createBrowser(mdns.tcp('googlecast'));

browser.on('serviceUp', function(service) {
  console.log('found device "%s" at %s:%d', service.name, service.addresses[0], service.port);
  ondeviceup(service.addresses[0]);
  browser.stop();
});

browser.start();

function ondeviceup(host) {

  var client = new Client();

  client.connect(host, function() {
    console.log('connected, launching app ...');

    client.launch(DefaultMediaReceiver, function(err, player) {
      var media = {
      	// Here you can plug an URL to any mp4, webm, mp3 or jpg file.
        contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4'
      };

      player.on('status', function(status) {
        console.log('status broadcast playerState=%s', status.playerState);
      });

      console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);

      player.load(media, { autoplay: true }, function(err, status) {
        console.log('media loaded playerState=%s', status.playerState);
      });

    });
    
  });

  client.on('error', function(err) {
    console.log('Error: %s', err.message);
    client.close();
  });

}
```