const Discovergy=require("./discovergy.js");


module.exports = function (stromkonto,vm) {
	this.stromkonto=stromkonto;
	this.vm=vm;
	
	
	this.zsg = function(cb) {
			var res = {};			
			var dgy = new Discovergy(this.vm.dgy_token,this.vm);
			var meterId= this.vm.storage.getItemSync(this.stromkonto);			
			var archiveq = this.vm.orbitdb.eventlog(this.stromkonto);
			archiveq.load();
			archiveq.events.on('ready', function() { 				
				const last_readings = archiveq.iterator().collect();
				var last_reading = last_readings[0];
				if(typeof last_reading !="undefined") {
						res.last_reading = last_reading.payload.value;
				}
				//dgy.getMeters(function(o) {console.log(o);});
				
				dgy.getMeterReading(meterId,function(o) {	
							
							res.current_reading=o;							
							var eo = ""+res.current_reading.values.energyOut;
							var ei = ""+res.current_reading.values.energy;
							res.current_reading.values.energyOut=eo.substr(0,eo.length-7);
							res.current_reading.values.energy=ei.substr(0,ei.length-7);
							var delta={};
							if(typeof res.last_reading=="undefined") {
										res.last_reading = {
											time:0,
											values: { energyOut:0 }
										}
							}
							delta.timestamp=res.current_reading.time;
							delta.power_in=res.current_reading.values.energy - res.last_reading.reading_in;
							delta.power_out=res.current_reading.values.energyOut - res.last_reading.reading_out;
							delta.time=res.current_reading.time - res.last_reading.timestamp;
							delta.reading_out=res.current_reading.values.energyOut;
							delta.reading_in=res.current_reading.values.energy;
							
							if( isNaN(delta.power_in) ) delta.power_in=res.current_reading.values.energy;
							if( isNaN(delta.power_out) ) delta.power_out=res.current_reading.values.energyOut;
							
							if(  isNaN(delta.time)) delta.time= res.current_reading.time;							
							archiveq.add(delta).then(function(hash) {
								cb(delta,hash);
							});
				});
				
			});			
	}
};