storage=window.localStorage;
var html="";
objs={};
for (var k in storage){	
	if (storage.hasOwnProperty(k)) {
		if(k.indexOf("abel_")>-1) {
		 html+="<div class='form-inline' style='margin-top:10px;'>";	
			html+="<label for='"+k+"'>"+k+"</label><br/>";
			html+="<input type='text' class='form-control' name='"+k+"'  id='"+k+"' value='"+storage[k]+"'>";
			html+="<button id='btn_"+k+"' class='btn btn-default update'>update</button>";
		 html+="</div>";
		 objs[""+k]=storage[k];
		}
	}
}		


$('#adrbook').html(html);
$('.update').click(function(o) { 
	window.localStorage.setItem('label_'+o.target.id.substr(10),$('#label_'+o.target.id.substr(10)).val());
	location.reload();
});

$('#jsonExport').val(
JSON.stringify(objs)
);

$('#loadJSON').on('click',function() {
		storage=JSON.parse($('#jsonExport').val());
		for (var k in storage){	
			if (storage.hasOwnProperty(k)) {
			if(k.indexOf("abel_")>-1) {
					window.localStorage.setItem(k,storage[k]);
			}
	}
}		

		
});
