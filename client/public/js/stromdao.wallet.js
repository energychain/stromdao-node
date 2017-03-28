dapp.core.loadModule("ethers-wallet");

dapp.wallet = {};
dapp.wallet.service = {};
 
dapp.wallet.service.newKey = function() {
		var array = new  Uint16Array(32);
		var pk = new Wallet.utils.Buffer(window.crypto.getRandomValues(array));			
		var wallet = new Wallet(pk, dapp.wallet.service.provider);					
		window.localStorage.setItem("dapp.pk",wallet.privateKey);		
		return wallet.privateKey;		
};

dapp.wallet.service.init = function() {
	if(typeof web3 == "undefined") {
		dapp.wallet.service.provider = new Wallet.providers.EtherscanProvider({testnet: false});
	} else {
		dapp.wallet.service.provider = web3;
	}		
	private_key=window.localStorage.getItem("dapp.pk");
	
	if(!private_key) {
		private_key=dapp.wallet.service.newKey();	  
	}		
	dapp.core.wallet=new Wallet(private_key, dapp.wallet.service.provider);
	dapp.core.wallet.requestSignature="";
	dapp.core.wallet.requestChallenge="";	
	dapp.core.wallet.signNodeRequest=function(fnct,data) {	
				var f=fnct;
				if(typeof data =="undefined") var data = {};
				var d=data;
				var p1 = new Promise(function(resolve, reject) { 	
					d.signature=dapp.core.wallet.requestSignature;
					$.post("/tx/"+f,d).then(function(o) {	
						console.log(o);
						if(o.status!="ok") {
								if(typeof o.challenge !="undefined") {
									dapp.core.wallet.requestChallenge=o.challenge;
									dapp.core.wallet.requestSignature=dapp.core.wallet.sign({data:o.challenge});
								}
								resolve(dapp.core.wallet.signNodeRequest(f,d));
						} else {
							resolve(o);
						}
					});
				});
				return p1;
	};	
}

setTimeout(dapp.wallet.service.init,300);