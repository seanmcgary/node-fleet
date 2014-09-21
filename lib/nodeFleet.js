var _ = require('lodash');
var q = require('q');
var ErrorTypes = require('./errorTypes').types;
var ApiError = require('./errorTypes').ApiError;

var Request = require('./request');

var apis = require('./discovery');

function Client(options){
	var self = this;
	self.options = _.defaults(options || {}, {
		apiVersion: 'v1-alpha'
	});

	if(self.options.schema){
		self.schema = self.options.schema;
	} else {
		self.schema = apis[self.options.apiVersion];
		if(!self.schema){
			return q.reject({
				message: 'invalid api version',
				validVersions: _.keys(apis)
			});
		}
	}

	self.Request = new Request(options);
	return self.parseResources(self.schema.resources);
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

var clientFromDiscovery = function(clientOptions){

	if(!clientOptions.apiVersion){
		throw new ApiError(ErrorTypes.MISSING_FIELDS, {
			apiVersion: 'missing api version'
		});
	}

	var req = new Request(clientOptions);

	return req.GET(['', clientOptions.apiVersion, 'discovery.json'].join('/'))
	.then(function(schema){
		return new Client(_.extend({
			schema: schema
		}, clientOptions));
	});
};

exports.Client = Client;
exports.ClientFromDiscovery = clientFromDiscovery;