# stromdao-node
Fullstack Node 

StromDAO is an energy focused decentralized autonomous organization backed by blockchain technology. 

This node package contains middleware and front-end code to setup a swarm node.

## [German] Business Case
Die Blockchain Technologie erlaubt es die Wertschöpfungskette beim Umgang mit Energielieferungen auf eine durchgehende Vertrauenskette aufzubauen (=Konsensraum). Bei der StromDAO sind daraus eine Anzahl von Werkzeugen entstanden (Oracles, Smart Contracts, Cloud Infrastruktur,...), welche in der als StromDAO-Node bezeichneten Platform subsumiert wurden. 

### Anwendungsbereiche
- SmartGrid Operations (Netzbetrieb)
- Stromlogistik (Allgemein)
- Prosumer / Mieterstrom 
- Energieabrechnung
- Peer2Peer Energietrading
- Hybridstrommarkt
- Sektorkopplung
- Netzintegration eMobilität 
- Demand Side Management 

## Requirements
Running IPFS Node ( https://ipfs.io/ ) with flag 
```
--enable-pubsub-experiment
```


## Installation
```
npm install
```

## Start (Standard-Node)
```
npm start
```

Im Anschluss sollte auf Port 8081 der StromDAO-Node erreichbar sein.

## VPS Layer (Ubuntu 16.xx) 

A SmartGrid Node (MeterPoint Operator / Peer2Peer Node) might be easy setup using the VPS-Layer. Simply run according script to bootstrap. (Note: Will setup a public key to manage Node!)

## Contributing
- https://stromdao.de/
- https://gitter.im/stromdao/Lobby

