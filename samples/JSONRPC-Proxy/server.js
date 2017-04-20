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
