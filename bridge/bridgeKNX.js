//bridge to KNX
var WriteToBus  = require('./knx/node_modules/knx_eibd').WriteToBus;
var events = require('events');
var KNXevent = new events.EventEmitter();

var listener1 = function(){
	console.log('bridge to knx - switch on');
	WriteToBus('0/0/5','DPT1',1);
};

var listener2 = function(){
	console.log('listener 1: the light is switched off by wietse');
	WriteToBus('0/0/5','DPT1',0);
};

KNXevent.on('switchOn', listener1);
KNXevent.on('switchOff', listener2);

exports.KNXevent = KNXevent;
