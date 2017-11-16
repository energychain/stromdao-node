var node = document.node;

if (typeof web3 !== 'undefined') {

}
var mapping=[];

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

function renderMeterPoint(idx) {	
	document.mprdecorate.meterpoints(idx).then(function(mp) {
		var html="";
		html+="<tr>";
		html+="<td class='account' data-account='"+mp+"'>"+document.node._label(mp)+"</td>";
		html+="<td id='base_"+mp+"' align='right'></td>";		
		html+="<td id='cost_"+mp+"' align='right'></td>";	
		html+="</tr>";
		$('#mptable').append(html);
		document.mprdecorate.mpr(mp).then(function(reading) {
			$('#cost_'+mp).html(reading.toString());		
		});
		document.mprdecorate.mpr_base(mp).then(function(reading) {
			$('#base_'+mp).html(reading.toString());		
		});
		$('.account').on('click',function(a,b) {
							
		$('.account').unbind('click');
		$(a.currentTarget).html("<input type='text' class='form-control adr_edit' value='"+$(a.currentTarget).html()+"' data-account='"+$(a.currentTarget).attr("data-account")+"'>");
		$('.adr_edit').on('keyup',function(a,b) {
			if(a.key=="Enter") {									
				document.node._saveLabel($(a.currentTarget).val(),$(a.currentTarget).attr('data-account'));
				//location.reload();
			}
			});		
		});
		
		idx++;
		renderMeterPoint(idx);	
});
	
}

function renderTx(idx) {
	document.node.txcache(document.node.storage.getItemSync("txcache")).then(function(t) {
			t.txs(idx).then(function(o) {
				var html="<tr>";
				html+="<td>"+document.node._label(o.from)+"</td>";
				html+="<td>"+document.node._label(o.to)+"</td>";
				html+="<td align='right'>"+o.value.toString()+"</td>";
				html+="<td align='right'>"+o.base.toString()+"</td>";
				html+="</tr>";
				$('#txtable').append(html);
				idx++;
				renderTx(idx);
			});		
	});
	
}
function renderTXCache() {
$('#create_settlement_to').attr("disabled","disabled");
var settlement = document.node.storage.getItemSync("settlement");
document.node.settlement(settlement).then(function(s) {
	s.txcache().then(function(o) {
			document.node.storage.setItemSync("txcache",o);
			var html="<h3>Transactions</h3>";
			html+="<table id='txtable' class='table table-striped'>";
			html+="<tr><th>From</th><th >To</th><th style='text-align:right'>Base Energy</th><th style='text-align:right'>Value</th></tr>";
			html+="</table><br/>";
			html+="<button id='clearing' data-address='"+o+"' class='btn btn-danger'>Clear</button>";
			$('#txs').html(html);
			renderTx(0);
			//$('#txs').html("Rendering TX Cache Not implemented (Adr: "+o+" in Settlement "+settlement+")");	
	});		
});
}
$('#addenergyCost').click(function() {
	$('#addenergyCost').attr('disabled','disabled');
	document.node.mprdecorate($('#contract_address').val()).then(function(mprdecorate) {
		mprdecorate.ChargeEnergy($('#addEnergycost').val()).then(function(o) {
				$('#addenergyCost').removeAttr('disabled');
				$('#create_settlement_to').removeAttr('disabled');
				renderMeterPoints();
		});
	});
});
$('#addfixCost').click(function() {
	$('#addfixCost').attr('disabled','disabled');
	document.node.mprdecorate($('#contract_address').val()).then(function(mprdecorate) {
		mprdecorate.ChargeFix($('#addEnergycost').val()).then(function(o) {
				$('#addfixCost').removeAttr('disabled');
				$('#create_settlement_to').removeAttr('disabled');
				renderMeterPoints();
		});
	});
});

function createStromkontoProxy() {
	
		document.node.stromkontoproxyfactory().then(function(skof) {
			
				skof.build().then(function(sko) {
						document.node.storage.setItemSync("stromkonto",sko);
						console.log("SKO",sko);
				});
		});
}
function directClearing(settlement) {
	document.node.directclearingfactory().then(function(dcf) {
		dcf.build(document.node.storage.getItemSync("stromkonto"),document.node.options.contracts["StromDAO-BO.sol_SettlementFactory"]).then(function(dc) {
			document.node.stromkontoproxy(document.node.storage.getItemSync("stromkonto")).then(function(skop) {
					skop.modifySender(dc,true).then(function(o) {
						document.node.directclearing(dc).then(function(dc) {	
													
							dc.preSettle(document.node.storage.getItemSync("mpset")).then(function(o) {
								dc.setSettlement(settlement).then(function(p) {
									dc.clear().then(function(q) {
									console.log("DONE!");	
									});
								});
							});
						});
						
					});
				
			});
			
		});
		
	});	
}

function renderMeterPoints() {
	var html="";
	html+="<table id='mptable' class='table table-striped'>";
	html+="<tr><th>Address</th><th style='text-align:right'>Energy</th><th style='text-align:right'>Cost</th></tr>";
	html+="</table>";
	$('#appcontent').html(html);
	renderMeterPoint(0);
	$('#withContract').show();	
}	

$('#load_contract').click(function() {
	document.node.mprdecorate($('#contract_address').val()).then(function(mprdecorate) {
			document.mprdecorate=mprdecorate;
			renderMeterPoints();
			if(document.node.storage.getItemSync("settled_"+$('#contract_address').val())) {
					document.node.storage.setItemSync("settlement",document.node.storage.getItemSync("settled_"+$('#contract_address').val()));
					renderTXCache();
			}
	});		
});

$('#create_settlement_to').click(function() {
	$('#create_settlement_to').attr('disabled','disabled');
	document.node.settlementfactory().then(function(factory) {
			factory.build(document.node.storage.getItemSync("mpset"),true).then(function(settlement) {
				document.node.storage.setItemSync("settled_"+$('#contract_address').val(),settlement);
				document.node.storage.setItemSync("settlement",settlement);
				document.node.settlement(settlement).then(function(s) {
					s.settle($('#contract_address').val()).then(function(i) {
							renderTXCache();
							$('#clearing').on('click', function() {
								$('#clearing').attr('disabled','disabled');
								directClearing(document.node.storage.getItemSync("settlement"));
							});
					});
				});
			});
	});
	
});
if(getParameterByName("b")) {
	$('#contract_address').val(getParameterByName("b"));
} else {
	if(document.node.storage.getItemSync("decorator")) {
		$('#contract_address').val(document.node.storage.getItemSync("decorator"));
	}
}
setInterval("uiRefresh();",5000);
uiRefresh();
