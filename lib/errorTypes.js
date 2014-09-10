
exports.types = {
	custom: function(statusCode, code, message){
		var payload = {
			statusCode: statusCode || 500,
			code: code || 'ERROR',
			message: message || 'server_error'
		};
		return payload;
	},
	MISSING_FIELDS: {
		statusCode: 400,
		message: 'Missing fields',
		code: 'missing_fields'
	},
	NOT_FOUND: {
		statusCode: 404,
		message: 'Not found',
		code: 'not_found'
	},
	ACCESS_DENIED: {
		statusCode: 403,
		message: 'Access denied',
		code: 'access_denied'
	},
	INVALID_FIELDS: {
		statusCode: 400,
		message: 'Invalid fields',
		code: 'invalid_fields'
	},
	REQUEST_ERROR: {
		statusCode: 500,
		message: 'request error',
		code: 'request_error'
	},
	INVALID_JSON_RESPONSE: {
		statusCode: 500,
		message: 'invalid json response',
		code: 'invalid_json_response'
	}
};

exports.ApiError = function(type, context){
	this.type = type;
	this.context = context || {};
	return this;
};