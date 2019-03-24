const events = require('events');
const logger = require('../../log/logger');
const Callback = require('./callback');
const CastReceiver = require('./connection/cast-receiver');
const CastMedia = require('./connection/cast-media');
const CastDefaultMediaReceiver = require('./connection/cast-default-media-receiver.js');
const CastGroup = require('./connection/cast-group');
const ReconnectionManager = require('./connection/reconnection-manager');
const configuration = require("../../config/config");

class CastDevice extends events {
	constructor(id, address, name) {
		super();
		this.id = id;
		this._address = address;
		this._name = name;
		this._link = 'disconnected';
		this._castReceiver = new CastReceiver(this._address, this.id);
		this._castMedia =  new CastMedia(this._address, this.id);
		this.groups = new Map();
		this.members = new CastGroup(this);
		this.callback = null;
		this.reconnect = new ReconnectionManager(this);
		this._dmr = new CastDefaultMediaReceiver(this._address, this.id);
		this._status = {
			groupPlayback: {on: false, from: null},
			volume: 0,
			muted: false,
			application: '',
			status: '',
			title: '',
			subtitle: '',
			image: ''
		};

		this.setConnectionListeners();

		if (configuration.autoConnect) {
			logger.log('info', 'CastDevice.constructor()', 'autoConnect', this.id );
			this.connect();
		}
	}
	
	connect() {
		logger.log('info', 'CastDevice.connect()', 'connecting', this.id );
		this._castReceiver.connect();
	}

	disconnect() {
		this._castReceiver.disconnect();
		this._castMedia.disconnect();
	}

	remove() {
		this.groups.forEach(group => {
			group.members.removeMember(this); //This is important for garbage collection
		});
		this.disconnect();
		this.reconnect.stop();
		this.removeAllListeners();
		//TODO: maybe also delete all the objects, especially the connection stuff, just in case
	}

	setConnectionListeners() {
		this._castReceiver.on('linkChanged', link => {
			this.link = link;
		});
		this._castReceiver.on('statusChanged', status => {
			this.status = status;
		});
		this._castReceiver.on('sessionIdChanged', sessionId => {
			console.log("sessionIdChanged: "+sessionId);

			if (sessionId) {
				this._castMedia.connect(sessionId);
			} else {
				this._castMedia.disconnect();
			}
		});
		this._castReceiver.on('error', error => {
			logger.log("error", "CastDevice._castReceiver", "error: "+error, this.id);
			//TODO:
		});

		this._castMedia.on('linkChanged', link => {
			//
		});
		this._castMedia.on('statusChanged', status => {
			this.status = status;
		});
		this._castMedia.on('error', error => {
			logger.log("error", "CastDevice._castMedia", "error: "+error, this.id);
			//TODO:
		});
	}

	toObject() {
		return {
			id: this.id,
			name: this._name,
			connection: this.link,
			address: this.address,
			sessionId: this.sessionId,
			status: this.status,
			// groups: this.getGroups(),
			groups: this.getGroups(),
			members: this.members.members
		}
	}

	volume(targetLevel) {
		logger.log('info', 'CastDevice.volume()', targetLevel, this.id);
		return this._castReceiver.volume(targetLevel);
	}

	volumeGroup(targetLevel) {
		logger.log('info', 'CastDevice.volumeGroup()', targetLevel, this.id);
		return this.members.volume(targetLevel);
	}

	muted(isMuted) {
		logger.log('info', 'CastDevice.muted()', isMuted, this.id);
		return this._castReceiver.muted(isMuted);
	}

	play() {
		logger.log('info', 'CastDevice.play()', '', this.id);
		return this._castMedia.play();
	}

	pause() {
		logger.log('info', 'CastDevice.pause()', '', this.id);
		return this._castMedia.pause();
	}

	stop() {
		logger.log('info', 'CastDevice.stop()', '', this.id);
		return this._castReceiver.stop();
	}

	seek(to) {
		logger.log('info', 'CastDevice.seek()', 'to: '+to, this.id);
		return this._castMedia.seek(to);
	}

	playMedia(media) {
		this._dmr.play(media);
	}

