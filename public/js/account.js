account="0x83F8B15eb816284ddcF2ff005Db7a19196d86ae1";
blk="0xD8Fab6551D662710A5150976032aE8329887f129";
address_stromkonto="";
document.balancesheets=[];
document.summary=[];
pageBL=4;
firstLoad=20;
maxSettlement=0;
minSettlement=9999999999999999;

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
	if(typeof web3 != "undefined") { 
		web3.net.getPeerCount(function(e,o) {
			$('.peerCount').html(o);
		});
		web3.eth.getBlock("latest",function(e,o) {		
			$('.lastBlock').html(o.number);	
		});
	}
}

function loadBalancesheets(idx,cb) {
	
	idx--;
	firstLoad--;
	if(firstLoad<0) firstLoad=0;
	tobl=document.blcnt-(firstLoad+pageBL);

	if(typeof document.tobl != "undefined") {
		tobl=document.tobl;	
	}
	if(idx<0) cb(); else {
	if(idx<tobl)  { 
		loadBalancesheets(idx,cb);
	} else {	
		console.log("Loading balance to memory",idx,document.blcnt,document.tobl);
		if((document.blcnt-idx)<document.balancesheets.length+1) loadBalancesheets(idx,cb); else {
			node.blg(blk).then(function(blg) {
				blg.balancesheets(idx).then(function(a,b) {							
					node.stromkonto(a.balanceIn).then(
						function(stromkontoIn) {
								node.stromkonto(a.balanceOut).then(function(stromkontoOut) {
										stromkontoOut.balancesCachedSoll(account).then(function(outSoll) {
											bl = { balanceIn:a.balanceIn, balanceOut:a.balanceOut,blockNumber:(a.blockNumber.toString()*1),stromkontoIn:stromkontoOut,stromkontoOut:stromkontoOut,txSoll:outSoll };
											document.balancesheets.push(bl);
											loadBalancesheets(idx,cb)							
										});
								});
							
					});								
				});
			});
		}
	}
	}
}

function balanceInInfo(bin,bbl,sumBase,sumTx,bl) {
	
document.node._txlog(bin,bbl).then(
	function(logs) {			
			var html="";
			total=0;
			for(var i=0;i<logs.length;i++) {
				var data = logs[i].data;
				if(data.length>256) {	
					html="";										
					data=data.substr(2);
					_from ="0x"+ split64(data).substr(26);
					data=data.substr(64);
					_to ="0x"+split64(data).substr(26);
					data=data.substr(64);												
					_value =node._utils.bigNumberify(split64(data)).toNumber();
					data=data.substr(64);
					_base =node._utils.bigNumberify(split64(data)).toNumber();					
					data=data.substr(64);
					_fromSoll =node._utils.bigNumberify(split64(data));
					data=data.substr(64);
					_fromHaben =node._utils.bigNumberify(split64(data));
					data=data.substr(64);
					_toSoll =node._utils.bigNumberify(split64(data));
					data=data.substr(64);
					_toHaben =node._utils.bigNumberify(split64(data));
					data=data.substr(64);
					portion=1;
					total+=_base;
		
										
				}
			}
			for(var i=0;i<logs.length;i++) {
				var data = logs[i].data;
				if(data.length>256) {	
					html="";										
					data=data.substr(2);
					_from ="0x"+ split64(data).substr(26);
					data=data.substr(64);
					_to ="0x"+split64(data).substr(26);
					data=data.substr(64);												
					_value =node._utils.bigNumberify(split64(data)).toNumber();
					data=data.substr(64);
					_base =node._utils.bigNumberify(split64(data)).toNumber();
					data=data.substr(64);
					_fromSoll =node._utils.bigNumberify(split64(data)).toNumber();
					data=data.substr(64);
					_fromHaben =node._utils.bigNumberify(split64(data)).toNumber();
					data=data.substr(64);
					_toSoll =node._utils.bigNumberify(split64(data)).toNumber();
					data=data.substr(64);
					_toHaben =node._utils.bigNumberify(split64(data)).toNumber();
					data=data.substr(64);
					portion=_base/total;
					benergy=Math.round(bl.txSoll/(sumTx/sumBase)*100)/100;
					
					html+="<tr><td class='"+_to+" bl_"+bl.blockNumber+" account' data-account='"+_to+"'>"+document.node._label(_to)+"</td><td align='right' title='"+(portion*benergy)+"'>-"+(1*(bl.txSoll*portion).money()).mcurrency()+"</td><td align='right'>"+Math.round(portion*1000)/10+"%</tr>";
					$('#txbl_'+bbl).append(html);	
					$('.price_'+bl.blockNumber).html(((sumTx/sumBase)/100000).toFixed(4));
					$('.energy_'+bl.blockNumber).html((bl.txSoll/(sumTx/sumBase)));
					$('.account').unbind('click');
					$('.account').click(function(a,b) {
							
							$('.account').unbind('click');
							$(a.currentTarget).html("<input type='text' class='form-control adr_edit' value='"+$(a.currentTarget).html()+"' data-account='"+$(a.currentTarget).attr("data-account")+"'>");
							$('.adr_edit').on('keyup',function(a,b) {
								if(a.key=="Enter") {									
									node._saveLabel($(a.currentTarget).val(),$(a.currentTarget).attr('data-account'));
									location.reload();
								}
							});
							
					});
					if(typeof document.summary == "undefined") {
						//document.summary = [];
					}
					if(typeof document.summary[""+_to]== "undefined") {
						document.summary[""+_to]={sumBase:(benergy*portion),sumTx:portion*(bl.txSoll*portion)}
					} else {
						
					}
					document.summary[""+_to].sumBase+=benergy*portion;
					document.summary[""+_to].sumTx+=1*(bl.txSoll*portion);						
					renderSummary();
				}
			}	
			//$('#txbl_'+bbl).append("<tr><th>Total Energy</th><th>-"+_base+"</td></tr>");
	});
}

