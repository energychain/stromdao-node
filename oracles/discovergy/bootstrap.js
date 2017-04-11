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
		this.orbitdb = new OrbitDB(this.ipfs);
		this.config = this.orbitdb.kvstore("config");
		this.config.load();
		if(fs.existsSync("smart_contracts/deployment_poa.json")) this.deployment = JSON.parse(fs.readFileSync("smart_contracts/deployment_poa.json")); else
		if(fs.existsSync("../smart_contracts/deployment_poa.json")) this.deployment = JSON.parse(fs.readFileSync("../smart_contracts/deployment_poa.json")); else
		if(fs.existsSync("../../smart_contracts/deployment_poa.json")) this.deployment = JSON.parse(fs.readFileSync("../../smart_contracts/deployment_poa.json"));
		this.dgy_token = this.storage.getItemSync("dgy.token");
		
		this.config.events.on('ready', function() { 
					
			callback();

		} );
}