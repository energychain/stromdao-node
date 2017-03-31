//const IPFS = require('ipfs');
//const ipfs = new IPFS({init:true,bits:2048,repo:'./tmp/'});
//var stream = require('stream');
var ipfsAPI = require('ipfs-api');
var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'}) 
const OrbitDB = require('orbit-db')
const orbitdb = new OrbitDB(ipfs);
var Wallet = require("ethers-wallet");
var storage = require('node-persist');
var fs = require('fs');
var http = require('http');
storage.initSync();


module.exports = {	
	tx:function(app) {
		var persistFile=function(req,res,bucket) {		
			var storj = require('storj-lib');
			var api = 'https://api.storj.io';
			var concurrency = 6;
			var client = storj.BridgeClient(api, {
				  keyPair: storj.KeyPair(storage.getItemSync('admin.storj.privatekey')),
				  concurrency: concurrency // Set upload concurrency
			});		
			var filepath = './tmp/'+req.param("signature")+".json";			
			fs.writeFileSync(filepath, req.param("data"));
			
			var tmppath = './tmp/'+req.param("signature")+".crypt";			
			var keyring = storj.KeyRing('./', 'keypass');
			var secret = new storj.DataCipherKeyIv();
			var encrypter = new storj.EncryptStream(secret);
			var Readable = require('stream').Readable
			
			
			fs.createReadStream(filepath)
			  .pipe(encrypter)
			  .pipe(fs.createWriteStream(tmppath)).on('finish', function() {

			  // Create token for uploading to bucket by bucketid
			  client.createToken(bucket, 'PUSH', function(err, token) {
				if (err) {
				  console.log('error', err.message);
				}

				// Store the file using the bucket id, token, and encrypted file
				client.storeFileInBucket(bucket, token.token,tmppath, function(err, file) {
				  if (err) {
					return console.log('error', err.message);
				  }

				  // Save key for access to download file
				  keyring.set(file.id, secret);
					
				  console.log(
					'info',
					'Name: %s, Type: %s, Size: %s bytes, ID: %s',
					[file.filename, file.mimetype, file.size, file.id]
				  );
				  fs.unlink(filepath, function(unlinkFailed) {
					  if (unlinkFailed) {
						res.json({ status: 'failed',cause:'storjs',error:'Failed to unlink partial file.'});	
						return console.log('error', 'Failed to unlink partial file.');
					  }

					  
						return;
					  

					});
				  res.json({ fileid:file.id,bucketid:bucket,status:'ok' });	
				  
				});
			  });
			});
		};
	
	
		var nonce=0;
		app.use('/tx', function (req, res,next) {
				res.setHeader('Content-Type', 'application/json');
				req.dapp_from="0x0"; // Just a mock
				if((nonce!=0)&&(req.param("signature"))) {
					var pk = '0xd9b74d77862355ccb4dbe39147eea99145113b406be466070fa4407cd4b39f8f';		
					var wallet = new Wallet(pk,  new Wallet.providers.EtherscanProvider({testnet: false}));			
					
					var transaction = Wallet.parseTransaction(req.param("signature"));

					var tx=parseInt(Buffer.from(transaction.data).toString('hex'),16);
					var cx=nonce;
					
					//tx=parseInt("0x"+tx,16);

					console.log(tx,cx);
					if (tx !== cx) {
						//nonce=0;
						res.json({ status: 'failed',cause:'challenge repsonse',challenge:nonce});
					} else
					if ( ! transaction.from) {
						 nonce=0;
						res.json({ status: 'failed',cause:'from'});
					} else {	
						//res.send(JSON.stringify({ validated: transaction.from,status:'ok' }));	
						req.dapp_from=transaction.from;
						next();
					}
				} else {
					nonce=Math.round(Math.random()*900)+100;				
					res.json({ challenge:nonce,status:'tentetive' });
				}		
		});
		
		app.use('/tx/test',function(req,res) {
			if((typeof req.dapp_from == "undefined")||(req.dapp_from=="0x0")) {
					res.json({ status: 'failed',cause:'No Auth',challenge:nonce});
			} else {
				res.json({ validated:req.dapp_from,status:'ok' });	
			}
		});	
		
		/* Sets/Resets Who is Admin account */
		app.use('/tx/admin/reset',function(req,res) {
			if((typeof req.dapp_from == "undefined")||(req.dapp_from=="0x0")) {
				res.json({ status: 'failed',cause:'No Auth',challenge:nonce});
			} else {
				if(typeof storage.getItemSync('admin.address') == "undefined") {
						storage.setItemSync('admin.address',req.dapp_from);
						res.json({ adminSet:req.dapp_from,status:'ok' });	
				} else {
						if(storage.getItemSync('admin.address')==req.dapp_from) {
								storage.removeItemSync('admin.address');
								res.json({ adminSet:'undefined',status:'ok' });	
						} else {
								res.json({ status: 'failed',cause:'Admin different',adminIs:storage.getItemSync('admin.address')});
						}
				}
				
			}
		});
		app.use('/tx/admin/whois',function(req,res) {
			if((typeof req.dapp_from == "undefined")||(req.dapp_from=="0x0")) {
				res.json({ status: 'failed',cause:'No Auth',challenge:nonce});
			} else {
				res.json({ admin:storage.getItemSync('admin.address'),status:'ok' });
			}
		});
		
		/* Sets Storj Basic Authentication credentials (and generates key) */
		app.use('/tx/admin/storj/basicauth',function(req,res) {
			if((typeof req.dapp_from == "undefined")||(req.dapp_from=="0x0")||(req.dapp_from!=storage.getItemSync('admin.address'))) {
				res.json({ status: 'failed',cause:'No Auth',challenge:nonce});
			} else {				
				var storj = require('storj-lib');
				var api = 'https://api.storj.io';
				var user = {email: req.param("email"), password: req.param("password")};
				var client = storj.BridgeClient(api, {basicAuth: user});
				var keypair = storj.KeyPair();
				client.addPublicKey(keypair.getPublicKey(), function(err) {
					  if (err) {
						res.json({ status: 'failed',cause:'storjs',error:err.message});						
					  } else {									
						storage.setItemSync('admin.storj.privatekey',keypair.getPrivateKey());		
						res.json({ message:'Private/Public Key linked to Storj Account',status:'ok' });
					  }
				});
			}
		});
		
		/* Creates User Bucket (if not exist) and store data on behalf */
		app.use('/tx/bucket/store',function(req,res) {
			if((typeof req.dapp_from == "undefined")||(req.dapp_from=="0x0")) {
				res.json({ status: 'failed',cause:'No Auth',challenge:nonce});
			} else {
				var storj = require('storj-lib');
				var api = 'https://api.storj.io';
				var concurrency = 6;				

				var client = storj.BridgeClient(api, {
				  keyPair: storj.KeyPair(storage.getItemSync('admin.storj.privatekey')),
				  concurrency: concurrency // Set upload concurrency
				});
				if(typeof storage.getItemSync('user.'+req.dapp_from+'.bucketid')  == "undefined") {
						var bucketInfo = {
						  name: req.dapp_from
						};
						client.createBucket(bucketInfo, function(err, bucket) {
								  if (err) {
									// Handle error on failure.
									res.json({ status: 'failed',cause:'storjs',error:err.message});	
								  }

								  // Log out bucket info
								  console.log(
									'info',
									'ID: %s, Name: %s, Storage: %s, Transfer: %s',
									[bucket.id, bucket.name, bucket.storage, bucket.transfer]
								  );
								  storage.setItemSync('user.'+req.dapp_from+'.bucketid',bucket.id);
								  persistFile(req,res,storage.getItemSync('user.'+req.dapp_from+'.bucketid'));							  
						});
				} else {
					persistFile(req,res,storage.getItemSync('user.'+req.dapp_from+'.bucketid'));
				}
			}
		});
		app.use('/tx/ipfs/add',function(req,res) {
			if((typeof req.dapp_from == "undefined")||(req.dapp_from=="0x0")) {
				res.json({ status: 'failed',cause:'No Auth',challenge:nonce});
			}  else {
				var msg = {};
				msg.data=req.param("data");
				msg.signee=req.dapp_from
				msg.timestamp=new Date();
				msg.signature=req.param("signature");
				msg.mediation={};
				msg.mediation.peer=ipfs.id;
				
				ipfs.files.add(new Buffer(JSON.stringify(msg))).then(function(o) {											
						ipfs.pubsub.publish('stromdao',new Buffer(JSON.stringify(o)),function(l) { console.log(l); });
						//var archiveq = orbitdb.eventlog(msg.signee);
						archiveq.add(o[0].hash);
						
						subscriptions.set(o[0].hash,msg.signee).then( () => {
							console.log("Subscription saved for ",o[0].hash,msg.signee);
						});						
						res.json({ status: 'ok',storage:o[0]});	
				});
			}
		});
		app.use('/cat',function(req,res) {			
				var hash=""+req.param("hash");				
				ipfs.files.cat(hash,function(e,stream) {
					var string = ''
					stream.on('data',function(buffer){
					  var part = buffer;
					  string += part;					 
					});


					stream.on('end',function(){					 
					 res.write(string);
					 res.end();
					});
				});
							
		});
		app.use('/mq',function(req,res) {
				var next=req.param("hash");
				if(next!=null) {
						var next=archiveq.get(next);
						if(next!=null) {
							res.json(archiveq.get(next));
						} else {
								// try to get Hash...
								res.end();
						}
				} else {
					const items = archiveq.iterator().collect();
					res.json(items[0]);
				}				
				
		});
		app.use('/tx/bucket/retrieve',function(req,res) {
			if((typeof req.dapp_from == "undefined")||(req.dapp_from=="0x0")) {
				res.json({ status: 'failed',cause:'No Auth',challenge:nonce});
			} else {
				var storj = require('storj-lib');
				var api = 'https://api.storj.io';
				var concurrency = 6;				

				var client = storj.BridgeClient(api, {
				  keyPair: storj.KeyPair(storage.getItemSync('admin.storj.privatekey')),
				  concurrency: concurrency // Set upload concurrency
				});
				var bucketid=storage.getItemSync('user.'+req.dapp_from+'.bucketid');
				var fileid=req.param("fileid");
				var keyring = storj.KeyRing('./', 'keypass');
				var through = require('through');
				var secret = keyring.get(fileid);
				var decrypter = new storj.DecryptStream(secret);
				var received = 0;
				var exclude = [];
				var filepath = './tmp/'+bucketid+'_'+fileid+'.json';
				var target = fs.createWriteStream(filepath);
				res.writeHead(200, {
					'Content-Type': 'text/plain'					
				});

				client.createFileStream(bucketid, fileid, {
				  exclude: exclude
				},function(err, stream) {
				  if (err) {
					res.json({ status: 'failed',cause:'storjs',error:err.message});	
					return console.log('error', err.message);
				  }
				  stream.on('end',function() {
					res.end();					
				  });
				  stream.on('error', function(err) {
					console.log('warn', 'Failed to download shard, reason: %s', [err.message]);
					fs.unlink(filepath, function(unlinkFailed) {
					  if (unlinkFailed) {
						res.json({ status: 'failed',cause:'storjs',error:'Failed to unlink partial file.'});	
						return console.log('error', 'Failed to unlink partial file.');
					  }


					return;
					  

					});
				  }).pipe(through(function(chunk) {
					received += chunk.length;
					console.log('info', 'Received %s of %s bytes', [received, stream._length]);
					this.queue(chunk);
				  })).pipe(decrypter).pipe(res);
				});
			}
		});
	}
};