function renderSummary() {
	
var html="";
html+="<table class='table table-striped'><tr><th>From/To</th><th style='text-align:right'>Total Energy</th><th style='text-align:right'>%&nbsp;</th><th style='text-align:right'>Price</th><th style='text-align:right'>Total Cost</th><th style='text-align:right'>%&nbsp;</th></tr>";
var total_energy=0;
var total_cost=0;
for (var k in document.summary){
    if (document.summary.hasOwnProperty(k)) {		
		html+="<tr><td class='"+k+"' data-account='"+k+"'>"+document.node._label(k)+"</td><td align='right'>"+(1*document.summary[k].sumBase).round()+"</td><td align='right' id='per_"+k+"'></td><td align='right'>&nbsp;</td><td align='right'>"+(1*document.summary[k].sumTx.money()).mcurrency()+"</td><td align='right' id='pcs_"+k+"'></td></tr>";         
		total_energy+=document.summary[k].sumBase;
		total_cost+=1*document.summary[k].sumTx;
    }
}
html+="<tr><th>&nbsp;</th><th style='text-align:right'>"+Math.round(total_energy).toFixed(2)+"</th><th style='text-align:right'>100%</th><th style='text-align:right'>"+((total_cost/total_energy)/100000).toFixed(4)+"</th><th style='text-align:right'>"+total_cost.money()+"</th><th style='text-align:right'>100%</th></tr>";
html+="</table>";	
$('#summary').html(html);
for (var k in document.summary){
	if (document.summary.hasOwnProperty(k)) {
		$('#per_'+k).html((100*(1*document.summary[k].sumBase/total_energy)).toFixed(2)+"%");
		$('#pcs_'+k).html((100*(1*document.summary[k].sumTx/total_cost)).toFixed(2)+"%");
	}
}

$('.account').unbind('click');
$('.account').click(function(a,b) {
	
		$('.account').unbind('click');
		$(a.currentTarget).html("<input type='text' class='form-control adr_edit' value='"+$(a.currentTarget).html()+"' data-account='"+$(a.currentTarget).attr("data-account")+"'>");
		$('.adr_edit').on('keyup',function(a,b) {
			if(a.key=="Enter") {									
				node._saveLabel($(a.currentTarget).val(),$(a.currentTarget).attr('data-account'));
				location.reload();
			}
		});
});

document.slock=false;					
}
function getBlockTime(blockNumber,bl) {		
	if(typeof web3 != "undefined") {
		web3.eth.getBlock(blockNumber, function(error, result){
			if(!error) {
						d=new Date(result.timestamp*1000);					
						$('.ts_'+blockNumber).html("#"+blockNumber+"<br/>"+d.toLocaleString());
						if(typeof cb != "undefined") cb();
			}	else {console.log(error);}		
		});
	}
	if($("#txbl_"+blockNumber).length==0) {
		$("#blk_"+blockNumber).html("<table class='table table-condensed' id='txbl_"+blockNumber+"' width='100%' ><tr><th width='33%'>Source</th><th style='text-align:right' width='33%'>Value</th><th style='text-align:right'>%&nbsp;</th></tr></table>");	
				
		bl.stromkontoIn.sumTx().then(function(sumTx) {
								if(sumTx==0) return;
							
								bl.stromkontoIn.sumBase().then(function(sumBase) {
									balanceInInfo(""+bl.balanceIn,bl.blockNumber,sumBase,sumTx,bl);									
								});
								//setTimeout("balanceInInfo('"+bl.balanceIn+"',"+bl.blockNumber+","+sumBase+","+obj.base+");",500);											
						});
	}
};

