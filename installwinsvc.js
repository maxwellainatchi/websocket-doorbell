let svc = require("./servicedefinition");

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  	svc.start();
});
 
svc.install();
