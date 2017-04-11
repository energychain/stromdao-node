'use strict';



const discovergyService = {
    register: function (server, options, next) {
    
	const Bootstrap=require("./oracles/discovergy/bootstrap.js");
	const Discovergy=require("./oracles/discovergy/discovergy.js");

	var bootstrap = new Bootstrap(function() {
											
			
				var TXifier=require("./oracles/discovergy/txifier.js");		
				console.log("doSingleCall",mpid);			
				txifier = new TXifier({mpid:mpid,peer_in:'0xD87064f2CA9bb2eC333D4A0B02011Afdf39C4fB0',peer_out:'0xD87064f2CA9bb2eC333D4A0B02011Afdf39C4fB0'},bootstrap);
				txifier.zsg(
				
						function(o,hash) {
							console.log("SmartMeterOracle:",o.address,o.bc,o.gwatx,hash);						
						}
				
				);
			
			
	});



    next();
    }
};

discovergyService.register.attributes = {
    name: 'Discovergy Oracle Service for StromDAO',
    version: '0.0.1'
};
