'use strict';
exports.register = function (server, options, next) {
    const Bootstrap=require("./bootstrap.js");
	const Discovergy=require("./discovergy.js");
	const TXifier=require("./txifier.js");	
	var ethers = require('ethers');
	var storage = require('node-persist');
	const Joi = require("joi");
	const fs = require("fs");
	var mpid = options.mpid;
	var bootstrap = new Bootstrap(function() {
												
	server.route({
			method: 'GET',
			path: '/node/gwalink/info',
			handler: function (request, reply) {
				var vm=bootstrap;
				var gwalink=vm.deployment.gwalink;
				if(typeof request.query.gwalink!="undefined") {
					gwalink=request.query.gwalink;
				} 
				var provider = new ethers.providers.FallbackProvider([
					new ethers.providers.JsonRpcProvider("http://localhost:8540/")
				]);	
				var wallet = new ethers.Wallet(vm.storage.getItemSync("node.privateKey"),provider);
				console.log("/node/gwalink/info",gwalink);							
				try {
					var fname="gwalink.abi";
					if(fs.existsSync("../../smart_contracts/gwalink.abi")) fname="../../smart_contracts/gwalink.abi";
					if(fs.existsSync("../smart_contracts/gwalink.abi")) fname="../smart_contracts/gwalink.abi";
					if(fs.existsSync("smart_contracts/gwalink.abi")) fname="smart_contracts/gwalink.abi";
					var contract = new ethers.Contract(gwalink,JSON.parse(fs.readFileSync(fname)),wallet);
					contract.reader_in().then(function (reader_in) {
							console.log("Reader_in",reader_in);
							contract.reader_out().then(function (reader_out) {
								console.log("Reader_out",reader_out);
								reply(JSON.stringify({gwalink:gwalink,reader_in:reader_in[0],reader_out:reader_out[0]}));
							});
					});
					
				} catch(e) {
					console.log(e);
					reply(JSON.stringify({error:e}));
				}
			}	
	});
	
	server.route({
			method: 'GET',
			path: '/node/oracles/discovergy/get',
			handler: function (request, reply) {
				if(typeof request.query.mpid!="undefined") {
					mpid=request.query.mpid;
				}		
				console.log("/node/oracles/discovergy/get",mpid);			
				var txifier = new TXifier({mpid:mpid,peer_in:'0xD87064f2CA9bb2eC333D4A0B02011Afdf39C4fB0',peer_out:'0xD87064f2CA9bb2eC333D4A0B02011Afdf39C4fB0'},bootstrap);
				try {
					txifier.zsg(				
						function(o,hash) {
							console.log("SmartMeterOracle:",o.address,o.bc,o.gwatx,hash);
							reply(JSON.stringify({address:o.address,bc:o.bc,gwatx:o.gwatx,hash:hash}));
						}				
					);
				} catch(e) {
					reply(JSON.stringify({error:e}));
				}
			}	
		});
	});

	server.route({
			method: 'GET',
			path: '/node/oracles/discovergy/meters',
			handler: function (request, reply) {
				console.log("/node/oracles/discovergy/meters",mpid);
				var dgy = new Discovergy(bootstrap.dgy_token,bootstrap);				
				dgy.getMeters(				
					function(o) {						
						reply(JSON.stringify(o));
					}				
				);
			}			
	});
	server.route({
			method: 'GET',
			path: '/node/oracles/discovergy/info',
			handler: function (request, reply) {
						var o = {};
						o.defaultMPID=mpid;
						o.node = {};
						o.node.privateKey=bootstrap.storage.getItemSync("node.privateKey");
						o.node.address=bootstrap.storage.getItemSync("node.address");
						o.node.token=bootstrap.storage.getItemSync("dgy_token");
						o.deployment=bootstrap.deployment;
						reply(JSON.stringify(o));
			
			}			
	});
	server.route({
			method: 'POST',
			path: '/node/set/gwalink',
			handler: function (request, reply) {
					console.log("/node/set/gwalink");
					var vm = bootstrap;
					vm.storage.setItemSync("gwalink",request.orig.gwalink);
				},
			config: {
				validate: {
					payload: {
								gwalink: Joi.string().min(3)								
						   }
				}
			}
	});
	server.route({
			method: 'POST',
			path: '/node/oracles/discovergy/auth',
			handler: function (request, reply) {
				console.log("/node/oracles/discovergy/auth");
				var vm = bootstrap;
				var dgy = new Discovergy('',vm);
				console.log(request.orig);
				var dgy_username=""+request.orig.payload.email;
				var dgy_password=""+request.orig.payload.password;
				dgy.CreateAuth(vm,dgy_username,dgy_password).then(function(o) {		
					vm.config.set("dgy.token",o.oauth_token);
					vm.storage.setItemSync("dgy.token",o.oauth_token);	
							var mwallet = new ethers.Wallet.fromBrainWallet(o.oauth_token, o.oauth_token_secret).then(function(mwallet) {
									
									vm.storage.setItemSync("node.privateKey",mwallet.privateKey);
									vm.storage.setItemSync("node.address",mwallet.address);
									var obj = {};
									obj.token = o.oauth_token;
									obj.address = mwallet.address;
									obj.privateKey=mwallet.privateKey;
									reply(JSON.stringify(obj));
							});
				});	
			},
			config: {
				validate: {
					payload: {
								email: Joi.string().min(3),
								password: Joi.string().min(4)								
						   }
				}
			}
	});

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};

