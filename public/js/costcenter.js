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
						function getBlockTime(blockNumber) {
						web3.eth.getBlock(blockNumber, function(error, result){
							if(!error) {
										d=new Date(result.timestamp*1000);
										$('.ts_'+blockNumber).html(d.toLocaleString());
										
							}			
						})};
function split64(data) { return "0x"+data.substr(0,64);}
function remain64(data) { return data.substr(64);}

function updateLogs(fromBlock) {
	var grep=$('#account_address').val().toLowerCase();
	web3.eth.getBlock("latest",function(e,o) {		
			lastblock=o.number
			toBlock=lastblock;
			if((typeof fromBlock=="undefined")||(fromBlock<1)) {
					fromBlock=lastblock-500;
			}			
			if(fromBlock<0) fromBlock=0;
			document.node.wallet.provider.getLogs({address:$('#contract_address').val(),fromBlock:fromBlock,toBlock:toBlock}).then(
			function(logs) {
					logs=logs.reverse();
					var html="<table class='table table-striped'>"
					html+="<tr><th>Date/Time</th><th>Energy Source</th><th style='text-align:right'>Energy</th><th style='text-align:right'>Value</th><th style='text-align:right'>Balance</th></tr>";
					for(var i=0;i<logs.length;i++) {
							var data = logs[i].data;
							if(data.length>256) {
								data=data.substr(2);
								_from ="0x"+ split64(data).substr(26);
								data=data.substr(64);
								_to ="0x"+split64(data).substr(26);
								data=data.substr(64);
									
								_value =web3.toDecimal(split64(data));
								data=data.substr(64);
								_base =web3.toDecimal(split64(data));
								data=data.substr(64);
								_fromSoll =web3.toDecimal(split64(data));
								data=data.substr(64);
								_fromHaben =web3.toDecimal(split64(data));
								data=data.substr(64);
								_toSoll =web3.toDecimal(split64(data));
								data=data.substr(64);
								_toHaben =web3.toDecimal(split64(data));
								data=data.substr(64);
								if((_from.toLowerCase()==grep)||(_to.toLowerCase()==grep)||(grep.length<40)) {
									var blockNumber = logs[i].blockNumber;
									if(_from.toLowerCase()==grep) {
										peer=_to;
										saldo=_fromHaben-_fromSoll;
										_value="-"+_value;
									} else {
										peer=_from;
										saldo=_toHaben-_toSoll;
										_value="+"+_value;
									}

									setTimeout(getBlockTime(blockNumber),3000);
									html+="<tr>";
									html+="<td class='ts_"+blockNumber+"'>"+blockNumber+"</td>";
									html+="<td><a href='singleclearing.html?a="+_to+"'>"+document.node._label(_to)+"</a></td>";
									html+="<td align='right'>"+_base+"</td>";
									html+="<td align='right'>"+(_value*1).toFixed(2)+"</td>";
									html+="<td align='right'>"+(saldo*1).toFixed(2)+"</td>";
									html+="</tr>";

								}
							}
					}
					html+="<tr><td colspan=3><a href='#' onclick='updateLogs("+(fromBlock-500)+");' class='btn btn-primary'>more</a></tr>";
					html+="</table>";
					$('#txLog').html(html);							
		});
	});
}

function afterInit() {
	uiRefresh();
	setInterval(uiRefresh,5000);
}
afterInit();


$('#load_contract').click( function() {
	withContract();
});
function withAccount() {
		$('#haveAccount').show();
		document.stromkonto.balancesSoll($('#account_address').val()).then( function(tx_result) {
			$('.soll').html((tx_result*1).toFixed(2));
			$('.saldo').html(($('.haben').html()-$('.soll').html()).toFixed(2));
		});
		document.stromkonto.balancesHaben($('#account_address').val()).then( function(tx_result) {
			$('.haben').html((tx_result*1).toFixed(2));
			$('.saldo').html(($('.haben').html()-$('.soll').html()).toFixed(2));
		});
		updateLogs();	
		$('#accountName').html(document.node._label($('#account_address').val()));
}

function withContract() {
		node.stromkonto($('#contract_address').val()).then( function(stromkonto) {	
		document.stromkonto=stromkonto;		
		$('#haveContract').show();
		updateLogs();
		withAccount();
	});
}
$('#load_account').click( function() {
	withAccount();
});
var a=getParameterByName("a");
var c=getParameterByName("c");
c="0xfcBfE1e0D5B62b4E281609B150423b0F15082319";
//a="0x0022afe423d59a9f4ac99927a5d6d7e7c4ba017c";
if((typeof c != "undefined")&&(c.length>40)) { $('#contract_address').val(c); }
if((typeof a != "undefined")&&(a.length>40)) { $('#account_address').val(a); }

withContract();
//withAccount();
