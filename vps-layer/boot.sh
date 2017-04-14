#!/bin/sh

ipfs init
nohup ipfs daemon --enable-pubsub-experiment &

cd /opt/stromdao-node/chainspec
nohup parity --config stromdao_node.conf &

cd /opt/stromdao-node

echo "Weiter geht es mit npm start :"