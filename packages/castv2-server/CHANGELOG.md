# Changelog
## v1.1.0
- Attention: Requires node 7.0.0 or higher
- Fixed: MDNS library, changed to own mdns-cast-browser #73
- Added: ES6 class definitions #74
- Added: GoogleTTS messages over 200 characters #70
- Added: Google Assistant to broadcast messages
- Added: API paths for Google Assistant auth
- Added: Added /assistant/setup wizard for auth
- Added: seek function
- Added: global /callback
- Added: unified /config that can be changed at runtime
- Added: /swagger for better api documentation

## v1.0.0
- Updated: all API paths, see docs for more info
- Added: GoogleTTS option for /playMedia
- Added: auto reconnect to devices
- Added: group recognition

## v0.3
- fixed issue where certain devices don't show up #59
- > all credit to @jg123
- packages can now be installed through npm again globally
- npm install cast-web-api -g #61
- current version pulled from package.json now #62
- > all credit to @kevireilly
- docker replaced debian with alpine to reduce size #60
- > all credit to @janwerner

## v0.2.3
- added /setMediaPlaybackShort #54
- readme typ #57
- package.json min node and dependency versions #53
- added documentation discoveryTimeout #52
- docker support #51
- automatic ip discovery #50

## v0.2.2
- fixed /setMediaPlayback #43

## v0.2.1
- fixed package.json #41, #39

## v0.2
- get/set configuration values in JSON #32
- added package.json and versioning #31
- success message on / #30
- removed mdns npm dependency #29
- better api documentation #27

## v0.1
- Release