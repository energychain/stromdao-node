'use strict';

var Web3 = require('web3');
const fs = require("fs");


exports.register = function (server, options, next) {
 
    	server.route({
    			method: 'GET',
    			path: '/deploy/poa',
    			handler: function (request, reply) {
    			    reply("OK");
    			}
    	});
 
}    

exports.register.attributes = {
    pkg: require('./package.json')
};