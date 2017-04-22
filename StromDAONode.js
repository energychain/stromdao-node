/**
 * Binding für den StromDAO Node zur Anbindung der Energy Blockchain und Arbeit mit den unterschiedlichen BC Objekten (SmartContracts)
 * */
const fs = require("fs");
var ethers = require('ethers');
var storage = require('node-persist');

module.exports = {
    Node:function(options) {
        parent = this;
		
		
		this._keepObjRef=function(address,contract_type) {
			if(typeof parent.objRef[contract_type]=="undefined") {
					parent.objRef[contract_type] = {};
			}
			if(typeof parent.objRef[address] == "undefined") {
				parent.objRef[address] = {type: contract_type };
				parent.objRef[contract_type][address]={ type: contract_type};
				storage.setItemSync("objRef",parent.objRef); 
			}					
		}
		
		this._keepHashRef=function(transaction) {
				storage.setItemSync(transaction.hash,transaction);
				return transaction.hash;
		}
		this.getRef=function(ref) {
				return storage.getItemSync(ref);
		}
        this._loadContract=function(address,contract_type) {
            var abi = JSON.parse(fs.readFileSync("smart_contracts/"+contract_type+".abi"));
            contract = new ethers.Contract(address, abi, this.wallet);
			parent._keepObjRef(address,contract_type);
            return contract;
        }       
		
		this._objInstance=function(obj_or_address,type_of_object) {
				var instance = {};
				instance.obj=obj_or_address;
				if(typeof obj != "object") {
					instance.obj = parent._loadContract(instance.obj,type_of_object);
				} else {
					// Hier könnte man neue Objekte Deployen!	
				}
				return instance;
		}
        
		this.reader = function(obj_or_address) {
			var instance=parent._objInstance(obj_or_address,'StromDAOReader');
			instance.pingReading = function(reading) {
					var p1 = new Promise(function(resolve, reject) { 
						instance.obj.pingReading(reading).then(function(o) {
							resolve(parent._keepHashRef(o));
						});
					});
					return p1;
			}
			return instance;
		}
		
        this.gwalink = function(obj_or_address) {			
			var gwalink=parent._objInstance(obj_or_address,'gwalink');
			
			var p1 = new Promise(function(resolve, reject) { 
					gwalink.obj.reader_in().then(
							function(o) { 
									gwalink.reader_in=parent.reader(o[0]);	
									
									gwalink.obj.reader_out().then(
										function(o) { 
												gwalink.reader_out=parent.reader(o[0]);
												resolve(gwalink);
										});
							});
			});
			return p1;
		}
		
		this.pdcontract = function(obj_or_address) {
			var p1 = new Promise(function(resolve, reject) { 
					var instance=parent._objInstance(obj_or_address,'PrivatePDcontract');
					instance.check = function() {
						var p1 = new Promise(function(resolve, reject) { 
								instance.obj.check().then(function(o) {
									resolve(parent._keepHashRef(o));	
								});
						});
						return p1;
					};
					instance.costSum = function() {
							
							var p1 = new Promise(function(resolve, reject) { 
									instance.obj.cost_sum().then(function(o) {
										resolve(o);	
									});
							});
							
							return p1;
							
							//return instance.obj.cost_sum();
					}
					resolve(instance);
			});
			return p1;
		}
		
        if(typeof options.rpc == "undefined") options.rpc='http://app.stromdao.de:8081/rpc';
        if(typeof options.privateKey == "undefined") options.privateKey='0x1471693ac4ae1646256c6a96edf2d808ad2dc6b75df69aa2709c4140e16bc7c4';
        
        var provider = new ethers.providers.JsonRpcProvider(options.rpc, 42);        
        
        this.options=options;
        this.wallet = new ethers.Wallet(options.privateKey,provider);
        
        storage.initSync();
        this.objRef = storage.getItemSync("objRef");
		if((typeof this.objRef == "undefined")||(typeof this.options.clearRefCache != "undefined")) {
				storage.setItemSync("objRef",{}); 
				this.objRef=storage.getItemSync("objRef");
		}
    }
};