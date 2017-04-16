var storage = require('node-persist');
var ipfsAPI = require('ipfs-api');
const OrbitDB = require('orbit-db');
const fs = require("fs");
/*
  defines a Singleton instance to manage vm 
*/
module.exports = function (callback) {
			
		this.storage = require('node-persist');
		this.storage.initSync();
		
		this.ipfs= ipfsAPI('localhost', '5001', {protocol: 'http'});
		var stromdaonodes = [
		    { ipfs:'/ip4/45.32.155.49/tcp/4001/ipfs/QmYdn8trPQMRZEURK3BRrwh2kSMrb6r6xMoFr1AC1hRmNG',
			  node:'45.32.155.49:3000' 
			}
		];
		
		stromdaonodes.forEach((n) => {
			console.log("Connecting",n);
			ipfs.swarm.connect(n.ipfs);	
		});
		this.orbitdb = new OrbitDB(this.ipfs);
		this.config = this.orbitdb.kvstore("config");
		this.config.load();
		if(fs.existsSync("smart_contracts/deployment_poa.json")) this.deployment = JSON.parse(fs.readFileSync("smart_contracts/deployment_poa.json")); else
		if(fs.existsSync("../smart_contracts/deployment_poa.json")) this.deployment = JSON.parse(fs.readFileSync("../smart_contracts/deployment_poa.json")); else
		if(fs.existsSync("../../smart_contracts/deployment_poa.json")) this.deployment = JSON.parse(fs.readFileSync("../../smart_contracts/deployment_poa.json"));
		var dep=this.storage.getItemSync("deployment");
		if(typeof dep!="undefined") {
			this.deployment=this.storage.getItemSync("deployment");
		} else {
			this.storage.setItemSync("deployment",this.deployment);
		}
		this.dgy_token = this.storage.getItemSync("dgy.token");
		
		this.config.events.on('ready', function() { 
					
			callback();

		} );
}