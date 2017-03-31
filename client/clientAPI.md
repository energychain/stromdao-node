# Client API (Javascript Methods and concepts)


## Simple Loader 
Include 

## RFP (Request for Proposal)  
Package: stromdao.negotiation.js

```
dapp.negotiation.factory(rfp).then(function(o) {console.log(o);});
```

Asks node to send a free structured (Object) but signed rfp to the swarm. The node will first check signature and than add rfp object as an IPFS bucket. After this the new IPFS-Hash will be broadcasted to swarm. All swarm nodes will add msg to local message que to be fetched by clients (using /mq ).

## Responds
```
dapp.negotiation.respond(hash,message).then(function(o) {console.log(o);});
```

Will respond to a message (like RFP, other responds). The node will first check signature and than create an ipfs bucket containing a reference to a given hash. After this the new IPFS Hash will be broadcasted to swarm. All swarm nodes will add msg to local message que to be fetched by clients (using /mq ).


