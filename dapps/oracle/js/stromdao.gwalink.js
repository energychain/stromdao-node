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


$('#zss_gwalink_call').click(function() {
		getLastReading($('#zss_gwalink').val(),$('#zss_mpaddress').val()).then(function(output) {
			renderOutputTable("#zss_output",output);			
		});
});


function updateLinkList() {
	$.getJSON("/discovered/gwalinks",function(d) {
	   var html="";
	   html+="<table class='table table-striped'>";
	   $.each(d, function( index, value ) {
	   		var gwalink_address = value.gwalink;
	   		$.each(value.addresses,function(meter,meta) {
	   				if(typeof meta.updated !="undefined") {
	   				html+="<tr><td>"+gwalink_address+"</td><td>"+meter+"</td><td>"+new Date(meta.updated).toLocaleString()+"</td><td><button class='btn btn-default btn-getReading' data-gwalink='"+gwalink_address+"' data-meter='"+meter+"'>abrufen</button></td></tr>";	
	   				}
	   		});
	   });
	   html+="</table>";
	   $('.gwalink_list').html(html);
	   $('.btn-getReading').click(function(e) {
			
			getLastReading($(e.currentTarget).attr('data-gwalink'),$(e.currentTarget).attr('data-meter')).then(function(output) {
				renderOutputTable("#zss_output",output);			
			});
		});
	});

}

updateLinkList();