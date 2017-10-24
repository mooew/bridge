var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var wpi = require('wiringpi-node');
wpi.setup('phys');
var sensorReading = Number(wpi.digitalRead(15));  //motion value
var newStatus;

var MOTION_SENSOR = {
  motionDetected: false,

  getStatus: function() {
    sensorReading = Number(wpi.digitalRead(15));
    if (sensorReading == '1'){
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
var motionSensorUUID = uuid.generate('hap-nodejs:accessories:motionsensor');


var motionSensor = exports.accessory = new Accessory('Motion Sensor', motionSensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
motionSensor.username = "3A:3B:3D:3D:3E:3F";
motionSensor.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
motionSensor
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Generic")
  .setCharacteristic(Characteristic.Model, "Motion Sensor");

// listen for the "identify" event for this Accessory
motionSensor.on('identify', function(paired, callback) {
  MOTION_SENSOR.identify();
  callback(); // success
});

motionSensor
  .addService(Service.MotionSensor, "Motion Sensor")
  .getCharacteristic(Characteristic.MotionDetected)
  .on('get', function(callback) {
     MOTION_SENSOR.getStatus();
     callback(null, Boolean(MOTION_SENSOR.motionDetected));
});

setInterval(function() {    //check elke 0.5 s de waarde van de motion sensor
  sensorReading = Number(wpi.digitalRead(15));
  if (sensorReading == 1){
    newStatus = true;                     //motion - set statud true
  }
  if (sensorReading == 0){
    newStatus = false;                    //no motion - set statud false
  }

  if(newStatus != MOTION_SENSOR.motionDetected){      //in case of change (old != new)
    console.log("updated status to: " + newStatus);
    MOTION_SENSOR.motionDetected = newStatus;         //update status
    motionSensor
      .getService(Service.MotionSensor)
      .setCharacteristic(Characteristic.MotionDetected, MOTION_SENSOR.motionDetected);
  }
}, 500);
