#!/bin/sh
echo "#################################################################"
echo "#  Energychain - Distributed Ledger Technology                  #"
echo "#################################################################"

service apache2 stop
nohup npm update -g &
cd /opt/energychain-node/chainspec
nohup parity --config energychain_node.conf --dapps-port 8081 --dapps-apis-all --dapps-hosts all --jsonrpc-hosts all >/dev/null 2>/dev/null &
sleep 10
mkdir /data/ipfs
ipfs -c  /data/ipfs init >/dev/null 2>/dev/null
nohup /usr/local/bin/ipfs -c /data/ipfs daemon >/dev/null 2>/dev/null &
cd /data
service apache2 restart >/dev/null 2>/dev/null

echo "#################################################################"
echo "#  Energychain - Distributed Ledger Technology                  #"
echo "#################################################################"
echo "Note access node via Web requires to setup a webuser with:"
echo "webuser -u someusername -p somepassword stromdao-mp" 
echo "#################################################################"

echo "httpservice" | stromdao
