const chalk = require('chalk');
const debug = require('debug')('cast-web-api');
const configuration = require("../config/config");

class Logger {
    constructor() {

    }

    static buildMeta(functionName, message, id) {
        // {date+time}  {id_underline} {functionName}: {message}
        let date = new Date();
        let time = date.toISOString();
        if (id == null) {
            id = '';
        } else {
            time = time + ' ';
        };
        return time + chalk.inverse(id) + ' ' + chalk.underline(functionName) + ': ' + message;
    }

    static info(functionName, message, id, debug=false) {
        if (configuration.logLevel.info && this.isDebug(debug)) console.log(this.buildMeta(functionName, message, id));
    }

    static error(functionName, message, id, debug=false) {
        if (configuration.logLevel.error && this.isDebug(debug)) console.log(chalk.red(Logger.buildMeta(functionName, message, id)));
    }

    static server(functionName, message, id, debug=false) {
        if (configuration.logLevel.server && this.isDebug(debug)) console.log(chalk.cyan(Logger.buildMeta(functionName, message, id)));
    }

    static isDebug(debug) {
        if (debug === true) {
            return debug === configuration.debug;
        } else {
            return true;
        }
    }

    //deprecated
    static debugWarn(functionName, message, id) {
        debug(chalk.yellow(Logger.buildMeta(functionName, message, id)));
    }

    static log(type, functionName, message, id) { //TODO: deprecated
        if (type === 'info') {
            this.info(functionName, message, id);
        }
        if (type === 'error') {
            this.error(functionName, message, id);
        }
        if (type === 'server') {
            this.server(functionName, message, id);
        }
        if (type === 'debug') {
            this.info(functionName, message, id, true);
        }
        if (type === 'debug-server') {
            this.server(functionName, message, id, true);
        }
        if (type === 'debug-error') {
            this.error(functionName, message, id, true);
        }
    }
}

module.exports = Logger;