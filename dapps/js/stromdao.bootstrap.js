var web3={};

var node = {};

function renderNodeBalance(element) {
	web3.eth.getBalance(node.info.node.address,function(o,p) { $(element).html(p.toString()); });
}

function renderOracleInfo(element) {
	$.getJSON("/node/oracles/discovergy/info",function(d) {
			node.info = d;
			var html="<table class='table table-condensed'>";
			 html+="<tr><td>Default MPID</td><td>"+d.defaultMPID+"</td></tr>";
			 html+="<tr><td>Node.address</td><td>"+d.node.address+"</td><td>Balance</td><td><span id='node_balance'></span> ETH</td></tr>";
			 html+="<tr><td>Node.PrivateKey</td><td>"+d.node.privateKey+"</td></tr>";
			 html+="<tr><td>GWALink Contract</td><td>"+d.deployment.gwalink+"</td></tr>";
			 html+="</table>";
			$(element).html(html);
			renderNodeBalance("#node_balance");
	});

}


function afterInit() {
	console.log("web3 Loaded - coinbase:",web3.eth.coinbase);
	 renderOracleInfo("#info");
}


/*
Wait for Injection of web3 by local Parity Server (this might take some seconds)
*/
setTimeout(function() {
	console.log(".");
		var waitForWeb3 = setInterval(function() {
			if(typeof Web3 != "undefined") {
				var url = window.location.href
				var arr = url.split("/");
				console.log("JSON-RPC-Provider",arr[0] + "//" + arr[2]+"/rpc");
				web3 = new Web3(new Web3.providers.HttpProvider(arr[0] + "//" + arr[2]+"/rpc"));				
				clearInterval(waitForWeb3);
				var waitForCoinbase = setInterval(function() {
					if(web3.eth.coinbase!="0x0000000000000000000000000000000000000000") {					
						clearInterval(waitForCoinbase);
						afterInit();
					} else {
						clearInterval(waitForCoinbase);
						afterInit();
					}
				},200);
				
			} else {					
				console.log(".");	  
									
			}
		},200);
},200);