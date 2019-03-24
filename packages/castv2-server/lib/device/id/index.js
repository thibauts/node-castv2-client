const Exoress = require("express");
const app = module.exports = Exoress();

app.get('/device/:id/play', function (req, res) {
	console.log('play');
	evalResults( res, res.locals.device.play() );
});

app.get('/device/:id/pause', function (req, res) {
	console.log('pause');
	evalResults( res, res.locals.device.pause() );
});

app.get('/device/:id/stop', function (req, res) {
	console.log('stop');
	evalResults( res, res.locals.device.stop() );
});

app.get('/device/:id/seek/:time', function (req, res) {
	console.log('seek');
	evalResults( res, res.locals.device.seek(req.params.time) );
});

app.get('/device/:id/muted/:target', function (req, res) {
	console.log('muted');
	evalResults( res, res.locals.device.muted(req.params.target === 'true') );
});

app.get('/device/:id/volume/:target', function (req, res) {
	console.log('volume');
	evalResults( res, res.locals.device.volume(req.params.target/100) );
});

app.get('/device/:id/volume/:target/group', function (req, res) {
	console.log('volume group');
	evalResults( res, res.locals.device.volumeGroup(req.params.target/100) );
});

app.get('/device/:id/image', function (req, res) {
	console.log('image'); //TODO:
});

app.get('/device/:id/subscribe/:url', function (req, res) {
	console.log('subscribe');
	res.locals.device.subscribe(req.params.url);
	res.json({ response:'ok' });
});

app.get('/device/:id/unsubscribe', function (req, res) {
	console.log('unsubscribe');
	res.locals.device.unsubscribe();
	res.json({ response:'ok' });
});

app.get('/device/:id/disconnect', function (req, res) {
	console.log('disconnect');
	res.locals.device.disconnect();
	res.json({ response:'ok' });
});

app.get('/device/:id/remove', function (req, res) {
	console.log('remove');
	// removeDevice( req.params.id ); TODO:
	res.json({ response:'ok' });
});

app.post('/device/:id/playMedia', function (req, res) {
	console.log('playMedia: '+JSON.stringify(req.body));
	res.locals.device.playMedia(req.body);
	res.json({ response:'ok' });
});

app.get('/device/:id/playMediaGet/:media', function (req, res) {
	console.log('playMediaGet');
	res.locals.device.playMedia(req.params.media);
	res.json({ response:'ok' });
});

function evalResults(res, result) {
	if (result.error) {
		res.status(500).json(result);
	} else {
		res.json(result);
	}
}