	subscribe(url) {
		if(this.callback != null) {
			this.unsubscribe();
		}
		this.callback = new Callback(url, this);
	}

	unsubscribe() {
		if (this.callback != null) {
			this.callback.stop();
			this.callback = null; //TODO: required
		}
	}

	get address() {
		return {
			port: this._address.port,
			host: this._address.host
		};
	}

	set address(value) {
		logger.log('info', 'CastDevice.set address(value)', 'value: ' + JSON.stringify(value), this.id );
		let reconnect = true; //TODO: this destroys autoConnect setting, but theres no other way of telling wether a device is down due to incorrect address or because it was never supposed to up

		if (this._address != null && this._link !== 'disconnected') {
			reconnect = true;
			this.disconnect();
		}

		if (this._address.host !== value.host || this._address.port !== value.port) {
			this._address = value;
			this._castReceiver.address = value;
			this._castMedia.address = value;
			logger.log('info', 'CastDevice.set address(value)', 'changed _address: ' + JSON.stringify(this._address)+ JSON.stringify(this._castReceiver._address)+ JSON.stringify(this._castMedia._address), this.id );

			if (reconnect) {
				this.connect();
			}
		}
	}

	get status() {
		return {
			groupPlayback: this._status.groupPlayback.on,
			volume: this._status.volume,
			muted: this._status.muted,
			application: this._status.application,
			status: this._status.status,
			title: this._status.title,
			subtitle: this._status.subtitle,
			image: this._status.image
		};
	}

	set status(status) {
		let changed = false;

		for (let key in status) {
			let value = status[key];
			if (this._status[key] !== value && !this.isGroupPlaybackLocked(status, key)) {
				this._status[key] = value;
				changed = true;
			}
		}

		if (changed) {
			this.emit('statusChanged', this._status);
		}
	}

	isGroupPlaybackLocked(status, key) { //TODO: does not lock if groupPlayback is set,
		let locked = false;
		if (key === 'groupPlayback' || key === 'application' || key === 'status'||
			key === 'title' || key === 'subtitle' || key === 'image') {
			logger.log('info', 'CastDevice.isGroupPlaybackLocked()', 'is media key: '+key, this.id);
			if (this._status.groupPlayback.on !== false) {
				//groupPlayBack set
				locked = true;
				if (status.hasOwnProperty('groupPlayback')) {
					logger.log('info', 'CastDevice.isGroupPlaybackLocked()', 'status.hasOwnProp: '+status.hasOwnProperty('groupPlayback')+' this._status.groupPlayback: '+JSON.stringify(this._status.groupPlayback), this.id);
					if (status.groupPlayback.from === this._status.groupPlayback.from) {
						logger.log('info', 'CastDevice.isGroupPlaybackLocked()', 'status.groupPlayback.from: '+status.groupPlayback.from+'===this._status.groupPlayback.from: '+this._status.groupPlayback.from, this.id);
						locked = false;
					} else {
						logger.log('error', 'CastDevice.isGroupPlaybackLocked()', 'status.groupPlayback.from: '+status.groupPlayback.from+'!==this._status.groupPlayback.from: '+this._status.groupPlayback.from, this.id);
					}
				}
			} else {
				//no groupPlayBack set
				logger.log('info', 'CastDevice.isGroupPlaybackLocked()', 'ELSE own prop: '+status.hasOwnProperty('groupPlayback')+' this._status.groupPlayback: '+this._status.groupPlayback, this.id);
			}
		}
		logger.log('info', 'CastDevice.isGroupPlaybackLocked()', 'key: '+key+', status[key]: '+status[key]+', lock: '+locked, this.id); //TODO: sometimes: key: groupPlayback, locked: false and still the new groupPlayback is not written
		return locked;
	}

	set link(value) {
		if (value !== this.link) {
			this._link = value;
			this.emit('linkChanged', this.link);
		}
	}

	get link() {
		return this._link;
	}

	get sessionId() {
		return this._castReceiver.sessionId;
	}

	getGroups() {
		let groups = [];
		this.groups.forEach(group => {
			groups.push(group.id);
		});
		return groups;
	}
}

module.exports = CastDevice;