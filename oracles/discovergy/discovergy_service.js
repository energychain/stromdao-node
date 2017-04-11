'use strict';
exports.register = function (server, options, next) {
    const Bootstrap=require("./bootstrap.js");
	const Discovergy=require("./discovergy.js");
	const TXifier=require("./txifier.js");	
	var mpid = options.mpid;
	var bootstrap = new Bootstrap(function() {
											
			
					
				console.log("doSingleCall",mpid);			
				var txifier = new TXifier({mpid:mpid,peer_in:'0xD87064f2CA9bb2eC333D4A0B02011Afdf39C4fB0',peer_out:'0xD87064f2CA9bb2eC333D4A0B02011Afdf39C4fB0'},bootstrap);
				txifier.zsg(
				
						function(o,hash) {
							console.log("SmartMeterOracle:",o.address,o.bc,o.gwatx,hash);						
						}
				
				);
			
			
	});



    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};

