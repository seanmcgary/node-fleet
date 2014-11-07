var NodeFleet = require('../');
var _ = require('lodash');

var options = {
	host: '',
	port: 10000,
	secure: false,
	apiVersion: 'v1-alpha'
};

NodeFleet.ClientFromDiscovery(options)
.then(function(client){
	client.Units.List()
	.then(function(units){
		console.log(units);


		var someUnit = units.units[0];

		var textUnitFile = NodeFleet.convertUnitJsonToText(someUnit.options);
		console.log(textUnitFile);
		console.log(NodeFleet.convertUnitToJson(textUnitFile));

	}, function(err){
		console.log('err');
		console.log(arguments);
	});
}, function(){
	//console.log(arguments)
});