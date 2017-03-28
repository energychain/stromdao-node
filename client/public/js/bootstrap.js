var dapp = {};

dapp.core = {};

dapp.data = {};

dapp.data.core = {};

dapp.core.loaded = [];

dapp.core.loadModule = function(module) {
	if(dapp.core.loaded.indexOf(module)<0) {
		$.getScript( "js/"+module+".js" ,function() {
				dapp.core.loaded[dapp.core.loaded.length]=module;
		});	  
	}
}

dapp.core.bootstrap = function() {			
	var html="";
	html+='<h1>';
	html+='<span class="glyphicon glyphicon-refresh">&nbsp;</span>';
	html+='</h1>';
	$('.dapp').html(html);	
	// ensure web3 is ready to use
	if((typeof web3=="undefined") ||(typeof web3.eth=="undefined")) setTimeout(dapp.core.bootstrap,500); else { 
		dapp.core.loadModule("stromdao.wallet");
		dapp.core.loadModule("stromdao.intercom");
		dapp.core.loadModule("stromdao.keymanager");
		dapp.core.loadModule("stromdao.nodeadmin");
		dapp.core.loadModule("stromdao.negotiation");
	}
	$('.dapp').html("");
}

$(document).ready(dapp.core.bootstrap());