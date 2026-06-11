var ROSLIB = require('roslib');

const Ros = class {
  constructor(ip) { 
      this.ip = ip;
	  this.ros = new ROSLIB.Ros({
		  url : 'ws://'+ip+':9090'
	   });
	    this.ros.on('connection', function(data) {
	     console.log('Connected to websocket server.',data.target.url);
		});

		this.ros.on('error', function(error) {
		  console.log('Error connecting to websocket server: ', error);
		});

		this.ros.on('close', function() {
		  console.log('Connection to websocket server closed.');
		});
  } 
  
  getConnection() { 
    if(this.ros.isConnected)
	  return this.ros;
    else 
	  return undefined;
  }
  
  isConnected(){
	  return this.ros.isConnected;
  }
}; 
  
module.exports = Ros;