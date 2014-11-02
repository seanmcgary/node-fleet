var fs = require('fs');
var path = require('path');
var NodeFleet = require('../');

var unitFile = fs.readFileSync(__dirname + '/test-unit@.service').toString();

console.log(NodeFleet.convertUnitToJson(unitFile));