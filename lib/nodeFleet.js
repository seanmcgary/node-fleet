var _ = require('lodash');
var q = require('q');
var ErrorTypes = require('./errorTypes').types;
var ApiError = require('./errorTypes').ApiError;

var Request = require('./request');

var validApiVersions = [
	'v1-alpha'
];

function Client(options){
	var self = this;
	self.options = _.defaults(options || {}, {
		apiVersion: 'v1-alpha'
	});

	if(_.indexOf(validApiVersions, self.options.apiVersion) < 0){
		return q.reject({
			message: 'invalid api version',
			validVersions: validApiVersions
		});
	}

	self.Request = new Request(options);

	return self.generateApi()
	.then(function(){
		return self;
	});
};

Client.prototype.parseResources = function(resourceList){
	var self = this;
	_.each(resourceList, function(res, key){
		var resource = {};

		_.each(res.methods, function(method, name){

			resource[name] = function(){
				var path = method.path;
				var args = _.values(arguments) || [];

				var urlTokens = path.match(/{.*?}/g);
				if(urlTokens){
					var tokenArgs = _.values(arguments).slice(0, urlTokens.length);
					args = args.slice(urlTokens.length);

					_.each(urlTokens, function(token, i){
						path = path.replace(token, tokenArgs[i]);
					});
				}

				path = ['', self.options.apiVersion, path].join('/');

				// parse params
				_.each(method.parameters, function(v, k){
					method.parameters[k].name = k;
				});
				if(args.length && _.isObject(args[0])){
					args[0] = _.pick(args[0], _.pluck(_.filter(_.values(method.parameters), function(p){ return p.location == 'query'; }), 'name'));
				}

				args.unshift(path);
				return self.Request[method.httpMethod].apply(self.Request, args);
			};
		});

		self[key] = resource;
	});
};

Client.prototype.generateApi = function(){
	var self = this;

	return self.Request.GET('/' + [self.options.apiVersion, 'discovery.json'].join('/'))
	.then(function(schema){
		return self.parseResources(schema.resources);
	});
};


exports.Client = Client;