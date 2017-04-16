/**
  Discovergy specific OAuth implementation and persist into local storage
*/

const Bootstrap=require("./bootstrap.js");
const Discovergy=require("./discovergy.js");
var ethers = require('ethers');

var storage = require('node-persist');

if(process.argv.length<4) {
	console.log("Required node node_auth.js [username] [password] ([privateKey])");
	//console.log(process.argv);
	process.exit();
}

var dgy_username=process.argv[2];
var dgy_password=process.argv[3];
if(process.argv.length==5) {
	var privateKey=process.argv[4];
}

var bootstrap = new Bootstrap(function() {
	    var vm = bootstrap;
		var dgy = new Discovergy('',vm);
		
		dgy.CreateAuth(vm,dgy_username,dgy_password).then(function(o) {		
			vm.config.set("dgy.token",o.oauth_token);
			vm.storage.setItemSync("dgy.token",o.oauth_token);	

			// Now creating ETH Address to use..
			//console.log("MWA",o);
			var key=vm.storage.getItemSync("node.privateKey");
			if(typeof key=="undefined") {
			mwallet = new ethers.Wallet.fromBrainWallet(o.oauth_token, o.oauth_token_secret).then(function(mwallet) {
					
					vm.storage.setItemSync("node.privateKey",mwallet.privateKey);
					vm.storage.setItemSync("node.address",mwallet.address);
					setTimeout(function() {
							console.log("Discovergy Oauth Written for ",o.oauth_token);
							console.log("Authority Address (Oracle)",mwallet.address); 
							console.log("Private Key",mwallet.privateKey);
							process.exit();
					},1000);
			});
			} else {
				console.log("Discovergy Oauth Written for ",o.oauth_token);
				console.log("REUSE");
				console.log("Authority Address (Oracle)",vm.storage.getItemSync("node.address")); 
				console.log("Private Key",key);
				process.exit(); 
			}
		});		
});