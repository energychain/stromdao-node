dapp.core.loadModule("stromdao.transient_store");
dapp.core.loadModule("openpgp");

dapp.keymanager = {};
dapp.keymanager.sessionkey = {};

dapp.keymanager.bits=1024;

dapp.keymanager.createNew=function(address,cb) {
    var html="";
	html+="<div class='alert alert-warning' role='alert' id='keyCreateNew'>Neuer PGP-Schl&uuml;ssel f&uuml;r <strong>"+address+"</strong> wird erstellt (dies kann einige Zeit dauern).</div>";
	$('.dapp').prepend(html);
	
	var options = {
		userIds: [{ name:address }, {email:address+"@dapp.stromdao.de"}],
		numBits: dapp.keymanager.bits    
	};
	
	openpgp.generateKey(options).then(function(key) {		
		dapp.keymanager.sessionkey=key;				
		$('#keyCreateNew').hide();
		if(typeof cb == "function") {
				cb();
		}
	});
}

dapp.keymanager.init=function() {
	var key=dapp.localstorage.getValue("sessionkey");
	if(key==null) {
		dapp.keymanager.createNew(""+web3.eth.coinbase,function() {		
			dapp.localstorage.setValue("sessionkey",dapp.keymanager.sessionkey);		
		});
	} else {
		dapp.keymanager.sessionkey=key;
	}
}

setTimeout(dapp.keymanager.init,100);