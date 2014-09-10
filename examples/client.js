var NodeFleet = require('../');

console.log(NodeFleet);

var client = new NodeFleet.Client({
	host: 'coreos-alpha435-node1.internal.thirdlove.com',
	port: 10000,
	secure: false
});

client.then(function(client){
	client.Units.List()
	.then(function(machines){
		console.log(machines);
	}, function(){
		console.log(arguments);
	});
}, function(err){
	console.log("CLIENT ERROR", err);
});