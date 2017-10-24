//
var cmd = require('node-cmd');
var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var bus = require('../bridge/bridgeKNX');

var relayPin = 16; //Physical Pin Number for the relay you wish to be able to use. Change as you desire...

var LightController = {
  name: "Lamp zetel", //name of accessory
  pincode: "031-45-154",
  username: "1A:2A:3A:4A:5A:6A", // MAC like address used by HomeKit to differentiate accessories.

  manufacturer: "HAP-NodeJS", //manufacturer (optional)
  model: "v1.0", //model (optional)
  serialNumber: "lamp zetel", //serial number (optional)

  power: false, //curent power status
  brightness: 100, //current brightness fon't care first time startup

  outputLogs: true, //output logs

  setPower: function(status) { //set power of accessory
    if(this.outputLogs) console.log("Turning the '%s' %s", this.name, status ? "on" : "off");
    this.power = status;
    if(status){
		cmd.run('sudo python /home/pi/HAP-NodeJS/python/light1.py ' + relayPin);
		console.log("magic on");
    bus.KNXevent.emit('switchOn');
		}
    else {
		cmd.run('sudo python /home/pi/HAP-NodeJS/python/light0.py ' + relayPin);
		console.log("magic off");
    bus.KNXevent.emit('switchOff');
		}
  },

  getPower: function() { //get power of accessory from intern homekit
    if(this.outputLogs) console.log("'%s' is %s.", this.name, this.power ? "on" : "off");
    return this.power ? true : false;     //bij openen van control panel wordt verkeerde waarde geupdated!!!
  },

// /*
  setBrightness: function(brightness) { //set brightness
    if(this.outputLogs) console.log("Setting '%s' brightness to %s", this.name, brightness);
    this.brightness = brightness;
    bus.KNXevent.emit('value', brightness);
  },

  getBrightness: function() { //get brightness
    if(this.outputLogs) console.log("'%s' brightness is %s", this.name, this.brightness);
    return this.brightness;
    },

// */

  identify: function() { //identify the accessory
    if(this.outputLogs) console.log("Identify the '%s'", this.name);
  }
}

// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "light".
var lightUUID = uuid.generate('hap-nodejs:accessories:light' + LightController.name);

// This is the Accessory that we'll return to HAP-NodeJS that represents our light.
var lightAccessory = exports.accessory = new Accessory(LightController.name, lightUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
lightAccessory.username = LightController.username;
lightAccessory.pincode = LightController.pincode;

lightAccessory
  .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, LightController.manufacturer)
    .setCharacteristic(Characteristic.Model, LightController.model)
    .setCharacteristic(Characteristic.SerialNumber, LightController.serialNumber);

lightAccessory.on('identify', function(paired, callback) {
  LightController.identify();
  callback();
});

lightAccessory
  .addService(Service.Lightbulb, LightController.name)
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    LightController.setPower(value);
    callback();
  })
  .on('get', function(callback) {
    callback(null, LightController.getPower());
  });

//  /*
  // To inform HomeKit about changes occurred outside of HomeKit (like user physically turn on the light)
// Please use Characteristic.updateValue


bus.KNXevent.on('update', function(value) {
console.log(value);
LightController.power = value;
  lightAccessory
     .getService(Service.Lightbulb)
     .getCharacteristic(Characteristic.On)
     .updateValue(value);
     console.log('update ipad');

});



// also add an "optional" Characteristic for Brightness
lightAccessory
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Brightness)
  .on('set', function(value, callback) {
    LightController.setBrightness(value);
    callback();
  })
  .on('get', function(callback) {
    callback(null, LightController.getBrightness());
  });

// */
