const CastDevice = require("./id/cast-device");
const MdnsCastBrowser = require("mdns-cast-browser");

class CastBrowser {
    constructor(castManager) {
        this._browser = new MdnsCastBrowser();
        this._browser.discover();
        this._castManager = castManager;
        this.setup();
    }

    setup() {
        this._browser.on('deviceUp', device => {
            let newDevice = new CastDevice(device.id, device.address, device.name);
            console.log('deviceUp: '+JSON.stringify(device));
            this._castManager.addDevice(newDevice);
        });

        this._browser.on('deviceDown', device => {
            console.log('deviceDown: '+JSON.stringify(device));
            this._castManager.removeDevice(device.id); //TODO: Bug: device is removed incl. group ref. on re add group refs dont trigger groupsUp
        });

        this._browser.on('deviceChange', change => {
            console.log('deviceChange: '+JSON.stringify(change));
            this._castManager.updateDevice(change);
        });

        this._browser.on('groupsUp', groups => {
            console.log('groupsUp: ' + JSON.stringify(groups));
            this._castManager.groupUp(groups);
        });

        this._browser.on('groupsDown', groups => {
            console.log('groupsDown: ' + JSON.stringify(groups));
            this._castManager.groupDown(groups);
        });
    }
}

module.exports = CastBrowser;