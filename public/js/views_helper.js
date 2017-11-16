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


var account=window.localStorage.getItem("account");

if(account==null) account="1337";
 
document.node= new document.StromDAOBO.Node({external_id:account,testMode:true});
node = document.node;

args = f => f.toString ().replace (/[\r\n\s]+/g, ' ').
              match (/(?:function\s*\w*)?\s*(?:\((.*?)\)|([^\s]+))/).
              slice (1,3).
              join ('').
              split (/\s*,\s*/);
              
function introspect(o) {

names=Object.getOwnPropertyNames(o);
	
var html="";

for(var i=0;i<names.length;i++) {	
	if((names[i]!="obj")&&(names[i]!="test")) {
		var x= Object.getOwnPropertyDescriptor(o,names[i]);	
		html+="<h2>"+names[i]+"</h2>";
		html+='<div class="form-group">';
		a=args(x.value);
		for(var j=0;j<a.length;j++) {
			if(a[j].length>0) {
				html+='<label for="'+names[i]+'_'+j+'">'+a[j]+"</label>";
				var placeholder="";
				var type="text";
				if(a[j].indexOf("address_")==0) placeholder="placeholder='0x...'";  
				if(a[j].indexOf("uint256_")==0) type="number";  
				html+='<input type="'+type+'" class="form-control" id="'+names[i]+'_'+j+'" '+placeholder+'>';
				html+="<br/>&nbsp;";
			}
		}
		html+='<div class="panel panel-default" id="pnl_'+names[i]+'" style="display:none">';
		html+='<div class="panel-body"><div id="ret_'+names[i]+'"></div>';    
		html+='</div>';
		html+='</div>';

		html+="<br/><button id='execute_"+names[i]+"' data-fn='"+names[i]+"' data-arg-cnt='"+a.length+"' class='btn btn-danger execution'>execute</button>";
		html+="</div><hr/>";
	}
}
document.introspected=o;

document.renderX=function() {

		//$('#'+document.xname).html(document.xhtml);
}


$('#intro').html(html);
$('.execution').on('click',function(a,b) {
	$(a.currentTarget).attr('disabled','disabled');
	var fname=$(a.currentTarget).attr('data-fn');	
	var fcnt=$(a.currentTarget).attr('data-arg-cnt');
	console.log(fname,fcnt);
	args = [];
	for(var i=0;i<fcnt;i++) {
		var val=$("#"+fname+"_"+i).val();
		if(val=="_self") val=node.wallet.address;
		args.push(val);		
	}	
	var context=document.getElementById("ret_"+fname);
	console.log(args);
	document.introspected[fname].apply(window,args).then(function (x) {
			$('#pnl_'+fname).show();
			$(a.currentTarget).removeAttr('disabled');
			var html="<ul>";
			if(typeof x == "object") {
			for (var property in x) {
			 if(isNaN(property)) {
			  html += '<li><strong>'+property + '</strong>: ' + x[property]+'</li>';
				}
			}	
			html+="</ul>";	
			} else {html=x;}
			context.innerHTML=html;
			
							
	});
});
}

function populateObject() {
	names=Object.getOwnPropertyNames(node);
	var html="";
	for(var i=0;i<names.length;i++) {
			if(names[i].indexOf('_')) {
			html+="<li>";
			html+="<a href='#' class='csel' data-class='"+names[i]+"'>"+names[i]+"</a>";
			html+="</li>";
		}
	}
	$('#classSelector').html(html);
	$('.csel').on('click',function(a,b) {
			$('#classSelector').attr('disabled','disabled');
			$('.csel').attr('disabled','disabled');
			c=$(a.currentTarget).attr("data-class");
			$('#cname').html(c+" <a href='https://docs.stromdao.de/code/"+c+".html' class='glyphicon glyphicon-info-sign'></a>");
			cargs=[];
			if($('#entity_contract').val().length==42) {
				cargs.push($('#entity_contract').val());
			}
			node[c].apply(window,cargs).then(function(x) {
					introspect(x);
			});
		
	});
	$('#account').html(account);
	$('#address').html(node.wallet.address);
	$('#account').attr('title',document.node.wallet.address);
	$('#account').on('click',function(a,b) {
	
	$('#account').unbind('click');
		$(a.currentTarget).html("<input type='text' class='form-control adr_edit' value='"+$(a.currentTarget).html()+"' data-account='"+$(a.currentTarget).attr("data-account")+"'>");
		$('.adr_edit').on('keyup',function(a,b) {
			if(a.key=="Enter") {									
				window.localStorage.setItem("account",$(a.currentTarget).val());				
				location.reload();
			}
			});		
			
	});	

}
if(getParameterByName("class").length>0) {
	$('#classSelector').attr('disabled','disabled');
	$('.csel').attr('disabled','disabled');
	c=getParameterByName("class");
	$('#cname').html(c+" <a href='https://docs.stromdao.de/code/"+c+".html' class='glyphicon glyphicon-info-sign'></a>");
	cargs=[];
			if($('#entity_contract').val().length==42) {
				cargs.push($('#entity_contract').val());
			}
			node[c].apply(window,cargs).then(function(x) {
					introspect(x);
			});
}
populateObject();

