/**
 GWALink Deployment to PoA Chain
*/

const Bootstrap=require("./bootstrap.js");
const Discovergy=require("./discovergy.js");
const fs = require("fs");

var ethers = require('ethers');

var storage = require('node-persist');

var bootstrap = new Bootstrap(function() {

		var vm=bootstrap;
		
		var provider = new ethers.providers.FallbackProvider([
							new ethers.providers.JsonRpcProvider("http://localhost:8540/")
						]);	
		var wallet = new ethers.Wallet(vm.storage.getItemSync("node.privateKey"),provider);
		
		//console.log(wallet.address);
		
		var abi = JSON.parse(fs.readFileSync("../../smart_contracts/gwalink.abi"));
		var bytecode = "0x"+fs.readFileSync("../../smart_contracts/gwalink.bin").toString();
		var Contract = ethers.Contract;
		console.log("Deploying as Owner",wallet.address);	
			
		var deployTransaction = Contract.getDeployTransaction(bytecode, abi);
		
		
		
		var sendPromise = wallet.sendTransaction(deployTransaction).then(function(transaction) {
						console.log(transaction);
						var gwalink = ethers.utils.getContractAddress(transaction);
						var deployment = JSON.parse(fs.readFileSync("../../smart_contracts/deployment_poa.json"));
						deployment.gwalink=gwalink;
						fs.writeFileSync("../../smart_contracts/deployment_poa.json",JSON.stringify(deployment));
						console.log("Current Deployment",deployment);
						var contract = new ethers.Contract(gwalink,JSON.parse(fs.readFileSync("../../smart_contracts/gwalink.abi")), wallet);
						contract.changeClearance(1,1,86400,50000,true).then(function(e,t) {
								console.log("changeClearance",e,t);
						});
		});;
		
		
});