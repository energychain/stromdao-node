#!/bin/sh

nohup ipfs daemon --enable-pubsub-experiment &
nohup parity --config stromdao_node.conf --gasprice 0 &