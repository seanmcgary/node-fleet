var NodeFleet = require('../');

var options = {
	host: 'fleet-api-test',
	port: 10000,
	secure: false,
	apiVersion: 'v1-alpha'
};

NodeFleet.ClientFromDiscovery(options)
.then(function(client){
	client.Machines.List()
	.then(function(machines){
		console.log(machines);
	}, function(){
		//console.log('err');
		//console.log(arguments);
	});
}, function(){
	//console.log(arguments)
});

// OR

var client = new NodeFleet.Client();

client.Machines.List()
.then(function(machines){
	console.log(machines);
}, function(){
	//console.log('err');
	//console.log(arguments);
});