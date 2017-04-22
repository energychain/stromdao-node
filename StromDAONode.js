/**
 * Binding für den StromDAO Node zur Anbindung der Energy Blockchain und Arbeit mit den unterschiedlichen BC Objekten (SmartContracts)
 * */
const fs = require("fs");
var ethers = require('ethers');
var storage = require('node-persist');

module.exports = {
    StromDAONode:function(options) {
        
        this.loadContract=function(address,contract_type) {
            var abi = fs.readFileSync("smart_contracts/"+contract_type+".abi");
            contract = new ethers.Contract(address, abi, this.wallet);
            return contract;
        }        
        
        
        if(typeof options.rpc == "undefined") options.rpc='http://app.stromdao.de:8081/rpc';
        if(typeof options.privateKey == "undefined") options.privateKey='0x1471693ac4ae1646256c6a96edf2d808ad2dc6b75df69aa2709c4140e16bc7c4';
        
        var provider = new ethers.providers.JsonRpcProvider(options.rpc, 42);        
        
        this.options=options;
        this.wallet = new ethers.Wallet(options.privateKey,provider);
        
        storage.initSync();
        
    }
};