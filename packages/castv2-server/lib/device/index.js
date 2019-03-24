const Express = require("express");
const CastManager = require("./cast-manager");
const app = module.exports = Express();
const castManager = new CastManager();
const logger = require('../log/logger');

app.get('/device', function (req, res) {
    res.send( castManager.getDevices('all') );
});

app.get('/device/connected', function (req, res) {
    res.send( castManager.getDevices('connected') );
});

app.get('/device/disconnected', function (req, res) {
    res.send( castManager.getDevices('disconnected') );
});

app.get('/device/debug/device', function (req, res) {
    let deviceDump = castManager.deviceDump();
    logger.log( 'server', 'device dump: ', deviceDump );
    res.send(deviceDump);
});

app.get('/device/debug/group', function (req, res) {
    let groupDump = castManager.groupDump();
    logger.log( 'server', 'group dump: ', groupDump );
    res.send(groupDump);
});

app.all('/device/:id*', function (req, res, next) {
    castManager.getDeviceConnected(req.params.id) //TODO: if not connected, then connecting returns error: {}
        .then(device => {
            res.locals.device = device;
            next();
        })
        .catch(error => {
            res.status(404).json({ response: 'error', error: error });
        });
});

app.all('/device/:id*', function (req, res, next) {
    if (res.locals.device.connection === 'not found') {
        res.json( res.locals.device);
    } else {
        if (req.params[0]==="") {
            res.json( res.locals.device.toObject() );
        } else {
            next();
        }
    }
});

//get device connected, then redirect to id