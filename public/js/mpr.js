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

function updateReading() {
		document.node.mpr().then(function(mpr) {
			mpr.readings($('#contract_address').val()).then(function(o) {
				console.log(o.time.toString());
			$('#reading_value').val(o.power.toString());	
			var d= new Date(o.time.toString()*1000);
			$('#reading_time').val(d.toLocaleString());
			});
		});
		updateLogs();
		$('#smart_name').val(document.node._label(node.wallet.address));
		
	
}
$('#load_exid').click(function() {
	document.node= new document.StromDAOBO.Node({external_id:$('#extid').val(),testMode:true,rpc:"http://localhost:8540"});
	node = document.node;
	$('#contract_address').val(node.wallet.address);
	$('#smart_name').val(document.node._label(node.wallet.address));
	 updateReading();
});
$('#load_contract').click(function() {
	updateReading();	
});
$('#commit_reading').click(function() {
		$('#commit_reading').attr("disabled","disabled");
		node.mpr().then(function(mpr) { 
			mpr.storeReading($('#reading_value').val()).then(function(o) {
				$('#commit_reading').removeAttr("disabled");
				updateReading();
				});
		});

});
var c=getParameterByName("c");

if((typeof c != "undefined")&&(c.length>40)) { $('#contract_address').val(c); }

function afterInit() {
	uiRefresh();
	setInterval(uiRefresh,5000);
}
afterInit();

function split64(data) { return "0x"+data.substr(0,64);}
function remain64(data) { return data.substr(64);}

function updateLogs(fromBlock) {
	var grep=$('#contract_address').val().toLowerCase();
	web3.eth.getBlock("latest",function(e,o) {		
			lastblock=o.number
			toBlock=lastblock;
			if((typeof fromBlock=="undefined")||(fromBlock<1)) {
					fromBlock=lastblock-500;
			}			
			if(fromBlock<0) fromBlock=0;
			document.node.wallet.provider.getLogs({address:"0x0000000000000000000000000000000000000008",fromBlock:fromBlock,toBlock:toBlock}).then(
			function(logs) {
					
					logs=logs.reverse();
					var html="<table class='table table-striped'>"
					html+="<tr><th>Time</th><th>Reading</th></tr>";
					for(var i=0;i<logs.length;i++) {
							var data = logs[i].data;
							if(data.length>64) {
								data=data.substr(2);
								_meter_point ="0x"+ split64(data).substr(26);								
								data=data.substr(64);
								_power =web3.toDecimal(split64(data));								
								if(_meter_point.toLowerCase()==grep) {
									var blockNumber = logs[i].blockNumber;
									setTimeout(getBlockTime(blockNumber),3000);
									html+="<tr>";
									html+="<td class='ts_"+blockNumber+"'>"+blockNumber+"</td>";
									html+="<td>"+_power+"</td>";									
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
$('#extid').val(node.options.external_id);
