dapp.negotiation = {};
dapp.negotiation.factory = function(rfp) {
	var msg = {};
	msg.started=new Date();
	msg.type="rfp";
	msg.rfp=rfp;
	msg.pubkey=dapp.localstorage.getValue("sessionkey").publicKeyArmored;
	
	var data={data:JSON.stringify(msg)};
	var p1 = new Promise(function(resolve, reject) { 	
		dapp.core.wallet.signNodeRequest("test").then( function() {
				dapp.core.wallet.signNodeRequest("ipfs/add",data).then(function(o) {
						resolve(o.storage.hash);
				});
			}
		)
	});	
	return p1;
};


dapp.negotiation.load=function(hash) {
	var p1 = new Promise(function(resolve, reject) { 
		dapp.negotiation.loadRaw(hash).then(function(raw) {			
			resolve(JSON.parse(raw.data));		
		});		
	});
	return p1;
}

dapp.negotiation.respond=function(hash,responds) {
	var msg = {};
	msg.started=new Date();
	msg.type="respond";
	msg.respond=hash;
	msg.responds=responds;
	msg.pubkey=dapp.localstorage.getValue("sessionkey").publicKeyArmored;
	var data={data:JSON.stringify(msg)};
	var p1 = new Promise(function(resolve, reject) { 	
		dapp.core.wallet.signNodeRequest("test").then( function() {
				dapp.core.wallet.signNodeRequest("ipfs/add",data).then(function(o) {
						resolve(o.storage.hash);
				});
			}
		)
	});	
	return p1;
}
dapp.negotiation.loadRaw=function(hash) {
	var p1 = new Promise(function(resolve, reject) { 	
			$.getJSON("/cat/?hash="+hash,function(o) {
					resolve(o);
			});	
	});
	return p1;
}