var api="https://fury.network/api/";
var coldAPI=api+"cold/";
var token="";
var sectoken="";
var api_account="";
var editor={};
var persist_store={};
var persist_timeout={};
var persist_function=null;
var perm_account="";
var rpcurl="/rpc";
var storage=function() {};
window.playground="0.1-container";

$.qparams = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURI(results[1]) || 0;
    }
}

var extid="fury.network";

var persist_function=function() {	
			console.log("PERSISTING",persist_store);
			setCold("playground",persist_store);
			$("#gistGET").removeAttr("disabled");
};
	  
if($.qparams("extid")!=null) {
		extid=$.qparams("extid");
}
if($.qparams("sectoken")!=null) {
		sectoken=$.qparams("sectoken");
		window.localStorage.setItem("sectoken",$.qparams("sectoken"));
		loadPrivateStorage();
}
var node = new document.StromDAOBO.Node({external_id:extid,testMode:true,rpc:rpcurl,abilocation:"https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/master/smart_contracts/"});


node.stromkonto("0x19BF166624F485f191d82900a5B7bc22Be569895").then(function(sko) {
	sko.balancesHaben(node.wallet.address).then(function(haben) {
		sko.balancesSoll(node.wallet.address).then(function(soll) {		
		    console.log(soll,haben);
			if(haben-soll<=0) {
					$('#infoAccount').show();
			} else {
					$('#infoAccount').hide();
			}
		});
	});	
});
function publishRSA() {

	node.roleLookup().then(function(rl) {
		rl.relations(node.wallet.address,26).then(function(rel) {
			if(rel=="0x0000000000000000000000000000000000000000") {
				files=[];
				var file_1={};
				file_1.name="rsa_pub.key";
				file_1.content=node.RSAPublicKey;
				files.push(file_1);
				var file_2={};
				file_2.name="rsa_info.txt";
				file_2.content=node.wallet.address;
				files.push(file_2);
				var file_3={};
				file_3.name="node_pub.key";
				file_3.content=node.nodeRSAPublicKey;
				files.push(file_3);
				var file_4={};
				file_4.name="node_info.txt";
				file_4.content=node.nodeWallet.address;
				files.push(file_4);
				$.post(api+"ipfs/set?token="+token,{bucket:"RSA",obj:JSON.stringify(files),token:token},function(data) {
					data=JSON.parse(data);			
					console.log("RSA Root",data.ipfsroot);				
					node.stringstoragefactory().then(function(ssf) {
							ssf.buildAndAssign(26,data.ipfsroot).then(function(ipfsss) {
							 console.log("RSA Role Assigned");
							});
					});
				});	
			}
		});	
	});
	
}

function setGist(bucket,obj) {	
	for(var i=0;i<obj.length;i++) {
			obj[i].cmEditor="";		
	}
	$.post(api+"gist/set/?token="+token,{bucket:bucket,obj:JSON.stringify(obj),token:token},function(data) {			
			data=JSON.parse(data);
			$('#gistURL').val("https://gist.github.com/anonymous/"+data.id);
	});	
}
function setCold(bucket,obj) {	
	for(var i=0;i<obj.length;i++) {
			obj[i].cmEditor="";		
	}
	
	ipfs.files.add({path:'/fury.json',content:new ipfs.types.Buffer(JSON.stringify(obj),'ascii')}, function (err, files) {
		window.localStorage.setItem(extid+"_"+bucket,files[0].hash);		
		$.get("https://fury.network/ipfs/"+window.localStorage.getItem(extid+"_"+bucket),function(data) {
					console.log(data);
		});	
	});
}
function getCold(account,bucket,cb) {	
	console.log("GET Cold",bucket);
	if(window.localStorage.getItem(extid+"_"+bucket)!=null) {
			$.get("https://fury.network/ipfs/"+window.localStorage.getItem(extid+"_"+bucket),function(data) {
					cb(JSON.parse(data.data));	
			});	
		
	}	
}
function savePrivateStorage() {
	if(window.localStorage.getItem("sectoken")!=null) {
		sectoken=window.localStorage.getItem("sectoken");
		obj=window.localStorage;
		$.post("/api/priv/set/data?token="+sectoken,{obj:JSON.stringify(obj),token:sectoken},function(data) {			
			window.top.location.href="https://fury.network/?&extid=appswitch&inject=0x6B92D749d8646c5DE3fC62941e5B26CB71f8576f";
		});	
	}
}

