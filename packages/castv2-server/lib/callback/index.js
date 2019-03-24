const Express = require("express");
const app = module.exports = Express();
const CallbackManager = require("./callback-manager");
const logger = require('../log/logger');
CallbackManager.init();

app.get('/callback', function (req, res) {
    res.send( CallbackManager.callbacks );
});

app.get('/callback/:url*', function (req, res) {
    let callback = CallbackManager.getCallback(req.params.url);
    if (callback) {
        res.send(callback);
    } else {
        res.status(404).send('Not found');
    }
});

app.post('/callback', function (req, res) {
    try {
        req.body.forEach(callback => {
            CallbackManager.setCallback(callback.url, callback.settings)
        });
        res.json({ response:'ok' });
    } catch (e) {
        res.status(400).send('Bad request')
    }
});

app.put('/callback', function (req, res) {
    try {
        let notFound = [];
        req.body.forEach(callbackRequest => {
            let callback = CallbackManager.getCallback(callbackRequest.url);

            if (callback) {
                callback.settings = callbackRequest.settings;
            } else {
                notFound.push(callbackRequest.url);
            }
        });

        if (notFound.length > 0) {
            res.status(404).json({ response:'not found', callbacks:notFound });
        } else {
            res.json({ response:'ok' });
        }
    } catch (e) {
        res.status(400).send('Bad request')
    }
});

app.delete('/callback', function (req, res) {
    try {
        req.body.forEach(callback => {
            CallbackManager.deleteCallback(callback.url)
        });
        res.json({ response:'ok' });
    } catch (e) {
        res.status(400).send('Bad request')
    }
});