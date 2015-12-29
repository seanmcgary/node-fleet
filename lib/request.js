'use strict';

var _ = require('lodash');
var ErrorTypes = require('./errorTypes').types;
var ApiError = require('./errorTypes').ApiError;
var qs = require('querystring');
var Promise = require('bluebird');

function Request(options){
	this.options = _.defaults(options || {}, {
		secure: false,
		timeout: 30 * 1000
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
	
	params = params || {};
	data = data || {};
	
	return new Promise((resolve, reject) => {
		if(!method){
			reject(new ApiError(ErrorTypes.MISSING_FIELDS, {
				method: 'method is missing'
			}));
		}

		if(!path){
			reject(new ApiError(ErrorTypes.MISSING_FIELDS, {
				method: 'path is missing'
			}));
		}

		if(path && _.keys(params).length){
			path = [path, qs.stringify(params)].join('?');
		}

		var options = {
			path: path,
			method: method,
			headers: {
				'Content-Type': 'application/json'
			}
		};
		if (this.options.socketPath) {
			options.socketPath = this.options.socketPath;
		} else {
			options.host = this.options.host;
			options.port = this.options.port;
		}  
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
					return reject(new ApiError(ErrorTypes.INVALID_JSON_RESPONSE));
				}

				if(_.indexOf([2, 3], shortCode) < 0){
					return reject(data);
				} else {
					return resolve(jsonResponse);
				}
			});
		});

		req.setTimeout(this.options.timeout, function(){
			return reject(new ApiError(ErrorTypes.REQUEST_TIMEOUT));
		});

		req.on('error', function(error){
			return reject(new ApiError(ErrorTypes.REQUEST_ERROR, {
				error: error
			}));
		});

		if(method != 'GET' && data){
			req.write(JSON.stringify(data));
		}
		req.end();
	});
};

module.exports = Request;
