function connectGroupMembersInit() {
	var that = this;
	this.event.on('statusChange', function() {
		if (that.members) {
			if (that.status.application) {
				if (that.status.application!='Backdrop' && that.status.application!='') { //TODO: use isIdleScreen
					log( 'info', 'connectGroupMembersInit()', 'statusChange is group', that.id );
					syncGroupMemberStatus(that.status, that.members, that.id, true);
				} else {
					log( 'error', 'connectGroupMembersInit()', 'statusChange is APP no title group', that.id );
					resetGroupMemberStatus(that);
				}
			} else {
				log( 'error', 'connectGroupMembersInit()', 'statusChange is NO APP group', that.id );
				resetGroupMemberStatus(that);
			}
		}
	});

	this.event.on('groupChange', function(operation, zone) {
		var level = 'info';

		if (operation == 'remove') {
			level = 'error';
		}

		if (zone.members) {
			log( level, 'on groupChange()', operation+' members: ' + zone.members, zone.id );
			if (operation == 'remove') {
				zone.members.forEach(function(memberId) {
					if ( deviceExists(memberId) ) {
						var member = getDevice(memberId);
						if (member.groupPlayback) {
							log( level, 'on groupChange()', 'resetting groupPlayback for member: ' + memberId, zone.id );
							syncGroupMemberStatus({ application: '', status: '', title: '', subtitle: '', image: '' }, [memberId], zone.id, false); //Why []?
						}
					}
				});
			}
			if (operation == 'add') {
				if ( deviceExists(zone.id) ) {
					var group = getDevice(zone.id);
					log( level, 'on groupChange()', 'evaluating groupPlayback for new members: ' + zone.members, zone.id );
					group.event.emit('statusChange'); //maybe delay, coz event call before actual castDevice change
				}
			}
		}

		if (zone.groups) {
			log( level, 'on groupChange()', operation+' groups: ' + zone.groups, zone.id );
		}
	});
}

function connectGroupMembers(castDevice) { //TODO: remove?
	if (castDevice.members) {
		castDevice.members.forEach(function(member) {
			if ( deviceExists(member) && member && member!='' ) {
				var castDeviceMember = getDevice(member);
				if (castDeviceMember.link=='disconnected') {
					log( 'info', 'connectGroupMembers()', 'connecting member: ' + castDeviceMember.id + ', castDeviceMember.link: '+castDeviceMember.link, castDevice.id );
					//castDeviceMember.link = 'connecting';
					castDeviceMember.connect();
				}
			}
		});
	}

	if (castDevice.groups) {
		castDevice.groups.forEach(function(group) {
			if ( group && group!='' && deviceExists(group) ) {
				var castDeviceGroup = getDevice(group);
				if (castDeviceGroup.link=='disconnected') {
					log( 'info', 'connectGroupMembers()', 'castDevice.connect(), connecting group: ' + group + ', castDeviceGroup.link: '+castDeviceGroup.link, castDevice.id );
					//castDeviceGroup.link = 'connecting';
					castDeviceGroup.connect();
				}
			}
		});
	}
}

function resetGroupMemberStatus(castDevice) {
	if (castDevice.members) { if (castDevice.members[0]) { if ( deviceExists(castDevice.members[0]) ) {
		var member = getDevice(castDevice.members[0]);
		if ( member.status ) {
			if (member.status.groupPlaybackOn == castDevice.id) {
				syncGroupMemberStatus({ application: '', status: '', title: '', subtitle: '', image: '' }, castDevice.members, castDevice.id, false);
			} else {
				log( 'info', 'resetGroupMemberStatus()', 'not resetting, getDevice(castDevice.members[0]).status.groupPlaybackOn: '+getDevice(castDevice.members[0]).status.groupPlaybackOn+' != '+castDevice.id, castDevice.id );
			}
		} else {
			log( 'error', 'resetGroupMemberStatus()', 'device.status: '+device.status, castDevice.id );
		}
		
	} } }
	
}

