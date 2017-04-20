/**
 * Der SimpleClient zeigt, wie Messwerte an den StromDAO Energy Blockchain gesendet werden können.
 * Verwendung:
 *    node simpleClient.js Zählerstand 
 * 
 * Beispiel:
 *    node simpleClient.js 1337
 */

var privateKey="0x1471693ac4ae1646256c6a96edf2d808ad2dc6b75df69aa2709c4140e16bc7c4"; // <= Ein privater Schlüssel 0x1471693ac4ae1646256c6a96edf2d808ad2dc6b75df69aa2709c4140e16bc7c4 für 0x4Cd9Cf35C70C568543a6a583E6e713ea5BF14Acd


/*********************************************************************/
/*  Hier keine weiteren Einstellungen notwendig                      */
/*********************************************************************/
var ethers = require('ethers');
var provider = new ethers.providers.JsonRpcProvider('http://app.stromdao.de:8081/rpc', 42);
var abi = [{"constant":false,"inputs":[{"name":"_reading","type":"uint256"}],"name":"pingReading","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"readings","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"isPowerIn","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"gwalink","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_delta","type":"uint256"}],"name":"pingDelta","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"_gwalink","type":"address"},{"name":"_isPowerIn","type":"bool"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"link","type":"address"},{"indexed":false,"name":"time","type":"uint256"},{"indexed":false,"name":"total","type":"uint256"},{"indexed":false,"name":"delta","type":"uint256"}],"name":"pinged","type":"event"}];
var deployed_reading="0x1E6c8aD97c3Eb1dC8b5b4FCE6cEE993938404Ac5";

var Wallet = ethers.Wallet;
var wallet = new Wallet(privateKey,provider);

var contract = new ethers.Contract(deployed_reading, abi, wallet);
    
var sendPromise = contract.pingReading(process.argv[2]);

sendPromise.then(function(transaction) {
        console.log("EnergyBlockchain Transaktion",transaction);
});