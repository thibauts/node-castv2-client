var mdns                  = require('multicast-dns');
var txt                   = require('dns-txt')();
var find                  = require('array-find');

function scanner(callback) {
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
      callback(ip, name, port);
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

module.exports = scanner;