const receiveMsg = (msg) => {
	// Todo Implement Broadcast handling
  var message=JSON.parse(msg.data.toString());
  var hash = message[0].hash;

  ipfs.files.cat(hash,function(e,stream) {
					var string = ''
					stream.on('data',function(buffer){
					  var part = buffer;
					  string += part;					  
					});


					stream.on('end',function(){					 
					 // string is message body;
												
						var json=JSON.parse(string);
						archiveq.add(json).then(() => {
						});
						json.data=JSON.parse(json.data);
						
						if(typeof json.data.type !="undefined") {
						
							if(json.data.type=="respond") {	
									console.log("Checking Respond",json.data.respond);
									
									var listener = subscriptions.get(json.data.respond);
									console.log(listener);
									if(listener) {									
										var msq = orbitdb.eventlog(listener);			
										msq.add(json);
										console.log("Addes to msq of ",listener);
									}
							}
						}
					});
				});				
  console.log(msg.data.toString());
}

stromdaonodes= [
    { ipfs:'/ip4/45.32.155.49/tcp/4001/ipfs/QmYdn8trPQMRZEURK3BRrwh2kSMrb6r6xMoFr1AC1hRmNG'',
	  node:'45.32.155.49:3000' 
	}
]

var subscriptions = orbitdb.kvstore("subscriptions");
subscriptions.events.on('ready', () => {
  console.log("subscriptions ready to use");
})
var archiveq = orbitdb.eventlog('msgs');
archiveq.load();
//var kv = orbitdb.kvstore("subscriptions");

stromdaonodes.forEach((n) => {
	console.log("Connecting",n);
	ipfs.swarm.connect(n.ipfs);	
})
ipfs.pubsub.subscribe('stromdao', {discover:true}, receiveMsg);
