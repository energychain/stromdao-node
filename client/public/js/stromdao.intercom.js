dapp.core.loadModule("peer");

dapp.intercom = {};

dapp.intercom.Peer = function() {
	var peer= new Peer(web3.eth.coinbase, {host: '45.32.155.49', port: 9000, path: '/'})
	
	peer.on('open', function(id) {
		console.log('Intercom connected as ' + id);
	});	
	
	dapp.intercom.peer=peer;
};
dapp.intercom.Peer();