const CastBrowser = require("./cast-browser");
const CallbackManager = require("../callback/callback-manager");
const Logger = require("../log/logger");
const util = require('util');
CallbackManager.init();

class CastManager {

    constructor() {
        this._devices = new Map();
        this._browser = new CastBrowser(this);
    }

    getDevices(connection) {
        let allDevices = [];
        this._devices.forEach(function(element) {
            if (connection === 'all') {
                allDevices.push( element.toObject() );
            } else {
                if (element.link === connection) {
                    allDevices.push( element.toObject() );
                }
            }
        });
        return allDevices;
    }

    getDeviceConnected(id){
        return new Promise( (resolve, reject) => {
            let targetDevice = this._devices.get(id);

            if (targetDevice) { //TODO: check return value if doesn't exist
                if (targetDevice.link === 'connected') {
                    resolve(targetDevice);
                } else {
                    Logger.log('info', 'getDeviceConnected()', 'castDevice.connect()', id);
                    targetDevice.connect();

                    targetDevice.event.once('linkChanged', () => {
                        Logger.log('debug', 'getDeviceConnected()', 'once linkChanged: ' + targetDevice.link, id);
                        resolve(targetDevice);
                    });

                    setTimeout(() => {
                        resolve(targetDevice);
                    }, 5000);
                }
            } else {
                resolve({id: id, connection: "not found"});
            }
        });
    }

    //browser
    addDevice(device) {
        if (!this._devices.has(device.id)) { //TODO: issue if device down -> device up with new address
            Logger.log('info', 'addDevice()', '', device.id);
            this._devices.set(device.id, device);

            device.on('statusChanged', status => {
                CallbackManager.send(device.toObject());
            });

            device.on('linkChanged', status => {
                CallbackManager.send(device.toObject());
            });
        }
    }

    updateDevice(change) {
        let targetDevice = this._devices.get(change.id);

        if (targetDevice) {
            Logger.log('info', 'updateDevice()', JSON.stringify(change), targetDevice.id);
            if (change.kind === 'name') {
                targetDevice.name = change.value;
            }
            if (change.kind === 'address') {
                targetDevice.address = change.value;	//TODO: deviceChange address can first change port > 20sec later host: disconnect and reconnect in recon man timeout. Make sure to not double recon man
            }
        }
    }

    removeDevice(id) {
        Logger.log('info', 'removeDevice()', '', id);

        if (this._devices.has(id)) {
            this._devices.get(id).remove();

            delete this._devices.get(id);
            this._devices.delete(id);
            Logger.log('info', 'removeDevice()', 'deviceExists: '+this._devices.has(id), id);
        }
    }

    //Group
    groupUp(groups) {
        let member = this._devices.get(groups.id);
        let masters = [];
        if (groups.groups) {
            groups.groups.forEach(group => {
                let master = this._devices.get(group);
                if (master) masters.push(master);
            });
        }

        if (masters && member) {
            masters.forEach(master => {
                master.members.addMember(member);
            })

        }
    }

    groupDown(groups) {
        let member = this._devices.get(groups.id);
        let masters = [];
        if (groups.groups) {
            groups.groups.forEach(group => {
                let master = this._devices.get(group);
                if (master) masters.push(master);
            });
        }

        if (masters) {
            masters.forEach(master => {
                master.members.removeMember(member);
            })
        }
    }

    deviceDump() {
        return util.inspect(this._devices);
    }

    groupDump() {
        let groups = new Map();
        this._devices.forEach(device => {
            groups.set(device.id, util.inspect(device.members));
        });
        return util.inspect(groups);
    }
}

module.exports = CastManager;