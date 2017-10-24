var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var bus = require('../bridge/bridgeKNX');

// here's a fake temperature sensor device that we'll expose to HomeKit
var FAKE_SENSOR = {
  currentTemperature: 50,
  getTemperature: function() {
    console.log("Getting the current temperature!");
    return FAKE_SENSOR.currentTemperature;
  },

  ///////////////////
  randomizeTemperature: function() {
    // randomize temperature to a value between 0 and 100
    FAKE_SENSOR.currentTemperature = Math.round(Math.random() * 100);
  }
/////////////////

}


// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:TemperatureSensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('temp', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "51:5D:5A:5E:5E:5A";
sensor.pincode = "031-45-154";

sensor
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Generic")
  .setCharacteristic(Characteristic.Model, "temp");



// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.TemperatureSensor, "temp")
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {

    // return our current value
    callback(null, FAKE_SENSOR.getTemperature());
  });

// randomize our temperature reading every 3 seconds
//laat deze updaten door een bus emit van temp!!!

bus.KNXevent.on('temp', function(value){
  FAKE_SENSOR.currentTemperature = value;
  sensor
    .getService(Service.TemperatureSensor)
    .setCharacteristic(Characteristic.CurrentTemperature, FAKE_SENSOR.currentTemperature);
});
