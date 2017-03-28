dapp.nodeadmin = {
	
	storjsBasicAuth:function(email,password) {
				var p1 = new Promise(function(resolve, reject) { 
					var data = {email:email,password:password};
					dapp.core.wallet.signNodeRequest("admin/storj/basicauth",data).then(function(o) {
							if(o.status=="ok") {
								resolve(o);
							} else {
								reject(o);
							}
					});
				});
				return p1;
	},	

	storjsUIBasicAuth:function() {
			var html="<div id='storjBasicAuth'>";
			html+="<h2>Admin:Node mit Storj Service verkn&uuml;pfen</h2>";
			html+='<div class="form-group">';
			html+='<label for="storjEmail">Storj Email Adresse</label>'
			html+='<input type="email" class="form-control" id="storjEmail" placeholder="Email">';
			html+='</div>';
			html+='<div class="form-group">';
			html+='<label for="storjPassword">Storj Passwort</label>';
			html+='<input type="password" class="form-control" id="storjPassword" placeholder="Passwort">';
			html+='</div>';
			html+='<button type="submit" class="btn btn-default" id="storjLink">Node mit Storj verkn&uuml;pfen</button>';
			html+="</div>";
			$('.dapp').prepend(html);	
			$('#storjLink').click(function() {
					$('#storkLink').removeClass('btn-danger');
					$('#storjLink').attr('disabled','disabled');
					dapp.nodeadmin.storjsBasicAuth($('#storjEmail').val(),$('#storjPassword').val()).then(function(o) {
							if(o.status=="ok") { 
									$('#storjLink').html("Verkn&uuml;pft"); 
									$('#storjBasicAuth').remove();
							}
							else {
									$('#storjLink').html("Fehler (Logmeldung geschrieben)");
									$('#storjLink').removeAttr('disabled');
									$('#storjLink').addClass('btn-danger');
									$('#storkLink').removeClass('btn-default');
							}
					});
			});
	}
}