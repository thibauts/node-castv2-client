# cast-web-api
[![npm version](https://badge.fury.io/js/cast-web-api.svg)](https://badge.fury.io/js/cast-web-api)
[![Dependency Status](https://img.shields.io/david/vervallsweg/cast-web-api.svg)](https://david-dm.org/vervallsweg/cast-web-api)
[![npm](https://img.shields.io/npm/dm/cast-web-api.svg?maxAge=2592000)]()

Web API for Google Cast enabled devices, based on the [node-castv2](https://github.com/thibauts/node-castv2) implementation by thibauts.

This API is only intended to be used on your local network **not for hosting on the public internet**.

## Installation
	$ npm install cast-web-api -g

You might run into [issues](https://github.com/vervallsweg/cast-web-api/issues/79) with the optional Google-Assistant integration.

## First steps
    $ cast-web-api

The server runs on your network IP:3000 by default. On error it defaults to 127.0.0.1. Adjustable via:

	$ cast-web-api --hostname=192.168.0.11 --port=8080

## Run as daemon
[Forever](https://github.com/foreverjs/forever "forever") is recommended:

	$ npm install forever -g

### Linux/OSX

	$ forever start `which cast-web-api`
	$ forever stop `which cast-web-api`

If you'd like to always run the API in the background even after reboots, you can use cron.

	$ # While using forever
	$ (crontab -l 2>/dev/null; echo "@reboot `which forever` `which cast-web-api`")| crontab -
	$ # While using vanilla node
	$ (crontab -l 2>/dev/null; echo "@reboot `which node` `which cast-web-api` >> ~/cast-web-api.log")| crontab -

Adjust the command to pass parameters via `crontab -e`. The vanilla node version will log output to `~/cast-web-api.log` e.g. `/home/yourname/cast-web-api.log`.

### Windows

	> cast-web-api --windows

Copy the resulting path and change directory to it:

	> cd {path you just copied}

Finally you can also use forever.

	> forever start castWebApi.js
	> forever stop castWebApi.js

## Usage

### Basics
cast-web-api tries to behave like the Google Home app. All available devices will be connected to, if a device goes down, it'll be removed. If it randomly disconnects, it'll try to reconnect.
The autoConnect behavior can be turned of with the config parameter `autoConnect`. This can be helpful for [large speaker groups](https://github.com/vervallsweg/cast-web-api/issues/92).


### Documentation

#### Online
Parse the [swagger.json](https://raw.githubusercontent.com/vervallsweg/cast-web-api/master/lib/swagger/swagger.json "swagger.json"), in the [online editor](https://editor.swagger.io/).

#### Local
Install the devDependencies for instance `git clone` this repo then `npm install` into the repo. Docs now available at `/swagger`.


## Debugging
Every log output follows this format: {time} {device id} {function name}: {message}. For easy differentiation between those components, device id is inverted in color and function name underlined. Info messages appear in your standard terminal color. Error messages in red, warning messages in red and server related messages in blue.
```
2018-03-31T18:27:09.508Z a90824f40764eb5df1fccc4f5cb95dd3 reconnectionManagement(): reconnecting
```

cast-web-js uses npm's debug package. Debugging can be enabled with the following command:

    $ DEBUG=cast-web-api node (yourdirectory)/castWebApi.js

If you need further information you can enable debugging for the underlying castv2 module. You can either set the scope to castv2 or to everything:

	$ DEBUG=* node (yourdirectory)/castWebApi.js

## Further information
[thibauts](https://github.com/thibauts "thibauts profile") wrote a great [protocol description](https://github.com/thibauts/node-castv2#protocol-description "protocol description"). I can only highly recommend reading it.

If you read the first sentences of this file it goes without saying that you **should not** run this API on the internet. Run it behind a firewall only in your local network!

If you find a bug or typo, feel free to contact me, open an issue, fork it, open prs, you name it.
