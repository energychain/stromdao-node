const Discovergy=require("./discovergy.js");
const fs = require("fs");
var ipfsAPI = require('ipfs-api');
var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'}); 
var ethers = require('ethers');


module.exports = function (link_definition,vm) {
	this.mpid = link_definition.mpid;	
	
	
	this.peer_in=link_definition.peer_in;
	this.peer_out=link_definition.peer_out;
	this.link_definition=link_definition;	
	this.vm=vm;	
	
	this.zsg = function(cb) {
		vm = this.vm;
		var dgy_token=vm.dgy_token;		
		var dgy_secret = vm.storage.getItemSync(dgy_token).oauth_token_secret;
		var mpid  = this.mpid;		
		// Create key if required...
		var txifier = this;
		var pk = vm.storage.getItemSync("pk."+mpid);
		if(typeof pk =="undefined") {		
			mwallet = new ethers.Wallet.fromBrainWallet(this.mpid, dgy_secret).then(function(mwallet) {
					vm.storage.setItemSync("pk."+mpid,mwallet.privateKey);
					vm.storage.setItemSync("address."+mpid,mwallet.address);
					txifier.withWallet(mwallet,vm,dgy_token,mpid,cb);
			});
		} else {
			mwallet = new ethers.Wallet(pk);
			vm.storage.setItemSync("address."+mpid,mwallet.address);
			txifier.withWallet(mwallet,vm,dgy_token,mpid,cb);			
		}
	}	
			
	this.withWallet=function(mwallet,vm,dgy_token,mpid,cb) {		
			this.stromkonto=mwallet.address;
			
			var txifier = this;
			var res = {};			
			var dgy = new Discovergy(vm.dgy_token,vm);
			var meterId= mpid;	
			console.log("Link/MPID",mpid,this.stromkonto);
			var archiveq = vm.orbitdb.eventlog(this.stromkonto);
			archiveq.load();
			
			archiveq.events.on('ready', function() { 				
				const last_readings = archiveq.iterator().collect();
				var last_reading = last_readings[0];
				if(typeof last_reading !="undefined") {
						res.last_reading = last_reading.payload.value;
				}		
				
				dgy.getMeterReading(meterId,function(o) {	
							
							res.current_reading=o;	
							if(typeof res.current_reading.values == "undefined") {
								return;
							}
							var eo = ""+res.current_reading.values.energyOut;
							var ei = ""+res.current_reading.values.energy;
							res.current_reading.values.energyOut=eo.substr(0,eo.length-7);
							res.current_reading.values.energy=ei.substr(0,ei.length-7);
							var delta={};
							if(typeof res.last_reading=="undefined") {
										res.last_reading = {
											time:0,
											values: { energyOut:0 }
										}
							}
							delta.timestamp=Math.round(res.current_reading.time);
							delta.power_in=res.current_reading.values.energy - res.last_reading.reading_in;
							delta.power_out=res.current_reading.values.energyOut - res.last_reading.reading_out;
							delta.time=res.current_reading.time - res.last_reading.timestamp;
							delta.reading_out=res.current_reading.values.energyOut;
							delta.reading_in=res.current_reading.values.energy;
							
							if( isNaN(delta.power_in) ) delta.power_in=res.current_reading.values.energy;
							if( isNaN(delta.power_out) ) delta.power_out=res.current_reading.values.energyOut;							
							if(  isNaN(delta.time)) delta.time= Math.round(res.current_reading.time/1);

							var ethers = require('ethers');
							var provider = new ethers.providers.FallbackProvider([
										new ethers.providers.JsonRpcProvider("http://localhost:8540/")
							]);	
							console.log("SC",vm.deployment.gwalink);
							var wallet = new ethers.Wallet(vm.storage.getItemSync("node.privateKey"),provider);		
							var fname="gwalink.abi";
							if(fs.existsSync("../../smart_contracts/gwalink.abi")) fname="../../smart_contracts/gwalink.abi";
							if(fs.existsSync("../smart_contracts/gwalink.abi")) fname="../smart_contracts/gwalink.abi";
							if(fs.existsSync("smart_contracts/gwalink.abi")) fname="smart_contracts/gwalink.abi";
							var contract = new ethers.Contract(vm.deployment.gwalink,JSON.parse(fs.readFileSync(fname)), wallet);
							
							var link = txifier.stromkonto;	
																
							contract.zss(""+link+"").then(function(state) {	
																
										delta.bc = {};
										delta.bc.time=res.current_reading.time-state.time;
										delta.bc.power_in=res.current_reading.values.energy-state.power_in;
										delta.bc.power_out=res.current_reading.values.energyOut-state.power_out;										
										txifier.checkTX(cb,archiveq,delta);
								}
							);						
							
						
				});
				
			});	
		
		this.checkTX=function(cb,archiveq,delta) {
			
			var ethers = require('ethers');
			var provider = new ethers.providers.FallbackProvider([
							new ethers.providers.JsonRpcProvider("http://localhost:8540/")
						]);	
			var wallet = new ethers.Wallet(vm.storage.getItemSync("node.privateKey"),provider);
			console.log("gwalink.address",vm.deployment.gwalink);
			var fname="gwalink.abi";
			if(fs.existsSync("../../smart_contracts/gwalink.abi")) fname="../../smart_contracts/gwalink.abi";
			if(fs.existsSync("../smart_contracts/gwalink.abi")) fname="../smart_contracts/gwalink.abi";
			if(fs.existsSync("smart_contracts/gwalink.abi")) fname="smart_contracts/gwalink.abi";
			var contract = new ethers.Contract(vm.deployment.gwalink,JSON.parse(fs.readFileSync(fname)),wallet);
			
			//  TODO: Wir arbeiten hier nur mit den Defaults!
			var link = this.stromkonto;

			var clearance = contract.defaultLimits().then(function(limits) {					
						var isCommitable=true;
						
						if(limits.min_time.toNumber()>delta.bc.time) { isCommitable=false; delta.error ="min_time"; console.log("Uncommit: min_time"); };
						if(limits.max_time.toNumber()<delta.bc.time) { isCommitable=false; delta.error ="max_time";console.log("Uncommit: max_time",limits.max_time.toNumber(),delta.time);}
						
						// Handle Power_In  and Out 
						if((limits.min_power.toNumber()*1>delta.bc.power_in)&&(limits.min_power.toNumber()*1>delta.bc.power_out)) { isCommitable=false; delta.error ="min_power"; console.log("Uncommit: min_power"); }
						if((limits.max_power.toNumber()*1<delta.bc.power_in)&&(limits.max_power.toNumber()*1<delta.bc.power_out)) { isCommitable=false; delta.error ="max_power"; console.log("Uncommit: max_power"); }
															
						delta.address=link;
						if(isCommitable) {
							console.log("Trying to commit");
							contract.ping(link,delta.bc.time,delta.bc.power_in,delta.bc.power_out).then(function(t,e) {
									
									if(!e) {
										delta.gwatx=t;								
										delta.limits=limits;
										delta.link=link_definition;
										archiveq.add(delta).then(function(hash) {
													// Provide PubSub Feedback
													
													ipfs.pubsub.publish('stromdao.link',new Buffer(JSON.stringify({gwa:vm.deployment.gwalink,address:delta.address,hash:hash})),function(l) {  });
													
													cb(delta,hash);
										});		
									} else {
										console.log("Clearance Error",e);
										cb(delta,"");
									}								
							});							
							
						} else {	
							console.log(contract);
							try {
							contract.changeZS(link,wallet.address,delta.bc.power_in,delta.bc.power_out).then(function(t,e) {
								ipfs.pubsub.publish('stromdao.link',new Buffer(JSON.stringify({gwa:vm.deployment.gwalink,address:delta.address})),function(l) { console.log(l); });
								console.log("-> ReSyncZS",link,wallet.address,delta.bc.power_in,delta.bc.power_out);
								cb(delta,"");	
								
							},function(err) {console.log("ERR",err)});
							} catch(e) {
								console.log("E2",e);
								
							}
							
						}
			});
		}
		};
};