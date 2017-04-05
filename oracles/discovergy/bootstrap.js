var storage = require('node-persist');
var ipfsAPI = require('ipfs-api');
const OrbitDB = require('orbit-db');

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
		
		
		this.config.events.on('ready', function() { 
					
			callback();

		} );
}