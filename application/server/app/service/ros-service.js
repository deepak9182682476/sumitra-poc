var ROSLIB = require('roslib');
var topic = require('./topic.js');
//topic = topic();

module.exports = function(rosIp){

    var ros = new ROSLIB.Ros({
		url : 'ws://'+rosIp+':9090'
	});
	return ros;
}
// topic(ros);