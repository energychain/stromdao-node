/** Simple script optimized to reproduce **/

var provider = new ethers.providers.JsonRpcProvider('http://app.stromdao.de:8081/rpc', 42);
var abi = [{"constant":false,"inputs":[{"name":"_reading","type":"uint256"}],"name":"pingReading","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"readings","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"isPowerIn","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"gwalink","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_delta","type":"uint256"}],"name":"pingDelta","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"_gwalink","type":"address"},{"name":"_isPowerIn","type":"bool"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"link","type":"address"},{"indexed":false,"name":"time","type":"uint256"},{"indexed":false,"name":"total","type":"uint256"},{"indexed":false,"name":"delta","type":"uint256"}],"name":"pinged","type":"event"}];
var deployed_reading="0x1E6c8aD97c3Eb1dC8b5b4FCE6cEE993938404Ac5";


function getReading(eth_address) {
    var contract = new ethers.Contract(deployed_reading, abi, provider);
    contract.readings(eth_address).then(function(o) {
        $('#readingR').val(o[0].toString());
        console.log(o);
    });
}

function submitReading() {
    
    var html = "";
    
    var Wallet = ethers.Wallet;
    var wallet = new Wallet($('#pki').val(),provider);
    
    var contract = new ethers.Contract(deployed_reading, abi, wallet);
    $('#publicadr').val(wallet.address);
    var sendPromise = contract.pingReading($('#reading').val());

    sendPromise.then(function(transaction) {
        console.log(transaction);
        html+="<strong>Energy Blockchain Transaction:</strong>"+transaction.hash;
        $('#result').html($('#result').html()+html);
    });
    
}

$(document).ready(function()  { 
    $('#reading').val(new Date().getTime()); // Set a Reading that makes kind of sense
    
    
    $('#doReading').on('click',function() {
        var html="";
       if($('#pki').val().length<30) {
                $('#doReading').html("(Erstelle privaten Schlüssel - lange warten!)");
               var Wallet = ethers.Wallet;
               
               console.log("Generating a pseudo browser wallet");   
                
               Wallet.fromBrainWallet($('#username').val(), $('#password').val()).then(function(wallet) {
                    html+="<strong>Etheresum-Adresse:</strong>"+wallet.address+"<br/>";
                    $('#pki').val(wallet.privateKey);    
                    
                    submitReading();
                }); 
       } else {
           $('#result').html(html);
           submitReading();
       }
    });    
    
    $('#retrieveReading').on('click',function() {
        getReading($('#eth_address').val());
    })
});