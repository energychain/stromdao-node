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

