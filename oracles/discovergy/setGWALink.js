const Bootstrap=require("./bootstrap.js");


var bootstrap = new Bootstrap(function() {
	    var vm = bootstrap;
	    vm.storage.setItemSync("gwalink",process.argv[2]);
	    var deployment = vm.storage.getItemSync("deployment");
	    if(typeof deployment  == "undefined") { deployment = {}; }
	    deployment.gwalink=process.argv[2];
	    vm.storage.setItemSync("deployment",deployment);
	    process.exit(0);
});