function split64(data) { return "0x"+data.substr(0,64);}
function remain64(data) { return data.substr(64);}

function afterInit() {
	
	if(getParameterByName("a")) {account=getParameterByName("a");}	
	$('.account').html(document.node._label(account));
	$('.account').attr("data-account",account);
	$('.account').unbind('click');
	$('.account').click(function(a,b) {
		
			$('.account').unbind('click');
			$(a.currentTarget).html("<input type='text' class='form-control adr_edit' value='"+$(a.currentTarget).html()+"' data-account='"+$(a.currentTarget).attr("data-account")+"'>");
			$('.adr_edit').on('keyup',function(a,b) {
				if(a.key=="Enter") {									
					node._saveLabel($(a.currentTarget).val(),$(a.currentTarget).attr('data-account'));
					location.reload();
				}
			});
	});
	uiRefresh();
	setInterval(uiRefresh,5000);
	//$('#txLog').empty();
	node = document.node;
	
	node.blg(blk).then(function(blk) {
				blk.stromkontoDelta().then(function(stromkontoDelta) {
	console.log("XXXXXXXXXXXXXXX");					
						node.stromkonto(stromkontoDelta).then(function(stromkonto) {
								stromkonto.balancesSoll(account).then( function(value) {
									$('.soll').html((1*value.money()).toFixed(2));
									document.soll=value;
									document.saldo=document.haben-document.soll;
									$('.saldo').html((($('.haben').html()-$('.soll').html()*1)).toFixed(2));
								});
								stromkonto.balancesHaben(account).then( function(value) {
									$('.haben').html((value.money()*1).toFixed(2));
									document.haben=value;
									document.saldo=document.haben-document.soll;
									$('.saldo').html((($('.haben').html()-$('.soll').html()*1)).toFixed(2));
									
									blk.balancesheets_cnt().then(function(o) {
											document.blcnt=o*1;
											if(typeof document.tobl=="undefined") {
												document.tobl=document.blcnt-(firstLoad+pageBL);
											}
											loadBalancesheets(o*1,function() {
												updateLogs();
												$(window).scrollTop(document.ScrollOffset);
											 });
										});									
									
								});
								
						});
						address_stromkonto=stromkontoDelta;
						
				});		
	});
}


function updateLogs(fromBlock) {
	//document.summary = [];	
	bs=document.balancesheets;
	//bs=bs.reverse();
	saldo=document.saldo;
	var html="";
	for(var i=0;i<bs.length;i++) {	
		if($('#blk_'+bs[i].blockNumber).length ==0) {	
			html+="<tr>";
			html+="<td class='ts_"+bs[i].blockNumber+"'>"+bs[i].blockNumber+"</td>";
			html+="<td id='blk_"+bs[i].blockNumber+"'>TBD</td>"																		
			html+="<td align='right'></td>";
			
			// "+((_value*1)/(_base*1))+"
			html+="<td align='right' class='energy_"+bs[i].blockNumber+"'>TBD</td>";
			html+="<td align='right' class='price_"+bs[i].blockNumber+"'>TBD</td>";
			html+="<td align='right'>-"+(1*(bs[i].txSoll*1).money()).mcurrency()+"</td>";
			html+="<td align='right'>"+(1*(saldo*1).money()).mcurrency()+"</td>";		
			html+="</tr>";
		}
		saldo+=bs[i].txSoll;
	}

	$('#txLog').append(html);	
	for(var i=0;i<bs.length;i++) {	
		getBlockTime(bs[i].blockNumber,bs[i]);
	}
}

function pScroll() {
	if((typeof document.slock != "undefined")&&(document.slock)) return;
	if(document.tobl<0) return;
	document.slock=true;
	if($('#progressScroll').offset().top>$(window).height()) {
	document.ScrollOffset= Math.abs($('#progressScroll').offset().top-$(window).height());
	}
	console.log(document.ScrollOffset);
	console.log("-----------------");
	document.blcnt=document.tobl;
	document.tobl-=pageBL;
	
	afterInit();
	
}
$('#progressScroll').appear();
$('#progressScroll').on('appear',function() {	
	setTimeout("pScroll();",100);
	//$(window).scrollTop(document.ScrollOffset);
});

document.node.metaset(0).then(function(ms) {
		ms.get(account).then(function(data) {
			var o= JSON.parse(data);
			var html="";
			html+=o.name+"\n";
			html+=o.street+"\n";
			html+=o.zip+" "+o.city+"\n";
			$('#recipient').html(html);
		});
	
});

afterInit();
