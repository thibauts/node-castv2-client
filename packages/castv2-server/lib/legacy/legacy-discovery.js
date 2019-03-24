function discoverZones() {
	return new Promise( function(resolve, reject) {
		if ( getNetworkIp() ) {
			discoverTimes(discoveryRuns, [])
			.then(zoneResults => {
				var merged = [];
				zoneResults.forEach(function(zoneResult) {
					zoneResult.zones.forEach(function(zone) {
						var exists = false;

						merged.forEach(function(mergedZone) {
							if (mergedZone.id == zone.id) {
								exists = true;
								if (zone.groups) {
									zone.groups.forEach(function(groupId) {
										if (mergedZone.groups.indexOf(groupId) < 0) {
											mergedZone.groups.push(groupId);
										}
									});
								}
							}
						});
						
						if (!exists) {
							merged.push(zone);
							log('debug', 'discoverZones()', 'doesnt exist, pushing: ' + zone.id);
						} else {
							log('debug', 'discoverZones()', 'exists, pushed already: ' + zone.id);
						}
					});
				});
				createGoogleZones(merged);
				resolve(merged);			
			})
			.catch(errorMessage => {
				log('error', 'discoverZones()', 'failed: ' + errorMessage);
				reject(errorMessage);
			})
		} else {
			resolve({});
		}
	});
}

function discoverTimes(times, zoneResults) {
	return new Promise( function(resolve, reject) {
		discover('googlezone')
		.then(devices => {
			log('debug', 'discoverTimes()', 'discover("googlezone") done times: '+times+', zoneResults: '+zoneResults+', typeof: '+ typeof zoneResults);
			zoneResults.push({ zones: devices });
			if (times>1) {
				log( 'debug', "discoverTimes()", 'newZoneResults: '+zoneResults+', new times: '+(times-1) );
				resolve( discoverTimes( (times-1), zoneResults ) );
			} else {
				discover('googlecast')
				.then(devices => {
					resolve( zoneResults );
				})
				.catch(errorMessage => {
					log('error', 'discoverTimes()', 'discover("googlecast") failed: ' + errorMessage);
					resolve( zoneResults );
				})
			}
		})
		.catch(errorMessage => {
			log('error', 'discoverTimes()', 'discover("googlezone") failed: ' + errorMessage);
			reject(errorMessage);
		})
	});
}

function existsInMerged(merged, id) {
	var exists = false;
	merged.forEach(function(zone) {
		if (zone.id == id) {
			exists = true;
		}
	});
	return exists;
}

//GOOGLE CAST FUNCTIONS 'googlecast' 'googlezone'
function discover(target) {
	var both = false;
	if (!target) {
		target = 'googlecast';
		both = true;
	}
	return new Promise( function(resolve, reject) {
		var updateCounter=0;
		var discovered = [];
		try {
			if (getNetworkIp) {
				var browser = mdns.createBrowser(mdns.tcp(target));
				var exception;

				browser.on('error', function(error) {
					log('debug', 'discover()', 'mdns browser error: ' + error);
				})

				browser.on('ready', function(){
					browser.discover();
				});

				browser.on('update', function(service){
					//try {
						updateCounter++;
						log('debug', 'discover()', 'update received, service: ' + JSON.stringify(service));
						if (target=='googlecast' && service.type[0].name==target) {
							var currentDevice = {
								id: getId(service.txt[0]),
								name: getFriendlyName(service.txt),
									address: {
										host: service.addresses[0],
										port: service.port
								}
							}
					  		if (!duplicateDevice(discovered, currentDevice) && currentDevice.name!=null ) {
					  			log('debug', 'discover()', 'found device: '+ JSON.stringify(currentDevice));
					  			discovered.push(currentDevice);
					  			updateExistingCastDeviceAddress(currentDevice);

					  			if ( !deviceExists(currentDevice.id) ) {
					  				log('info', 'discover()', 'added device name: '+ currentDevice.name +', address: '+ JSON.stringify(currentDevice.address), currentDevice.id);
					  				devices.push( new CastDevice( currentDevice.id, currentDevice.address, currentDevice.name ) ); //TODO: addDevice
					  			}
					  		} else {
					  			log('debug', 'discover()', 'duplicate, googlezone device or empy name: ' + JSON.stringify(currentDevice));
					  		}
						}
						if (target=='googlezone' && service.type[0].name==target) {
							var currentGroupMembership = {
								id: getId(service.txt[0]).replace(/-/g, ''),
								groups: getGroupIds(service.txt)
							}
							log('debug', 'discover()', 'found googlezone: ' + JSON.stringify(currentGroupMembership) );
							discovered.push(currentGroupMembership);
						}
				 //  	} catch (e) {
					// 	log('error', 'discover()', 'exception while prcessing service: '+e);
					// }
				});
			}
		} catch (e) {
			reject('Exception caught: ' + e);
		}

		setTimeout(() => {
			try{
				browser.stop();
			} catch (e) {
				//reject('Exception caught: ' + e)
			}
			log('debug', 'discover()', 'updateCounter: ' + updateCounter);
			resolve(discovered);
	  	}, timeoutDiscovery);
	});
}

