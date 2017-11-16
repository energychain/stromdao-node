var ipfs_service="https://ipfs.io/ipfs/";
var storage=function() {};
var persist_timeout={};
$.qparams = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURI(results[1]) || 0;
    }
}
var persist_function=function() {				
			setCold("playground",persist_store);			
};

function setCold(bucket,obj) {	
	var data=[];
	data.push({path:"/fury.network"});
	for(var i=0;i<obj.length;i++) {		
		if(obj[i].file=="playground_base.html") obj[i].file="index.html";
		if(obj[i].file=="playground_base.js") obj[i].file="base.js";
		data.push({content:new ipfs.types.Buffer(obj[i].content,'ascii'),path:"/fury.network/"+obj[i].file});
		obj[i].cmEditor="";							
	}

	console.log("PERSIST",data);
	
	ipfs.files.add(data, function (err, files) {
			window.localStorage.setItem(extid+"_"+bucket,files[0].hash);		
			for(var i=0;i<files.length;i++) {
				$.get(ipfs_service+files[i].hash,function(data) {
						//console.log(data);
				});	
			}
			$('#fsURL').val(ipfs_service+files[0].hash+"/");
			$('#colabURL').val("https://fury.network/?hash="+files[0].hash+"&extid="+extid);
			console.log(ipfs_service+files[0].hash);
	});			

}

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


function init() {
	
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
	if($.qparams("hash")!=null) {
			files[0].url=ipfs_service+$.qparams("hash")+"/index.html";
			files[1].url=ipfs_service+$.qparams("hash")+"/base.js";
			$.get(files[0].url,function(data) {
				files[0].content=data;
				$.get(files[1].url,function(data) {
					files[1].content=data;
					console.log(files);
					var store = files.slice();			
					renderEditor(files,store);
					persist_store=store;
					persist_function();
				});
			});
	} else {
		var store = files.slice();			
		renderEditor(files,store);
		persist_store=store;
		persist_function();
	}
					
}
var extid="fury.network."+Math.random();
var hash_q="";

if($.qparams("hash")!=null) {
	hash_q="&hash="+$.qparams("hash");
}

if($.qparams("extid")!=null) {
		extid=$.qparams("extid");
} else {
		location.href="?extid=fury.guest."+Math.random()+hash_q;
}
const ipfs = new Ipfs();

ipfs.on('ready', () => {
		init();
}); // END IPFS
