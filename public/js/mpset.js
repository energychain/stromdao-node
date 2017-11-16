var node = document.node;

if (typeof web3 !== 'undefined') {

}
var mapping=[];
function split64(data) { return "0x"+data.substr(0,64);}
function remain64(data) { return data.substr(64);}

function getParameterByName( name ){
   var regexS = "[\\?&]"+name+"=([^&#]*)", 
  regex = new RegExp( regexS ),
  results = regex.exec( window.location.search );
  if( results == null ){
    return "";
  } else{
    return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
}


function uiRefresh() {
	web3.net.getPeerCount(function(e,o) {
		$('.peerCount').html(o);
	});
	web3.eth.getBlock("latest",function(e,o) {		
		$('.lastBlock').html(o.number);	
	});
	
}

function renderSnapshot(_address,_block,prev) {
	var html="";
	html+="<tr>";
	html+="<td class='ts_"+_block+"'>#"+_block+"</td>";
	html+="<td title='"+_address+"'>"+document.node._label(_address)+"</td>";
	if(prev.length==42) {
	html+="<td><button class='btn btn-primary preSettle' id='set_"+_address+"' data-previous='"+prev+"' data-address='"+_address+"'>Settle with "+document.node._label(prev)+"</button></td>";
	} else {
		html+="<td>&nbsp;</td>";
	}
	html+="</tr>";
	$('#snapshots').append(html);
	
	$('#set_'+_address).on('click',function(a,b) {
		$(a.currentTarget).attr('disabled','disabled');
		settlement($(a.currentTarget).attr('data-previous'),$(a.currentTarget).attr('data-address')); 		
	});
	getBlockTime(_block);
	
}
function getMySnapshots() {
	document.node.mprsetfactory().then(function(mprsf) {
		document.node._txlogfull(mprsf.obj.address).then(function(logs) {
				logs=logs.reverse();
				
				var previous="";
				for(var i=0;i<logs.length;i++) {
						console.log(logs[i]);
						var data = logs[i].data;
						if(data.length>64) {	
							html="";										
							data=data.substr(2);
							_from ="0x"+ split64(data).substr(26);
							data=data.substr(64);
							_to ="0x"+split64(data).substr(26);
							console.log(_from,_to);
							if(_to.toLowerCase()==document.node.wallet.address.toLowerCase()) {
									renderSnapshot(_from,logs[i].blockNumber,previous);
									previous=_from;
							}
							if(i==0) {
								document.node.storage.setItemSync("mprset",_from);
								renderMeterPoints();
							}
						}
					}	
			
		});
	});
		
	
}

function getBlockTime(blockNumber) {		
	if(typeof web3 != "undefined") {
		web3.eth.getBlock(blockNumber, function(error, result){
			if(!error) {
						d=new Date(result.timestamp*1000);					
						$('.ts_'+blockNumber).html("#"+blockNumber+"<br/>"+d.toLocaleString());
						if(typeof cb != "undefined") cb();
			}	else {console.log(error);}		
		});
	}	
};

function renderMeterPoint(idx) {	
document.mpset.meterpoints(idx).then(function(mp) {
		var html="";
		html+="<tr>";
		html+="<td class='account' data-account='"+mp+"'>"+document.node._label(mp)+"</td>";
		html+="<td id='power_"+mp+"' align='right'></td>";
		html+="<td id='delta_"+mp+"' align='left'></td>";
		html+="<td id='time_"+mp+"' align='right'></td>";	
		html+="</tr>";
		$('#mptable').append(html);
		document.mpr.readings(mp).then(function(reading) {
			$('#power_'+mp).html(reading.power.toString());
			$('#delta_'+mp).html('<span class="label label-default" id="powerd_'+mp+'"></span>');
			$('#power_'+mp).attr('data-reading',reading.power.toString());
			$('#time_'+mp).html(new Date(reading.time.toString()*1000).toLocaleString());	
			if(document.node.storage.getItemSync("mprset")) {			
				document.node.mprset(document.node.storage.getItemSync("mprset")).then(function(mprset) {
						mprset.mpr(mp).then(function(o) {		
								if(o.toString()>0) {
								$('#powerd_'+mp).html("+"+($('#power_'+mp).attr('data-reading')-o.toString()));
								}
						});
						
					
				});
				// TODO: Add MPRSet to BO
			}		
		});		
		$('.account').unbind('click');
		$('.account').click(function(a,b) {				
			$('.account').unbind('click');
			$(a.currentTarget).html("<input type='text' class='form-control adr_edit' value='"+$(a.currentTarget).html()+"' data-account='"+$(a.currentTarget).attr("data-account")+"'>");
			$('.adr_edit').on('keyup',function(a,b) {
				if(a.key=="Enter") {									
					document.node._saveLabel($(a.currentTarget).val(),$(a.currentTarget).attr('data-account'));					
						renderMeterPoints();
				}
				});		
		});
		idx++;
		renderMeterPoint(idx);	
});
	
}

function renderMeterPoints() {
	document.node.storage.setItemSync("mpset",$('#contract_address').val());
	var html="";
	html+="<table id='mptable' class='table table-striped'>";
	html+="<tr><th>Address</th><th style='text-align:right'>Reading</th><th>&nbsp;</th><th style='text-align:right'>Time</th></tr>";
	html+="</table>";
	$('#appcontent').html(html);
	document.node.mpr(document.node.options.defaultReading).then(function(mpr) {
		document.mpr=mpr;
		renderMeterPoint(0);
		$('#withContract').show();
	});
}
$('#add_mp').click(function() {
	$('#add_mp').attr('disabled','disabled');
	document.mpset.addMeterPoint($('#mp_address').val()).then(function(O) {
		location.reload();
	});
});
$('#load_contract').click(function() {
	document.node.mpset($('#contract_address').val()).then(function(mpset) {
			document.mpset=mpset;
			renderMeterPoints();
			getMySnapshots();
	});		
});
$('#new_contract').click(function() {
	$('#new_contract').attr('disabled','disabled');
	document.node.mpsetfactory().then(function(mpsetf) {
			mpsetf.build().then(function(mpset) {
					$('#contract_address').val(mpset);
					document.mpset=mpset;
					renderMeterPoints();
				});			
	});
		
})

function settlement(_to,_from) {
	document.node.mprdecoratefactory().then(function(decf) {		
			decf.build($('#contract_address').val(),_from,_to).then(function(deco) {				
				document.node.storage.setItemSync("decorator",deco);
				document.node.storage.setItemSync("mprset",$('#settle').attr('data-address'));	
				location.href="./settlement.html?a="+$('#settle').attr('data-address')+"&b="+deco;
			});
	});
}

$('#create_snapshot').click(function() {
		$('#create_snapshot').attr("disabled","disabled");
		document.node.mprsetfactory().then(function(mprsf) {
				mprsf.build($('#contract_address').val(),document.node.options.defaultReading).then(function(o) {	
						if(document.node.storage.getItemSync("mprset")) {
							//$('#settle').attr('data-address',o);
							//$('#settle').show();
						}								
						document.node.storage.setItemSync("mprset",o);
						getMySnapshots();
																
				});			
		});
});
if(getParameterByName("a")) {
	$('#contract_address').val(getParameterByName("a"));
} else {
		if(document.node.storage.getItemSync("mpset")) {
			$('#contract_address').val(document.node.storage.getItemSync("mpset"));
		}
}
setInterval("uiRefresh();",5000);
setInterval("getMySnapshots();renderMeterPoints();",60000);
uiRefresh();
