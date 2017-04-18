pragma solidity ^0.4.10;
/**
 * Smart Meter Gatway Aministration for StromDAO Stromkonto
 * ====================================================================
 * Slot-Link für intelligente Messsysteme zur Freigabe einer Orakel-gesteuerten
 * Zählrestandsgang-Messung. Wird verwendet zur Emulierung eines autarken 
 * Lieferanten/Abnehmer Managements in einem HSM oder P2P Markt ohne zentrale
 * Kontrollstelle.
 * 
 * Kontakt V0.1.3: 
 * Thorsten Zoerner <thorsten.zoerner(at)stromdao.de)
 * https://stromdao.de/
 */


contract owned {
     address public owner;

    function owned() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        if (msg.sender != owner) throw;
        _;
    }

    function transferOwnership(address newOwner) onlyOwner {
        owner = newOwner;
    }
}

contract GWALink is owned {
    uint80 constant None = uint80(0); 
    
    StromDAOReading public reader_in;
    StromDAOReading public reader_out;
    
    // Freigaben für einzelne Nodes
    struct ClearanceLimits {
        uint256 min_time;
        uint256 min_power;
        uint256 max_time;
        uint256 max_power;
        address definedBy;
        bool valid;
    }
    
    // Representation eines Zählerstandes
    struct ZS {
        uint256 time;
        uint256 power_in;
        uint256 power_out;
        address oracle;
    }
    
    event recleared(address link);
    event pinged(address link,uint256 time,uint256 power_in,uint256 power_out);
    
    ClearanceLimits public defaultLimits = ClearanceLimits(1,1,86400,1000,owner,true);
  
    mapping(address=>ZS) public zss;
    mapping(address=>address) public readers;
    
    function changeClearance(uint256 _min_time,uint256 _min_power,uint256 _max_time, uint256 _max_power,bool _clearance) onlyOwner {
        defaultLimits = ClearanceLimits(_min_time,_min_power,_max_time,_max_power,msg.sender,_clearance);
    }
    
    function setNewReaders() onlyOwner {
        reader_in=new StromDAOReading(this,true); 
        reader_out=new StromDAOReading(this,false);
    }

    
    function changeZS(address link,address oracle,uint256 _power_in,uint256 _power_out) onlyOwner {
         ZS zs = zss[link];
         zs.oracle=oracle;
         zs.time=now;
         zs.power_in=_power_in;
         zs.power_out=_power_out;
         recleared(link);
         zss[link]=zs;
        
    }

    
    function ping(address link,uint256 delta_time,uint256 delta_power_in,uint256 delta_power_out) {
        /*
        ClearanceLimits  limits = defaultLimits;
        if(!limits.valid) {  throw; }
        if((limits.min_power>delta_power_in)&&(limits.min_power>delta_power_out) ) throw;
        if((limits.max_power<delta_power_in)&&(limits.max_power<delta_power_out)) throw;
        if(limits.min_time>delta_time) throw;
        if(limits.max_time<delta_time) throw;
             */
        ZS zs = zss[link];
        
        if(zs.time==0) {
            zs.oracle=msg.sender;
            zs.time=now;
        } else {
           // if((zs.oracle!=msg.sender) &&(zs.oracle!=owner)) throw;
        }
   
        zs.time+=delta_time;
        zs.power_in+=delta_power_in;
        zs.power_out+=delta_power_out;
        zss[link]=zs;
        pinged(link,zs.time,zs.power_in,zs.power_out);
    }
}


contract StromDAOReading is owned {
   GWALink public gwalink;
   
   mapping(address=>uint256) public readings;
   event pinged(address link,uint256 time,uint256 total,uint256 delta);
   uint256 lastReading=0;
   bool public isPowerIn;
   
   function StromDAOReading(GWALink _gwalink,bool _isPowerIn) {
       gwalink=_gwalink;
       isPowerIn=_isPowerIn;
   }
   function pingDelta(uint256 _delta) {
       readings[msg.sender]+=_delta;
       if(isPowerIn)  gwalink.ping(msg.sender,now-lastReading,_delta,0);
        else  gwalink.ping(msg.sender,now-lastReading,0,_delta);
       pinged(msg.sender,now,readings[msg.sender],_delta);
       lastReading=now;
   }
   
   function pingReading(uint256 _reading) {
      pingDelta(_reading-readings[msg.sender]);
   }
}



contract PrivatePDcontract is owned {
    address public from;
    address public to;
    GWALink public gwalink;
    uint256 public wh_microcent;
    uint256 public min_tx_microcent;
    uint256 public cost_sum;
    address public mpid;
    PrivatePDcontract public next;
 
    bool public started;
    bool public endure;
    bool public executed;
    uint256 public zs_start;
    uint256 public zs_end;
    uint256 public zs_last;
    uint256 public min_wh;
    
     struct ZS {
        uint256 time;
        uint256 power_in;
        uint256 power_out;
        address oracle;
    }
    
    function PrivatePDcontract(GWALink _link,address _mpid,address _from, address _to,uint256 _wh_microcent,uint256 _min_tx_microcent,bool _endure) {
        gwalink=_link;
        from=_from;
        to=_to;
        wh_microcent=_wh_microcent;
        min_tx_microcent=_min_tx_microcent;
        mpid=_mpid;
        endure=_endure;
        executed=false;
        min_wh=1;
        if(_wh_microcent>0) {
        min_wh=_min_tx_microcent/_wh_microcent;
        }
        started=false;
    }
    function init() {
        var(time,power_in,power_out,oracle) = gwalink.zss(mpid);
        
        zs_start = power_in;

        started=true;
    }
    function check() {
        
        var(cur_time,cur_power_in,cur_power_out,cur_oracle) = gwalink.zss(mpid);
        zs_last = cur_power_in;
        if((cur_power_in>zs_start+min_wh)&&(!executed)) {
            zs_end= cur_power_in;
            if(endure) {
                cost_sum+=wh_microcent*(zs_end-zs_start);
                init();
            }
        }
    }
    function stopEndure()  {
        if((msg.sender!=owner)&&(msg.sender!=from)&&(msg.sender!=to)) throw;
        if(!endure) throw;
        endure=false;
    }
}