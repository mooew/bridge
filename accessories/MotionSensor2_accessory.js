var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var bus = require('../bridge/bridgeKNX');

var wpi = require('wiringpi-node');
wpi.setup('phys');
var sensorReading = Number(wpi.digitalRead(15));  //motion value
var newStatus;

var MOTION_SENSOR = {
  motionDetected: false,

  getStatus: function() {   //get the motion of the accessories is used for logging in app
    sensorReading = Number(wpi.digitalRead(15));
    console.log('getStatus of motion function is activated');
    if (1){
      this.motionDetected = true;
    }
    if (sensorReading == '0'){
      MOTION_SENSOR.motionDetected = false;
    }
  },
  identify: function() {
    console.log("Identify the motion sensor!");
  }
}

// Generate a consistent UUID for our Motion Sensor Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "motionsensor".
var motionSensorUUID = uuid.generate('hap-nodejs:accessories:motionsensor2');


var motionSensor = exports.accessory = new Accessory('Motion 2', motionSensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
motionSensor.username = "4A:4B:4D:4D:4E:4F";
motionSensor.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
motionSensor
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Generic")
  .setCharacteristic(Characteristic.Model, "Motion 2");

// listen for the "identify" event for this Accessory
motionSensor.on('identify', function(paired, callback) {
  MOTION_SENSOR.identify();
  callback(); // success
});

motionSensor
  .addService(Service.MotionSensor, "Motion 2")
  .getCharacteristic(Characteristic.MotionDetected)
  .on('get', function(callback) {
     MOTION_SENSOR.getStatus();
     callback(null, Boolean(MOTION_SENSOR.motionDetected));
});

//wijzig de waarde van de motion sensor

    // event listener to update the motion value
    bus.KNXevent.on('motion', function(value){
    MOTION_SENSOR.motionDetected = value;
    console.log("updated status to: " + value);
    motionSensor
    .getService(Service.MotionSensor)
    .setCharacteristic(Characteristic.MotionDetected, MOTION_SENSOR.motionDetected);

    });
