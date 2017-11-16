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

function renderSnapshot(power,_block) {	
	var html="";
	html+="<tr>";
	html+="<td class='ts_"+_block+"'>#"+_block+"</td>";
	html+="<td>"+power.toString()+"</td>";	
	html+="</tr>";
	$('#snapshots').append(html);
	
	getBlockTime(_block);
}
function getMySnapshots() {
	$('#snapshots').html("<tr><th>Blocknumber</th><th>Meter Reading</th><th>&nbsp;</th></tr>");
	
	document.node.singleclearing($('#contract_address').val()).then(function(sco) {
		document.node._txlogfull(sco.obj.address).then(function(logs) {
				logs=logs.reverse();
				
				var previous="";
				for(var i=0;i<logs.length;i++) {
						
						var data = logs[i].data;
						
						if(data.length==130) {	
							html="";										
							data=data.substr(2);							
							//data=data.substr(64);
							_from =node._utils.bigNumberify(split64(data)).toNumber();
							renderSnapshot(_from,logs[i].blockNumber);							
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

function renderAccount(idx) {	
document.node.singleclearing($('#contract_address').val()).then(function(sco) {
	sco.accounts(idx).then(function(mp) {
	
		var html="";
		html+="<tr>";
		html+="<td class='account' data-account='"+mp+"'>"+document.node._label(mp)+"</td>";
		html+="<td id='share_"+mp+"' align='right'></td>";
		html+="<td id='soll_"+mp+"' align='right'></td>";
		html+="<td id='haben_"+mp+"' align='right'></td>";
		html+="<td id='saldo_"+mp+"' align='right'></td>";
		html+="</tr>";
		$('#mptable').append(html);
		console.log("MP",mp);
		sco.share(mp).then(function(t) {
			$('#share_'+mp).html(t);
		});
		$('.account').unbind('click');
		$('.account').click(function(a,b) {				
			$('.account').unbind('click');
			$(a.currentTarget).html("<input type='text' class='form-control adr_edit' value='"+$(a.currentTarget).html()+"' data-account='"+$(a.currentTarget).attr("data-account")+"'>");
			$('.adr_edit').on('keyup',function(a,b) {
				if(a.key=="Enter") {									
					document.node._saveLabel($(a.currentTarget).val(),$(a.currentTarget).attr('data-account'));					
						renderAccounts();
				}
				});		
		});
		document.node.stromkonto($('#stromkonto_address').val()).then(function(sko) {
				sko.balancesSoll(mp).then(function(x) { 
						$('#soll_'+mp).html(x);
						$('#saldo_'+mp).html($('#haben_'+mp).html()-$('#soll_'+mp).html());
				});
				
		});
		document.node.stromkonto($('#stromkonto_address').val()).then(function(sko) {
				sko.balancesHaben(mp).then(function(x) { 
						$('#haben_'+mp).html(x);
						$('#saldo_'+mp).html($('#haben_'+mp).html()-$('#soll_'+mp).html());
				});
		});
		idx++;
		renderAccount(idx);			
	});
	getMySnapshots();
});	
	
}

function renderAccounts() {
	var html="";
	html+="<table id='mptable' class='table table-striped'>";
	html+="<tr><th>Address</th><th style='text-align:right'>Share</th><th style='text-align:right'>Liability</th><th style='text-align:right'>Equity</th><th style='text-align:right'>Balance</th></tr>";
	html+="</table>";
	$('#appcontent').html(html);

		$('#withContract').show();
	renderAccount(0);
	
	document.node.singleclearing($('#contract_address').val()).then(function(sco) {
		sco.meterpoint().then(function(mp) {
			$('#mp_address').val(mp);
			$('#mp_address').attr('disabled','disabled');
			sco.last_reading().then(function(last_cleared) {				
				document.node.mpr(document.node.options.defaultReading).then(function(mpr) { 
				mpr.readings(mp).then(
					function(last_reading) {
							$('#uncleared').html(last_reading.power.toString()-last_cleared);							
					});
				});			
			});
		});
		sco.stromkonto().then(function(sko) {
			$('#stromkonto_address').val(sko);
			$('#stromkonto_address').attr('disabled','disabled');
		});
		sco.energyCost().then(function(ec) {
			$('#energyCost').val(ec);				
		});
	$('#smca').attr('data-account',$('#contract_address').val());
	$('#smca').html(document.node._label($('#contract_address').val()));
	$('#smca').unbind('click');
		$('#smca').on('click',function(a,b) {				
			$('#smca').unbind('click');
			$(a.currentTarget).html("<input type='text' id='smc_editor' class='form-control smc_edit' value='"+$(a.currentTarget).html()+"' data-account='"+$(a.currentTarget).attr("data-account")+"'>");
			$('#smc_editor').on('keyup',function(a,b) {			
				if(a.key=="Enter") {		
					console.log(a);			
					console.log("YYYYYYYYYYYYYY",$(a.currentTarget).attr('data-account'));
					document.node._saveLabel($(a.currentTarget).val(),$(a.currentTarget).attr('data-account'));					
				
					renderAccounts();
				}
				});		
		});
	});


}
$('#add_mp').on('click',function() {
	$('#add_mp').attr('disabled','disabled');
	
	document.node.singleclearing($('#contract_address').val()).then(function(sco) {
			sco.setAccount($('#a_address').val(),$('#mp_share').val()).then(function(o) {
				$('#add_mp').removeAttr('disabled');
				renderAccounts();
			});
		
	});
});
$('#create_snapshot').on('click',function() {
	$('#create_snapshot').attr('disabled','disabled');
	document.node.singleclearing($('#contract_address').val()).then(function(sco) {
		sco.clearing().then(function(o) {
				$('#create_snapshot').removeAttr('disabled');
		});
	});
});
$('#load_contract').on('click',function() {		
			renderAccounts();
});
$('#update_contract').on('click',function() {
	$('#update_contract').attr('disabled','disabled');
	document.node.singleclearing($('#contract_address').val()).then(function(sco) {
		sco.setEnergyCost($('#energyCost').val()).then(function(o) {
			$('#update_contract').removeAttr('disabled');
		});
	});
});
$('#new_contract').on('click',function() {
	$('#new_contract').attr('disabled','disabled');
	document.node.singleclearingfactory().then(function(scf) {
			scf.build($('#stromkonto_address').val(),$('#mp_address').val(),$('#energyCost').val(),true).then(function(sc) {
					$('#contract_address').val(sc);
					document.sc=sc;
					
					document.node.storage.setItemSync("singleclearing",sc);
					document.node.stromkontoproxy($('#stromkonto_address').val()).then(function(sko) {		
						sko.modifySender(sc,true).then(function(o) {
							renderAccounts();
							});
					});
					
				});			
	});		
	
})

if(getParameterByName("a")) {
	$('#contract_address').val(getParameterByName("a"));
} else {
		if(document.node.storage.getItemSync("singleclearing")) {
			$('#contract_address').val(document.node.storage.getItemSync("singleclearing"));
		}
}
setInterval("uiRefresh();",5000);
setInterval("getMySnapshots();renderAccounts();",60000);
uiRefresh();
