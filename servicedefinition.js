var Service = require('node-windows').Service;
 
// Create a new service object
var svc = new Service({
	name:'Doorbell',
	description: 'A doorbell app.',
	script: require('path').join(__dirname, "main.js"),
	env: {
		name: "PORT",
		value: process.env.PORT || 6274
	}
});

module.exports = svc;
