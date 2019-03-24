const Assistant = require('./google-assistant');

var googleAssistant = new Assistant();

googleAssistant.on('ready', function() {
	googleAssistant.broadcast('Hello world, this is a test');
});

googleAssistant.on('error', error => {
	console.log('error: ' + error);
});