function updateExistingCastDeviceAddress(discoveredDevice) {
	log('debug', 'updateExistingCastDeviceAddress()', 'discoveredDevice: ' + JSON.stringify(discoveredDevice), discoveredDevice.id );
	if ( deviceExists(discoveredDevice.id) ) {
		var castDevice = getDevice(discoveredDevice.id);
		log('debug', 'updateExistingCastDeviceAddress()', 'exists', discoveredDevice.id);
		castDevice.name = discoveredDevice.name;
		if (discoveredDevice.address.host && discoveredDevice.address.port) {
			if (castDevice.address.host != discoveredDevice.address.host || castDevice.address.port != discoveredDevice.address.port) {
				log('info', 'updateExistingCastDeviceAddress()', 'updating address from: '+castDevice.address.host+':'+castDevice.address.port+' to: '+discoveredDevice.address.host+':'+discoveredDevice.address.port, discoveredDevice.id);

				if (castDevice.link == 'connected') {
					castDevice.disconnect();
					castDevice.event.once('linkChanged', function() {
						log('info', 'updateExistingCastDeviceAddress()', 'once linkChanged: ' + castDevice.link, castDevice.id);
						castDevice.address = {
							host: discoveredDevice.address.host,
							port: discoveredDevice.address.port
						};
					});
				} else {
					castDevice.address = {
						host: discoveredDevice.address.host,
						port: discoveredDevice.address.port
					};
				}
			}
		}
	}
}

function createGoogleZones(discoveredZones) {
	log( 'debug', 'createGoogleZones()', 'discoveredZones: ' + JSON.stringify(discoveredZones) );
	var zones = discoveredZones;

	discoveredZones.forEach(function(device) {
		if (device.groups) {
			device.groups.forEach(function(groupId) {
				var groupExists = false;
				zones.forEach(function(element) {
					if (element.id == groupId) {
						groupExists = element;
					}
				});
				if (groupExists) {
					log( 'debug', 'createGoogleZones()', 'groupExists: ' + JSON.stringify(groupExists) );
					groupExists.members.push(device.id);
				} else {
					log( 'debug', 'createGoogleZones()', 'group doesnt exist: ' + groupExists );
					zones.push({
						id: groupId,
						members: [ device.id ]
					});
				}
			});
		}
	});

	log( 'debug', 'createGoogleZones()', 'done! zones: ' + JSON.stringify(zones) );
	devices.forEach(function(device) {
		var zone = { id: device.id };
		
		zones.forEach(function(element) {
			if (element.id == device.id) {
				zone = element;
			}
		});

		device.setZones(zone);
	})
}

function duplicateDevice(devices, device) {
	if (device.id && device.id!=null && devices && devices!=null) {
		for (var i = 0; i < devices.length; i++) {
			if(devices[i].id == device.id) {
				return true;
			}
		}
	}
	return false;
}

function getFriendlyName(serviceTxt) {
	if (!serviceTxt) {
		log('debug-error', 'getFriendlyName()', 'service.txt is missing');
		return;
	}
	var fns = serviceTxt.filter(function (txt) {
		return txt.match(/fn=*/)!=null;
	});
	if (fns.length>0) {
		var fn=fns[0];
		log('debug', 'getFriendlyName()', 'is friendly name: ' + fn);
		return (fn.replace(/fn=*/, ''));
	} else {
		log('debug', 'getFriendlyName()', 'is not friendly name: ' + fn);
	}
}

function getId(id) {
	if (id&&id!=null&&id.match(/id=*/)!=null) {
		log('debug', 'getId()', 'is id: ' + id);
		return (id.replace(/id=*/, ''));
	} else {
		log('debug', 'getId()', 'is not id: ' + id);
	}
}

function getGroupIds(serviceTxt) {
	var groupIds = [];
	serviceTxt.forEach(function(element) {
		try {
			if (!element.includes('id') && !element.includes('__common_time__')) {
				var groupId = element.split('|', 1)[0].split('=', 1)[0]
				log( 'debug', 'getGroupIds()', 'memberId: ' +  groupId);
				if (groupId && groupId != '') {
					groupIds.push(groupId);
				}
			}
		} catch (e) {
			log( 'error', 'getGroupIds()', 'cannot get member, error: ' + e );
		}
	});
	return groupIds;
}