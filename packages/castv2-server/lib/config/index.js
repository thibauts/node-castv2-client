const Express = require("express");
const Config = require("./config");
const AssistantSetup = require('./assistant-setup');
const app = module.exports = Express();

app.get('/config', function (req, res) {
    Config.getConfig().then(config => {
        res.json(config);
    });
});

app.get('/config/assistant/tokenUrl', function (req, res) {
    AssistantSetup.generateTokenUrl().then(value => {
        res.json({url: value});
    })
});

app.put('/config', function (req, res) {
    console.log('config req.body: '+JSON.stringify(req.body));
    let config = req.body;

    if (config.api) {
        if (config.api.hasOwnProperty("debug")) {
            Config.debug = config.api.debug;
        }
        if (config.api.logLevel) {
            Config.logLevel = config.api.logLevel; //TODO: validate
        }
    }
    if (config.assistant) {
        AssistantSetup.setSetup(config.assistant);
    }
    if (config.device) {
        if (config.device.hasOwnProperty("autoConnect")) {
            Config.autoConnect = config.device.autoConnect;
        }
        if (config.device.reconnectTimeout) {
            Config.reconnectTimeout = config.device.reconnectTimeout;
        }
    }
    res.json({response:"ok"});
});