function syncGroupMemberStatus(status, members, id, groupPlayback) {
	log( 'info', 'syncGroupMemberStatus('+groupPlayback+')', 'to members: '+ members +', new status: '+ JSON.stringify(status), id);

	members.forEach(function(member) {
		if ( deviceExists(member) || member || member!='' ) {
			var castDeviceMember = getDevice(member);
			if (groupPlayback) {
				castDeviceMember.status.groupPlayback = groupPlayback;
				castDeviceMember.status.groupPlaybackOn = id;
			} else {
				delete castDeviceMember.status.groupPlayback;
				delete castDeviceMember.status.groupPlaybackOn;
			}
			for (var key in status) {
				if (key != 'volume' && key != 'muted') {
					castDeviceMember.setStatus(key, status[key]);
				}
			}
		}
	});
}

function setGroupLevel(castDevice, level) {
	log('info', 'setGroupLevel()', 'target level: '+ level, castDevice.id);
	if (castDevice.members) {
		castDevice.members.forEach(function(member) {
			if ( deviceExists(member) || member || member!='' ) {
				getDevice(member).volume(level);
			}
		});
	}
}

function setZonesCastDevice(castDevice, zones) {
	log( 'debug', 'setZonesCastDevice()', 'zones: ' + JSON.stringify(zones), castDevice.id );
	
	if (zones.members) {
		if (castDevice.members) {
			zones.members.forEach(function(memberId) {
				if ( castDevice.members.indexOf(memberId) < 0 ) {
					//log( 'info', 'setZonesCastDevice()', 'added ('+ castDevice.name +') group member: ' + memberId, castDevice.id );
					castDevice.event.emit('groupChange', 'add', { id: castDevice.id, members: [memberId] });
				}
			});
			castDevice.members.forEach(function(memberId) {
				if ( zones.members.indexOf(memberId) < 0 ) {
					//log( 'error', 'setZonesCastDevice()', 'removed ('+ castDevice.name +') group member: ' + memberId, castDevice.id );
					castDevice.event.emit('groupChange', 'remove', { id: castDevice.id, members: [memberId] });
				}
			});
		} else {
			//log( 'info', 'setZonesCastDevice()', 'added ('+ castDevice.name +') group members: ' + zones.members, castDevice.id );
			castDevice.event.emit('groupChange', 'add', { id: castDevice.id, members: zones.members });
		}
		castDevice.members = zones.members;
	} else {
		if (castDevice.members) {
			//log( 'error', 'setZonesCastDevice()', 'removed ('+ castDevice.name +') group members: ' + castDevice.members, castDevice.id );
			castDevice.event.emit('groupChange', 'remove', { id: castDevice.id, members: castDevice.members });
		}
		delete castDevice.members;
	}

	if (zones.groups) {
		if (castDevice.groups) {
			zones.groups.forEach(function(groupId) {
				if ( castDevice.groups.indexOf(groupId) < 0 ) {
					//log( 'info', 'setZonesCastDevice()', 'added ('+ castDevice.name +') group: ' + groupId, castDevice.id );
					castDevice.event.emit('groupChange', 'add', { id: castDevice.id, groups: [groupId] });
				}
			});
			castDevice.groups.forEach(function(groupId) {
				if ( zones.groups.indexOf(groupId) < 0 ) {
					//log( 'info', 'setZonesCastDevice()', 'removed ('+ castDevice.name +') group: ' + groupId, castDevice.id );
					castDevice.event.emit('groupChange', 'remove', { id: castDevice.id, groups: [groupId] });
				}
			});
		} else {
			//log( 'info', 'setZonesCastDevice()', 'added ('+ castDevice.name +') groups: ' + zones.groups, castDevice.id );
			castDevice.event.emit('groupChange', 'add', { id: castDevice.id, groups: zones.groups });
		}
		castDevice.groups = zones.groups;
	} else {
		if (castDevice.groups) {
			//log( 'error', 'setZonesCastDevice()', 'removed ('+ castDevice.name +') groups: ' + castDevice.groups, castDevice.id );
			castDevice.event.emit('groupChange', 'remove', { id: castDevice.id, groups: castDevice.groups });
		}
		delete castDevice.groups;
	}

}