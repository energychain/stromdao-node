var request = require('request');
var OAuth = require('./mashape-oauth-4dgy/index.js').OAuth;

var Discovergy={};

module.exports = function (token,vm) {
	this.vm=vm;
	this.meters={};
	this.token=token;
	this.oauth=this.vm.storage.getItemSync(token);	
	if(typeof this.oauth!="undefined") {
		this.oa=new OAuth(this.oauth.oauth_options,function(ox) {console.log("OX Init",ox);});
	}
	var oauth = this.oauth;
	


	this.getMeters=function(cb) {	
			var oauth=this.oauth;
			oauth.url="https://api.discovergy.com/public/v1/meters";
			oauth.parameters={something:"cool"};
			console.log(this.oauth);
			this.oa.get(oauth, function(a,b) { 	
					console.log(a,b);
					this.meters=b;					
					cb(JSON.parse(b));
			});		
		};
	this.getMeterReading=function(meterid,cb) {
		this.oauth.url="https://api.discovergy.com/public/v1/last_reading?meterId="+meterid+"&";
		this.oauth.parameters={meterId:meterid};	
	
		this.oa.get(this.oauth, function(a,b) { 
							
					//console.log(a,b); 
					try {
						var obj=JSON.parse(b);
						ot=""+obj.time;
						obj.time=ot.substr(0,ot.length-3);					
						cb(obj);
					} catch (e) {
						cb({});
					}
		});	
	};
	this.CreateAuth = function(vm,email,password) {			
			var p1 = new Promise(function(resolve, reject) { 						
						Discovergy.getOAuthVerifier(email,password).then(function(o) {								
						vm.storage.setItemSync(o.oauth_token,o);
						resolve(o);					
						});				
			});
			return p1;
	};
}

Discovergy.getConsumerToken=function() {
		
		var p1 = new Promise(function(resolve, reject) { 
				var reqoptions = {                 
				  method: 'POST',             
				  uri: 'https://api.discovergy.com/public/v1/oauth1/consumer_token',
				  body: "client=Stromdao Node",
				  headers: {                     
					  'Content-Type': 'application/x-www-form-urlencoded'
				   }
				};   

				request(reqoptions, function (error, response, body) {
					//console.log(JSON.parse(body));
					resolve(JSON.parse(body));				
				});
		});
		return p1;
};

	
Discovergy.getOAuthVerifier=function(email,password) {
		return Discovergy.getConsumerToken().then(function(tokens) {
		
			var p1 = new Promise(function(resolve, reject) { 
				var options = {
					requestUrl:'https://api.discovergy.com/public/v1/oauth1/request_token',
					accessUrl:'https://api.discovergy.com/public/v1/oauth1/access_token',
					callbback:function(o) {},
					consumerKey:tokens.key,
					consumerSecret:tokens.secret,
					signatureMethod:'HMAC-SHA1',
					version:"1.0",
					clientOptions:{accessTokenHttpMethod:"POST",requestTokenHttpMethod:"POST"}
				};
				
				oa = new OAuth(options, function(o) {}); // new OAuth
								
								
				oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){				
					 if(error) {
							console.log('error');
							console.log(error);
							console.log(oa);
						}
					  else { 
						var reqoptions = {                 
						  method: 'GET',             
						  uri: 'https://api.discovergy.com/public/v1/oauth1/authorize?oauth_token='+oauth_token+'&email='+escape(email)+'&password='+escape(password),			
						  headers: {                     			
						   }
						};   

						request(reqoptions, function (error, response, body) {
							
							var verifier = {
									oauth_verifier:body.substr(15),
									oauth_token:oauth_token,
									oauth_token_secret:oauth_token_secret
							};
							oa.getOAuthAccessToken(verifier,function(a,b,c,d) {
								var oauth = {
									oauth_token:b,
									oauth_token_secret:c,
									oauth_version:"1.0",
									oauth_options:options
								}
								//console.log("V",a,b,c,d);
								resolve(oauth);
							
							});
							
						});			
					  }
				});
				
			});
			return p1;
		});
	};


