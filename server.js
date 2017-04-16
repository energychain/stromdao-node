'use strict';
var ipfsAPI = require('ipfs-api');
var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'});
var storage = require('node-persist');

const Hapi = require('hapi');
// Create a server with a host and port
const server = new Hapi.Server();
var node = {};
node.node_links=[];

server.connection({ 
    host: '0.0.0.0', 
    port: 8081 
});

const handler = function (request, reply) {

    return reply.proxy({ host: 'localhost', port: 8540, protocol: 'http' });
};

server.register({
    register: require('h2o2')
}, function (err) {

    if (err) {
        console.log('Failed to load h2o2');
    }

    server.start(function (err) {

        console.log('Server started at: ' + server.info.uri);
    });
});

server.route({
    method: 'POST',
    path: '/rpc',
    handler: {
        proxy: {
             uri: 'http://localhost:8540/'
        }
    }
});

server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

	server.route({
		method: 'GET',
		path: '/dapps/{param*}',
		handler: {
			directory: {
				path: 'dapps'
			}
		}
	});

	
});

server.route({
    method: 'GET',
    path: '/discovered/gwalinks',
    handler: function (request, reply) {
        var gwas = storage.getItemSync("gwalinks");
        var res={};
        
        for (var k in gwas){
            if(typeof gwas[k] !="undefined") {
                if(typeof storage.getItemSync(gwas[k]) != "undefined") {
                    res[gwas[k]]={};
                    res[gwas[k]].gwalink=gwas[k];
                    console.log("Meters",gwas[k],storage.getItemSync(gwas[k]));
                    res[gwas[k]].addresses=storage.getItemSync(gwas[k]);
                }
            }
        }
        
        reply(JSON.stringify(res));
    }
});

server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

	server.route({
		method: 'GET',
		path: '/smart_contracts/{param*}',
		handler: {
			directory: {
				path: 'smart_contracts'
			}
		}
	});

	
});

server.register({register:require('stromdao-discovergy'),options:{mpid:'EASYMETER_60176785'}}, (err) => {
    if (err) {
        console.error('Failed to load plugin:', err);
    }
});

// Start the server
server.start((err) => {
    storage.initSync();
    
   	var stromdaonodes = [
		    { ipfs:'/ip4/45.32.155.49/tcp/4001/ipfs/QmYdn8trPQMRZEURK3BRrwh2kSMrb6r6xMoFr1AC1hRmNG',
			  node:'45.32.155.49:8081' 
			},
			{
				ipfs:'/ip4/108.61.210.201/tcp/4001',
				node:'108.61.210.201:8081'
			},
			{
				ipfs:'/ip4/104.199.52.182/tcp/4001',
				node:'/ip4/104.199.52.182/tcp/4001'
			}
		];
    
    stromdaonodes.forEach((n) => {
    	console.log("Connecting",n);
    	ipfs.swarm.connect(n.ipfs);	
    });
    
    
    
    const receiveMsg = (msg) => {
    	// Todo Implement Broadcast handling
    	
    	try {
             var message=JSON.parse(msg.data.toString());
             
             if(typeof message.gwa !="undefined") {
                 var gwa = storage.getItemSync(message.gwa);
                
                 if(typeof gwa == "undefined") {  
                     gwa={}; 
                      gwa.address=message.gwa;
                     var gwas = storage.getItemSync("gwalinks");
                     if(typeof gwas =="undefined") { gwas=[];}
                     gwas[gwas.length]=message.gwa;
                     storage.setItemSync("gwalinks",gwas);
                 }
                 if(typeof message.address !="undefined") {
                     if(typeof gwa[message.address]=="undefined") {
                        gwa[message.address]={};
                        gwa[message.address].discoverd=new Date();
                     }
                     gwa[message.address].updated=new Date();
                    if(typeof message.hash !="undefined") {
                        gwa[message.address].hash=message.hash;
                    }
                 }
                console.log("setM",message.gwa,gwa);
                 storage.setItemSync(message.gwa,gwa);
             }
             
    	} catch(e) { // catch for msg semantic problems 
    	}
    }
    ipfs.pubsub.subscribe('stromdao.link', {discover:true}, receiveMsg);
    ipfs.pubsub.publish('stromdao.link',new Buffer(JSON.stringify({status:"New Node"})),function(l) { });
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});


