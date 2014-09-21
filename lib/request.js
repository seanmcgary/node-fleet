var _ = require('lodash');
var ErrorTypes = require('./errorTypes').types;
var ApiError = require('./errorTypes').ApiError;
var qs = require('querystring');
var q = require('q');

function Request(options){
	this.options = _.defaults(options || {}, {
		host: 'localhost',
		port: 8080,
		secure: false
	});

	this.http = this.options.secure ? require('https') : require('http');
};

Request.prototype.GET = function(path, params){
	return this.makeRequest('GET', path, params);
};

Request.prototype.POST = function(path, params, data){
	return this.makeRequest('POST', path, params, data);
};

Request.prototype.PUT = function(path, params, data){
	return this.makeRequest('PUT', path, params, data);
};

Request.prototype.DELETE = function(path, params, data){
	return this.makeRequest('DELETE', path, params, data);
};

Request.prototype.makeRequest = function(method, path, params, data){
	var deferred = q.defer();
	params = params || {};
	data = data || {};

	if(!method){
		deferred.reject(new ApiError(ErrorTypes.MISSING_FIELDS, {
			method: 'method is missing'
		}));
	}

	if(!path){
		deferred.reject(new ApiError(ErrorTypes.MISSING_FIELDS, {
			method: 'path is missing'
		}));
	}

	if(path && _.keys(params).length){
		path = [path, qs.stringify(params)].join('?');
	}

	var options = {
		host: this.options.host,
		port: this.options.port,
		path: path,
		method: method,
		headers: {
			'Content-Type': 'application/json'
		}
	};
	var req = this.http.request(options, function(res){

		var data = '';
		res.on('data', function(d){
			data += d.toString();
		});
		res.on('end', function(){
			var statusCode = res.statusCode;
			var shortCode = ~~(statusCode / 100);
			var jsonResponse;
			try {
				jsonResponse = JSON.parse(data);
			} catch(e){}

			if(data.length && !jsonResponse){
				return deferred.reject(new ApiError(ErrorTypes.INVALID_JSON_RESPONSE));
			}

			if(_.indexOf([2, 3], shortCode) < 0){
				return deferred.reject(data);
			} else {
				return deferred.resolve(jsonResponse);
			}

		});
	});

	req.on('error', function(error){
		deferred.reject(new ApiError(ErrorTypes.REQUEST_ERROR, {
			error: error
		}));
	});

	if(method != 'GET' && data){
		req.write(JSON.stringify(data));
	}
	req.end();

	return deferred.promise;
};

module.exports = Request;