function loadPrivateStorage() {
	if(window.localStorage.getItem("sectoken")!=null) {
	$.get("/api/priv/get/data",{token:window.localStorage.getItem("sectoken")},function(data) {			
			data = JSON.parse(data);	
		
			if(data.balance<900) {
				window.top.location.href="https://fury.network/?&extid=storage&showcase=0x3a4fb51ecD9123D517Ede72C27b870E3Ef860682";
			} else {				
				$('#storageLogin').hide();	
			}
			
			data = JSON.parse(data.data);				
			$.each(data,function(a,b) {
					if(window.localStorage.getItem(a)==null) {
							window.localStorage.setItem(a,data[a]);
					}
			});
			if($.qparams("sectoken")!=null) { 
				savePrivateStorage();
			}
			//window.localStorage=data;
		});	
	}	
}
$('.fshide').hide();

$.post( api+"auth",{extid:node.wallet.address,secret:node.wallet.privateKey.substr(0,10)},function( data ) {
		data=JSON.parse(data);		
		token=data.token;		
		$.post(api+"info/"+node.wallet.address+"?token="+token,{token:token},function(info_data) {
			api_account=JSON.parse(info_data);
			cold_account=api_account;

			if($.qparams("inject")!=null) {
					cold_account=$.qparams("inject");
			}	
			if($.qparams("showcase")!=null) {
					cold_account=$.qparams("showcase");
			}
			if(node.storage.getItemSync(cold_account)!=null) {
				cold_account=node.storage.getItemSync(cold_account);
			}
			if($.qparams("extid")!=null) {
					//cold_account=$.qparams("showcase");
					node.storage.setItemSync($.qparams("extid"),node.wallet.address);
			}
			 $('#colabURL').val(location.protocol+"//"+location.host+""+location.pathname+"?extid="+$.qparams("extid")+"&inject="+cold_account);
			$('#fsURL').val(location.protocol+"//"+location.host+""+location.pathname+"?showcase="+cold_account);
			perm_account=cold_account;
			getCold(cold_account,"playground",function(store) {	

				var files= [{
						  type: 'html',
						  name: 'html',
						  url: 'playground_base.html'
						},
						{
						  type: 'js',
						  name: 'js',
						  url: 'playground_base.js'
						}	
				];				
				if((typeof store !="undefined") && (store.length==files.length)) {
					for(var i=0;i<files.length;i++) {
							if(typeof store[i].content != undefined) {
								files[i].content=store[i].content;
							}
					}						
				}
				var store = files.slice();
				
				if(($.qparams("showcase")!=null)&&(files.length==2)) {					
					$('#editor_1').html(files[0].content);
					eval(files[1].content);
					$('.fshide').hide();
					$('#editor_1').height("1000px");
					node.roleLookup().then(
						function(rl) {
							console.log("Has Cold Account",cold_account);
							rl.getName(cold_account).then(function(name) {
							  $('#rlname').html(name);
							  $('#rlname').show();
							  if((name!=null)&&(name.length>0)) {								  
								node.storage.setItemSync(name,$.qparams("showcase"));  
							  }

							});
						}	
					);
				} else {
					
					if($.qparams("gist")!=null) {
						$.get("https://api.github.com/gists/"+$.qparams("gist"),function(gist) {
								files[0].content=gist.files["base.html"].content;
								files[1].content=gist.files["base.js"].content;
								renderEditor(files,store);
								persist_store=store;
								persist_function();
						});
					
					} else {
						renderEditor(files,store);
						persist_store=store;
						persist_function();
					} 
					
				}
			});
			publishRSA();
		});
});
function renderEditor(files,store) {
	
	$('.fshide').show();
	editor=new Jotted(document.querySelector('#editor_1'), {
			files:files,
			 plugins: [
				'stylus',
				{
				  name: 'codemirror',
				  options: {
					lineNumbers: true
				  }
				}
			  ]
	});	 	
		
	editor.on('change', function (res, cb) {					
	  if (!store.some(function (f, i) {
		if (f.type === res.type) {
		  store[i] = res
		  
		  return true
		}
	  })) {
		
		store.push(res)
	  }
	  cb(null, res)
	  persist_store=store;
	  clearTimeout(persist_timeout);
	  persist_timeout=setTimeout(persist_function,5000);
	   
	})	
	$( "#editor_1" ).trigger( "change" );
	
}
$('#gistGET').click(function() {
	$('#gistGET').attr('disabled','disabled');
	 setGist("playground",persist_store);
});
$('#subscribe').click(function() {
	if($('#subscribe').attr('aria-pressed')) {
		  OneSignal.push(function() {		  
			OneSignal.sendTags(JSON.parse('{"'+perm_account+'":"1"}'));
		  });
		} else {
		OneSignal.push(function() {
		  OneSignal.deleteTag(node.wallet.address);
		});
		OneSignal.push(["getNotificationPermission", function(permission) {
			if(permission!="granted") {
				OneSignal.push(function() {
				  OneSignal.showHttpPermissionRequest();
				});
			}			
		}]);
	}	
});
$('#subscribe').attr('aria-pressed',false);
const ipfs = new Ipfs();

ipfs.on('ready', () => {
	
}); // END IPFS
