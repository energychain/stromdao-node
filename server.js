'use strict';

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