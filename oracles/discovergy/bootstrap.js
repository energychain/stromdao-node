var storage = require('node-persist');
var ipfsAPI = require('ipfs-api');
const OrbitDB = require('orbit-db');
const fs = require("fs");
/*
  defines a Singleton instance to manage vm 
*/
module.exports = function (callback) {
			
		this.storage = require('node-persist');
		var cwd=process.cwd();
		
		var storage_options = {
			
		};
		
		if(cwd.indexOf('oracles/discovergy')>0) {
			storage_options.dir = "../../.node-persist/storage/";
		}
		if(cwd.indexOf('node_modules/stromdao-discovergy')>0) {
			storage_options.dir = "../../.node-persist/storage/";
		} 
		console.log("CWD Storage",storage_options,cwd);
		this.storage.initSync(storage_options);
		
		this.ipfs= ipfsAPI('localhost', '5001', {protocol: 'http'});
		var stromdaonodes = [
		    { ipfs:'/ip4/45.32.155.49/tcp/4001/ipfs/QmYdn8trPQMRZEURK3BRrwh2kSMrb6r6xMoFr1AC1hRmNG',
			  node:'45.32.155.49:8081' 
			},
			{
				ipfs:'/ip4/108.61.210.201/tcp/4001/ipfs/QmZW7WWzGB4EPKBE4B4V8zT1tY54xmTvPZsCK8PyTNWT7i',
				node:'108.61.210.201:8081'
			}
		];
		
		stromdaonodes.forEach((n) => {
			console.log("Connecting",n);
			this.ipfs.swarm.connect(n.ipfs);	
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
		var gwalink = this.storage.getItemSync("gwalink");
		if(typeof gwalink != "undefined") {
			this.deployment.gwalink=gwalink;
			console.log("GWALink",gwalink);
		}
		this.dgy_token = this.storage.getItemSync("dgy.token");

		this.config.events.on('ready', function() { 
					
			callback();

		} );
}