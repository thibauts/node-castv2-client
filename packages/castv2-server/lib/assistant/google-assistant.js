var GoogleAssistant = null;

try {
	GoogleAssistant = require('google-assistant');
} catch (e) {
	console.log('GoogleAssistant require error: '+e);
}

const Events = require('events');
const path = require('path');
const config = {
	auth: {
		keyFilePath: path.resolve(__dirname, './client_secret.json'),
		savedTokensPath: path.resolve(__dirname, './tokens.json'),
	},
	conversation: {
		lang: 'en-US',
	}
};


class Assistant extends Events {
	constructor() {
		super();
		this.assistant = false;
		this._ready = false;
	}

	getAssistantReady() {
		let that = this;
		return new Promise(function (resolve, reject) {
			if (GoogleAssistant) {
				if (that._ready) {
					resolve(that.assistant);
				} else {
					try {
						that.assistant = new GoogleAssistant(config.auth);
						that._ready = false;

						that.assistant.on('ready', function() {
							that._ready = true;
							resolve(that.assistant);
						});

						that.assistant.on('error', error => {
							that._ready = false; // Correct???
							reject(error);
						});
					} catch (e) {
						reject('Assistant exception: '+e);
					}
				}
			} else {
				reject('google-assistant package is not installed');
			}
		})
	}

	broadcast(message) {
		return new Promise( (resolve, reject) => {
			this.getAssistantReady()
				.then(assistant => {
					config.conversation.textQuery = 'Broadcast '+message;
					assistant.start(config.conversation);

					assistant.on('started', conversation => {
						conversation.on('response', (text) => {
							console.log('response: '+text);
							resolve('Assistant response: ' + text);
						});

						conversation.on('ended', (error, continueConversation) => {
							console.log('ended error: ' + error + ', continueConversation: '+continueConversation);
							if (error) {
								reject('Conversation ended, error: ' + error);
							} else {
								conversation.end();
								resolve('Conversation complete, continueConversation: '+continueConversation);
							}
						});

						conversation.on('error', (error) => {
							console.log('error:'+error);
							reject('Conversation error: ' + error);
						});
					});
				})
				.catch(error => {
					reject(error);
				});
		});
	};

	command(command) {
		let that = this;
		return new Promise( (resolve, reject) => {
			that.getAssistantReady()
				.then(assistant => {
					config.conversation.textQuery = command;
					assistant.start(config.conversation);

					assistant.on('started', conversation => {
						conversation.on('response', text => {
							resolve('Assistant response: ' + text);
						});

						conversation.on('ended', (error, continueConversation) => {
							console.log('ended');
							if (error) {
								reject('Conversation ended, error: ' + error);
							} else {
								conversation.end();
								resolve('Conversation complete, continueConversation: '+continueConversation);
							}
						});

						conversation.on('error', (error) => {
							reject('Conversation error: ' + error);
						});
					});
				})
				.catch(error => {
					reject(error);
				});
		});
	};

	get status() {
		return { assistant:(this.assistant !== false), ready:this._ready } ;
	};
}

module.exports = Assistant;
