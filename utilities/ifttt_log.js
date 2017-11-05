//usb logger module

// *************************************************************************
// This module records every knx bus data transaction and ends it to the IFTTT Maker
// channel.
// **************************************************************************


//import required modules
var knx  	= require('../bridge/knx/node_modules/knx_eibd').knx_event;
var request = require('request');
const fs = require('fs');


knx.on('bus_event', function(data){
	request({
		url : 'https://maker.ifttt.com/trigger/knx_event/with/key/mZZWMZxaQVlTPwc3lUVOS',
		method : 'POST',
		form : {
			"value1": "S" + data.source.toString(),
			"value2": "D" + data.destination.toString(),
			"value3": data.value
		}
	},
		function(error, response, body){
  			if(error) {
        		console.log(error);
    		} else {
 //       		console.log(response.statusCode, body);
		};
	});
//-----------------------------------------------------------------------------
	var jdata = JSON.stringify(data);
	fs.appendFile('log.txt', '\n' + jdata, (err) => {
   		if (err) throw err;
   		 console.log('write  to file');
	});


//-----------------------------------------------------------------------------

	if(data.destination === '0/0/6'){
		var time = data.time;
		var val = data.value;
		fs.appendFile('dim.csv', '\n' + time + ',' + val, (err) => {
				if (err) throw err;
				 console.log('write  to file');
		});

	}



});
