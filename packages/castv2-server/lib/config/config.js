const os = require('os');
const pkg = require('../../package.json');
const AssistantSetup = require('./assistant-setup');

class Config {

    static init(argv) {
        Config._autoConnect = true;
        Config._reconnectTimeout = 10000;
        Config._port = 3000;
        Config._windows = false;
        Config._thisVersion = pkg.version;
        Config._debug = false;
        Config._logLevel = {
            info: true,
            error: true,
            server: true
        };
        Config._hostname = Config.getNetworkIp();

        Config.interpretArguments(argv);
        Config.isWindows();
    }

    static interpretArguments(argv) {
        let args = require('minimist')(argv);
        require("../log/logger").log('debug', 'interpretArguments()', JSON.stringify(args));

        if (args.autoConnect) {
            Config._autoConnect = args.autoConnect;
        }
        if (args.reconnectTimeout) {
            Config._reconnectTimeout = args.reconnectTimeout;
        }
        if (args.hostname) {
            Config._hostname = args.hostname;
        }
        if (args.port) {
            Config._port = args.port;
        }
        if (args.windows) {
            Config._windows = true;
        }
        if (args.debug) {
            Config._debug = args.debug;
        }
    }

    static getLatestVersion() {
        return new Promise( function(resolve, reject) {
            fetch('https://raw.githubusercontent.com/vervallsweg/cast-web-api/master/package.json')
                .then(function(res) {
                    return res.json();
                }).then(function(json) {
                require("../log/logger").log('debug', 'getLatestVersion()', 'JSON received: '+JSON.stringify(json));
                try {
                    let version = json.version;
                    require("../log/logger").log('debug', 'getLatestVersion()', 'version: ' + version);
                    resolve(version);
                } catch (e) {
                    reject(e);
                }
            });

            setTimeout(() => {
                reject('request timeout');
            }, 5000);
        });
    }

    static getNetworkIp() {
        let interfaces = os.networkInterfaces();
        let addresses = [];
        for (let k in interfaces) {
            for (let k2 in interfaces[k]) {
                let address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                    addresses.push(address.address);
                }
            }
        }
        require("../log/logger").log('debug', 'getNetworkIp()', 'addresses: ' + addresses);
        return addresses[0];
    }

    static isWindows() {
        if (Config._windows) {
            console.log( process.argv[1].substring(0, process.argv[1].length - 17) );
            process.exit(); //TODO: better solution
        }
    }

    static get autoConnect() {
        return Config._autoConnect;
    }

    static set autoConnect(value) {
        Config._autoConnect = value;
    }

    static get reconnectTimeout() {
        return Config._reconnectTimeout;
    }

    static set reconnectTimeout(value) {
        Config._reconnectTimeout = value;
    }

    static get hostname() {
        return Config._hostname;
    }

    static set hostname(value) {
        Config._hostname = value;
    }

    static get port() {
        return Config._port;
    }

    static set port(value) {
        Config._port = value;
    }

    static get windows() {
        return Config._windows;
    }

    static set windows(value) {
        Config._windows = value;
    }

    static get thisVersion() {
        return Config._thisVersion;
    }

    static get logLevel() {
        return Config._logLevel;
    }

    static set logLevel(value) {
        Config._logLevel = value;
    }

    static get debug() {
        return Config._debug;
    }

    static set debug(value) {
        Config._debug = value;
    }

    static getConfig() {
        return new Promise(resolve => {
           let config = {
               api: {
                   debug: Config.debug,
                   logLevel: Config.logLevel,
                   version: {
                       this: Config.thisVersion,
                       latest: "Error"
                   }
               },
               assistant: {
                   id: false,
                   secret: false,
                   token: false
               },
               device: {
                   autoConnect: Config.autoConnect,
                   reconnectTimeout: Config.reconnectTimeout
               }
           };
           Promise.all([
               Config.getLatestVersion().catch(()=>{return "Error"}),
               AssistantSetup.checkSetup().catch(()=>{return {id: false, secret: false, token: false}})
           ])
               .then(values => {
                   config.api.version.latest = values[0];
                   config.assistant = values[1];
                   resolve(config);
               })
               .catch(error=>{
                   console.log(error);
                   resolve(config);
               })

        });
    }
}

module.exports = Config;