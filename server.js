'use strict';
var ipfsAPI = require('ipfs-api');
var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'});

const Hapi = require('hapi');
// Create a server with a host and port
const server = new Hapi.Server();
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

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});

var stromdaonodes = [
    { ipfs:'/ip4/45.32.155.49/tcp/4001/ipfs/QmYdn8trPQMRZEURK3BRrwh2kSMrb6r6xMoFr1AC1hRmNG',
	  node:'45.32.155.49:3000' 
	}
];

stromdaonodes.forEach((n) => {
	console.log("Connecting",n);
	ipfs.swarm.connect(n.ipfs);	
});


const receiveMsg = (msg) => {
	// Todo Implement Broadcast handling
	console.log(msg.data.toString());
  //var message=JSON.parse(msg.data.toString());
  //console.log(message);
}
ipfs.pubsub.subscribe('stromdao.link', {discover:true}, receiveMsg);
ipfs.pubsub.publish('stromdao.link',new Buffer(JSON.stringify({status:"New Node"})),function(l) { console.log(l); });