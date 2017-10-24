//bridge to KNX
var WriteToBus  = require('./knx/node_modules/knx_eibd').WriteToBus;
var events = require('events');
var knx = require('./knx/node_modules/knx_eibd').knx_event
var KNXevent = new events.EventEmitter();

var knxWriteOn = function(){
	console.log('bridge to knx - switch on');
	WriteToBus('0/0/5','DPT1',1);
};

var knxWriteOff = function(){
	console.log('bridge to knx - switch off');
	WriteToBus('0/0/5','DPT1',0);
};


function checkForSceneGroupAddrs(data){
	//hier komt men telkens in wanneer er een bus event is
	//controleer dus ook dat de wijzeging niet door de homekit zelf komt
 	if (data.source != '1.1.129' & data.source != '1.1.130'
	& data.source != '1.1.131' & data.source != '1.1.132' & data.source != '1.1.133'
	& data.source != '1.1.134' & data.source != '1.1.135' & data.source != '1.1.136'){			//change on lamp zetel
			if(data.destination == '0/0/5'){
					console.log('lamp is updated by KNX event not by homekit');
					console.log('source: ' + data.source);
					KNXevent.emit('update', data.value);
				}

			if(data.destination == '0/0/1'){
				console.log('motion is detected by KNX event not by homekit');
				console.log('source: ' + data.source);
				console.log('value: ' + data.value);
				KNXevent.emit('motion', data.value);
				}

			if(data.destination == '0/0/2'){
					console.log('temp is received by KNX');
					console.log('source: ' + data.source);
					console.log('value: ' + data.value);
					KNXevent.emit('temp', data.value);
					}

			};
 	};
////////////////////////////////////////////////////////////////////////////////
////////////////////////// Write to Bus ////////////////////////////////////////

KNXevent.on('switchOn', knxWriteOn);					//homekit lamp aan
KNXevent.on('switchOff', knxWriteOff);				//homekit lamp uit

KNXevent.on('value', function(value){					//homekit verander brightness
	brightness = (value / 100)*255;
	WriteToBus('0/0/6','DPT5',brightness);
});

////////////////////////////////////////////////////////////////////////////////
/////////////////////////// From bus ///////////////////////////////////////////

knx.on('bus_event', function(data){
	checkForSceneGroupAddrs(data);
	});


////////////////////////////////////////////////////////////////////////////////
exports.KNXevent = KNXevent;
