var node = document.node;
$('#save').click(function() {
	
	node.metaset(0).then(function(ms) {
		var obj = {};
			obj.name = $('#pname').val();
			obj.city = $('#pcity').val();
			obj.street = $('#pstreet').val();
			obj.zip = $('#pzip').val();
			ms.put(obj).then(function(data) {
				console.log(data);			
			});
		
	});
});

node.metaset(0).then(function(ms) {
		ms.get(node.wallet.address).then(function(data) {
			var o= JSON.parse(data);
			$('#pname').val(o.name);
			$('#pcity').val(o.city);
			$('#pzip').val(o.zip);
			$('#pstreet').val(o.street);			
		});
	
});
