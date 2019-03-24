const logger = require('../../../log/logger');
const configuration = require('../../../config/config');

class CastGroup {
    constructor(master, members=new Map()) {
        this._master = master;
        this._members = members;

        this.setListeners();
    }

    setListeners() {
        this._master.on('statusChanged', () => {
            this.syncStatus();
        });
    }

    volume(target) {
        let response = {response: 'error', error: 'no group members'};
        if (this._members) {
            this._members.forEach(member => {
                logger.log('info', 'CastGroup.volume(target)', 'members: '+member.toObject(), this._master.id);
                response = member.volume(target);
            });
        }
        return response;
    }

    syncStatus() {
        if (this._members) {
            if (this._master.link === 'connected' && this._master.sessionId != null) {
                logger.log('info', 'CastGroup.syncStatus()', 'syncing group this._master.sessionId'+this._master.sessionId, this._master.id);
                this.setStatus(this.getMediaStatus(this._master.toObject()));
            } else {
                logger.log('info', 'CastGroup.syncStatus()', 'used to be group, remove & reset', this._master.id);

                this.setStatus({groupPlayback: {on: false, from: this._master.id}, application: '', status: '', title: '', subtitle: '', image: ''});
                //TODO: reset as well, either in cast-device set status (if was groupPlayback) or see if cast-device sends new status on its own
            }
        } else {
            logger.log('info', 'CastGroup.syncStatus()', 'has no members, removing', this._master.id); //TODO: wtf? If it has no members, what are we iterating over for delete??

            this.setStatus({groupPlayback: {on: false, from: this._master.id}});
        }
    }

    setStatus(status) {
        this._members.forEach(member => {
            console.log('new status: '+JSON.stringify(status));
            member.status = status;
        });
    }

    getMediaStatus(status) {
        return {
            'groupPlayback': {on: status.id, from: status.id},
            'application': status.status.application,
            'status': status.status.status,
            'title': status.status.title,
            'subtitle': status.status.subtitle,
            'image': status.status.image
        };
    }

    addMember(castDevice) {
        let member = this._members.get(castDevice.id);

        if (!member) {
            castDevice.groups.set(this._master.id, this._master);
            this._members.set(castDevice.id, castDevice);
            this._master.emit('statusChanged');
        }
    }

    removeMember(castDevice) {
        this._members.delete(castDevice.id);
        castDevice.groups.delete(this._master.id);
        logger.log("info", "CastGroup.removeMember()",'removed member', castDevice.id);
    }

    get members() {
        let members = [];
        this._members.forEach(member => {
            members.push(member.id);
        });
        return members;
    }

}

module.exports = CastGroup;