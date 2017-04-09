pragma solidity ^0.4.10;
/**
 * Smart Meter Gatway Aministration for StromDAO Stromkonto
 * ====================================================================
 * Slot-Link f�r intelligente Messsysteme zur Freigabe einer Orakel-gesteuerten
 * Z�hlrestandsgang-Messung. Wird verwendet zur Emulierung eines autarken 
 * Lieferanten/Abnehmer Managements in einem HSM oder P2P Markt ohne zentrale
 * Kontrollstelle.
 * 
 * Kontakt V0.1: 
 * Thorsten Zoerner <thorsten.zoerner@stromdao.de)
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
    
    struct ClearanceLimits {
        uint256 min_time;
        uint256 min_power;
        uint256 max_time;
        uint256 max_power;
        address definedBy;
        bool valid;
    }
    
    struct ZS {
        uint256 time;
        uint256 power;
        address oracle;
    }
    
    event recleared(address stromkonto);
    
    ClearanceLimits public defaultLimits = ClearanceLimits(1,1,86400,1000,owner,true);
    mapping(address=>ClearanceLimits) public clearances;
    mapping(address=>ZS) public  zss;
    
    function changeDefaults(uint256 _min_time,uint256 _min_power,uint256 _max_time, uint256 _max_power,bool _clearance) onlyOwner {
        defaultLimits = ClearanceLimits(_min_time,_min_power,_max_time,_max_power,msg.sender,_clearance);
    }
    
    function  _retrieveClearance(address stromkonto) private returns (ClearanceLimits) {
        ClearanceLimits  limits = defaultLimits;
        if(clearances[msg.sender].definedBy==owner) { limits=clearances[msg.sender];}
        if(clearances[stromkonto].definedBy==owner) { limits=clearances[stromkonto];}
        return limits;
    }
    
    function getClearance(address stromkonto) returns (uint256, uint256,uint256,uint256,address,bool) {
        ClearanceLimits memory limits = _retrieveClearance(stromkonto);
        return (limits.min_time,limits.min_power,limits.max_time,limits.max_power,limits.definedBy,limits.valid);
    }
    
    function changeMPO(address stromkonto) onlyOwner {
         ZS zs = zss[stromkonto];
         zs.oracle=msg.sender;
         zs.time=now;
         zss[stromkonto]=zs;
    }
    
    function reclear(address stromkonto_or_oracle,uint256 _min_time,uint256 _min_power,uint256 _max_time, uint256 _max_power,bool clearance) onlyOwner {
           clearances[stromkonto_or_oracle]=ClearanceLimits(_min_time,_min_power,_max_time,_max_power,msg.sender,clearance);
           recleared(stromkonto_or_oracle);
    }
    
    function ping(address stromkonto,uint256 delta_time,uint256 delta_power) {
        ClearanceLimits memory limits = _retrieveClearance(stromkonto);
        if(!limits.valid) {  throw; }
        if(limits.min_power>delta_power) throw;
        if(limits.max_power<delta_power) throw;
        if(limits.min_time>delta_time) throw;
        if(limits.max_time<delta_time) throw;
        
        ZS zs = zss[stromkonto];
        
        if(zs.time==0) {
            zs.oracle=msg.sender;
            zs.time=now;
        }
        
        zs.time+=delta_time;
        zs.power+=delta_power;
        zss[stromkonto]=zs;
    }
}