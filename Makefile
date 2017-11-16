#
# Deployment via Makefile to automate general Quick Forward 
#

PROJECT = "StromDAO - Energy Chain Node"


all: build commit publish

commit: ;git add -A;git commit -a; git push;

build: ;docker build -t energychain .;docker volume create energychain_data

run: ;docker run --mount source=energychain_data,target=/data  -p 10080:80 -p 5001:5001 -p 8080:8080 -p 8180:8180 -p 8089:8089 -p 8545:8545 -p 8546:8546 -p 30303:30303 -p 30303:30303/udp energychain/node /bin/bash /app/launch.sh

build-run: build run

publish: ;docker tag energychain:latest energychain/node;docker push energychain/node
