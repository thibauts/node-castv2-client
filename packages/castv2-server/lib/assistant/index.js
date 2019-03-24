const Express = require("express");
const GoogleAssistant = require("./google-assistant");
const app = module.exports = Express();
const assistant = new GoogleAssistant();

app.use('/assistant/setup', Express.static(__dirname + '/setup'));

app.get('/assistant', function (req, res) {
    res.json(assistant.status);
});

app.post('/assistant/broadcast', function (req, res) {
    console.log('/assistant/broadcast');

    if (req.body.message) {
        assistant.broadcast(req.body.message)
            .then(response => {
                console.log("response:" + response);
                res.json({response: response});
            })
            .catch(error => {
                console.log("error:" + error);
                res.statusCode = 500;
                res.json({response: 'error', error: error});
            });
    } else {
        res.status(400).send('Bad request');
    }
});

app.post('/assistant/command', function (req, res) {
    console.log('/assistant/command');

    if (req.body.message) {
        assistant.command( req.body.message )
            .then(response => {
                res.json( { response: response } );
            })
            .catch(error => {
                res.statusCode = 500;
                res.json( { response: 'error', error: error } );
            });
    } else {
        res.status(400).send('Bad request');
    }
});