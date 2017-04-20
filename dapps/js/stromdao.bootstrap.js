var web3={};

var node = {};

/***
  StromDAO-NODE
  --------------------------------------------------------------------------
  UI Model for GWALink (Smart Meter Gateway Administration)   
*/

function helperMapOutputToAbi(contract_object,function_name,output) {
	var result = {};
	result.orig=output;
	console.log(contract_object,output,function_name);
	for(var i=0;i<contract_object.abi.length;i++) {
			if(contract_object.abi[i].name==function_name) {
					for(var j=0;j<contract_object.abi[i].outputs.length;j++) {						
							result[contract_object.abi[i].outputs[j].name]=output[j];
					}
		}
	}
	return result;
}

function renderOutputTable(element,output) {
	
	var html="<table class='table table-condensed'>";
	html+="<tr><th>Key</th><th>Value</th></tr>";
	for (var k in output){
		if (output.hasOwnProperty(k)) {
			if(k!="orig") {
				if(k=="time") {
					var d = new Date(output[k].toString()*1000);
					output[k]=d.toLocaleString();
				}
				html+="<tr><td>"+k+"</td><td>"+output[k].toString()+"</td></tr>"; 
			}
		}
	}

	html+="</table>";
	$(element).html(html);
}


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
