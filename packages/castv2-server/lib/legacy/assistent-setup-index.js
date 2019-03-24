const Express = require("express");
const AssistantSetup = require("../config/assistant-setup");
const app = module.exports = Express();

app.get('/assistant/setup/id/:clientId', function (req, res) {
    console.log('/assistant/setup');

    AssistantSetup.setClientID( req.params.clientId );
    res.json( {response:'ok'} );
});

app.get('/assistant/setup/secret/:clientSecret', function (req, res) {
    console.log('/assistant/setup');

    AssistantSetup.setClientSecret( req.params.clientSecret );
    res.json( {response:'ok'} );
});

app.get('/assistant/setup/token/:oAuthCode?/assistant/setup/token/auto/:oAuthCode', function (req, res) {
    console.log('/assistant/setup/token/:oAuthCode?/assistant/setup/token/auto/:oAuthCode');

    AssistantSetup.setToken(req.params.oAuthCode)
        .then(response => {
            res.json( response );
        })
        .catch(error =>{
            res.status(500).json( { response: 'error', error: error } );
        })
});

app.get('/assistant/setup/getTokenUrl', function (req, res) {
    console.log('/assistant/setup/getTokenUrl');

    AssistantSetup.generateTokenUrl()
        .then(url => {
            res.json( { response: 'ok', url: url } );
        })
        .catch(error =>{
            res.status(500).json( { response: 'error', error: error } );
        })
});