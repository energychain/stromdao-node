

if (typeof web3 !== 'undefined') {
 // web3 = new Web3(new Web3.providers.HttpProvider("https://lc4.stromdao.de/rpc"));
}
var mapping=[];

function uiRefresh() {
	web3.net.getPeerCount(function(e,o) {
		$('.peerCount').html(o);
	});
	web3.eth.getBlock("latest",function(e,o) {		
		$('.lastBlock').html(o.number);	
	});
	
}


function afterInit() {
	uiRefresh();
	setInterval(uiRefresh,5000);
}
afterInit();

