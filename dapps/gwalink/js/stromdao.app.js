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

function getLastReading(gwalink_address,meterpoint_address) {
	var readingPromise = new Promise(function(resolve, reject) { 
			$.getJSON("/smart_contracts/gwalink.abi",function(abiArray) {							
							var gwalink = web3.eth.contract(abiArray);							
							var instance = gwalink.at(gwalink_address);
							instance.zss(meterpoint_address,function(d,t) {	
								console.log(d,t);
								resolve(helperMapOutputToAbi(gwalink,'zss',t));
							});
			});			
	});
	return readingPromise;
}



$('#deployGWA').click(function() {
   	$.getJSON("/smart_contracts/gwalink.abi",function(abi) {
   			$.get("/smart_contracts/gwalink.bin",function(bytecode) {
   				var provider = ethers.providers.getDefaultProvider();
				console.log("Bytecode","0x"+bytecode);
				var deployTransaction = ethers.Contract.getDeployTransaction("0x"+bytecode, abi);
		
				var wallet = new ethers.Wallet(node.info.node.privateKey, provider);
   				var sendPromise = wallet.sendTransaction(deployTransaction);
				console.log("Do Promise");
				// Get the transaction
				sendPromise.then(function(transaction) {
				    console.log(transaction);
				});	
				   				
   			});	
   	});
	
});