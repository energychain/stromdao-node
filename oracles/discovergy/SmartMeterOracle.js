const Bootstrap=require("./bootstrap.js");
const Discovergy=require("./discovergy.js");


var bootstrap = new Bootstrap(function() {
								
		
		function doSingleCall(mpid,bootstrap) {		
		
			var TXifier=require("./txifier.js");		
			console.log("doSingleCall",mpid);			
			txifier = new TXifier({mpid:mpid,peer_in:'0xD87064f2CA9bb2eC333D4A0B02011Afdf39C4fB0',peer_out:'0xD87064f2CA9bb2eC333D4A0B02011Afdf39C4fB0'},bootstrap);
			txifier.zsg(
			
					function(o,hash) {
						console.log("SmartMeterOracle:",o.address,o.bc,o.gwatx,hash);						
					}
			
			);
		}

		console.log("Node:",bootstrap.storage.getItemSync("node.address"));
		doSingleCall(process.argv[2],bootstrap);			
});


