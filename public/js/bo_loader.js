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


Number.prototype.money = function() {
	n=2;
	x=3;
	s="";
	c=".";
	var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
    num = this.toFixed(Math.max(0, ~~n));
	num=num/100000000;
	num = num.toFixed(Math.max(0, ~~n));
	num=num+"";
    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};

Number.prototype.energy = function() {
	n=5;
	x=3;
	s="";
	c=".";
	var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
    num = this.toFixed(Math.max(0, ~~n));
	num=num/100000;
	num=num+"";
    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};
Number.prototype.mcurrency = function() {
	n=2;
	x=3;
	s="";
	c=".";
	var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
    num = this.toFixed(Math.max(0, ~~n));
	num=num+"";
    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};
Number.prototype.round = function() {
	n=0;
	x=3;
	s="";
	c=".";
	var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
    num = this.toFixed(Math.max(0, ~~n));
	num=num+"";
    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};

document.StromDAOBO = require("stromdao-businessobject");   
var StromDAOBO =document.StromDAOBO;
var extid=getParameterByName("extid");
if((typeof extid == "undefined")||(extid==null)||(extid.length==0)) extid="1337"; else {
		window.localStorage.setItem("extid",extid);
}
var pk=getParameterByName("pk");
if((typeof pk != "undefined")&&(pk!=null)&&(pk.length==66)) {	
		window.localStorage.setItem("ext:"+extid,pk);
}


if((typeof window.localStorage.getItem("extid") != "undefined")&&(window.localStorage.getItem("extid") != null))  {
	extid=window.localStorage.getItem("extid");
}

var node = new StromDAOBO.Node({external_id:extid,testMode:true,rpc:"https://demo.stromdao.de/rpc",abilocation:"https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/6dc9e073/smart_contracts/"});
document.node = node;

function split64(data) { return "0x"+data.substr(0,64);}
function remain64(data) { return data.substr(64);}
// retrieve a list of MeterPoints
// MPR Genesis: 

document.getMeterPointList=function() {
	var p2 = new Promise(function(resolve2, reject2) { 
		web3.eth.getBlock("latest",function(e,o) {		
					lastblock=o.number
					toBlock=lastblock;
					fromBlock=lastblock-500;
					if(fromBlock<0) fromBlock=0;
					node.wallet.provider.getLogs({address:"0x0000000000000000000000000000000000000008",fromBlock:fromBlock,toBlock:toBlock}).then(
						function(logs) {
							meter_points=[];
							for(var i=0;i<logs.length;i++) {
									var data = logs[i].data;
									if(data.length>64) {
										data=data.substr(2);
										_meter_point ="0x"+ split64(data).substr(26);
										data=data.substr(64);
										_power =split64(data).substr(26);	
										meter_points[_meter_point]=_power;							
										
									}
							}
							resolve2(meter_points);
						}
					);
				});
	});
	return p2;
}
