const Express = require("express");
const app = module.exports = Express();
const swaggerDocument = require('./swagger.json');

try {
    const swaggerUi = require('swagger-ui-express');
    app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
    app.get('/swagger', function (req, res) {
        res.json({error: "swagger-ui not installed, run npm install cast-web-api --dev"});
    });
}