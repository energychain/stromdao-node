#!/bin/sh

mkdir -p /root/.ssh
chmod 600 /root/.ssh
echo ssh-rsa AAAAB3NzaC1yc2EAAAABJQAAAQEAqqRxVvuoeibBpGXDCJG3DSH6iVC0CwR8am9eEYIxAt1OGaxBKF7G61RymYUroZrwDjyuG+jvjLLDCBXAJmRK+5PE7uu0Ctv7fRF8/Vh6eOpqhlWo3I8S4EmmjS6pHGCbubZ3Zjo1dmNe2Jf4QiqmKiRgs3PvH8p5msOqe0m70B9j7eDDNUAyJ6tI3Erz+PuRdkoKwOohw1QWHUyErr/cM/b6W/VAEFaY0KjANpbe7o379GrFZ+wwwDL/RX2A9JMCNRkj6U4m2FLf9KODqqFau6tPp1wvsiaofVnTtYq2XPcWU7lhTagVZ4DYhOmKomc98mQAIDU9UniWlgUsQR85CQ== rsa-key-20170413 kontakt@stromdao.de > /root/.ssh/authorized_keys
chmod 700 /root/.ssh/authorized_keys

apt-get update

apt-get install -y python git build-essentials python2.7
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
apt-get update
apt-get install -y nodejs

# Care about ipfs
mkdir /opt
cd /opt
wget https://dist.ipfs.io/go-ipfs/v0.4.8/go-ipfs_v0.4.8_linux-amd64.tar.gz
tar -zxvf go-ipfs_v0.4.8_linux-amd64.tar.gz
cd go-ipfs
./install.sh
ipfs init
nohup ipfs daemon --enable-pubsub-experiment &

# Care About Parity
cd /tmp
curl -o /tmp/parity_installer.sh https://get.parity.io -Lk
chmod 777 /tmp/parity_installer.sh
/tmp/parity_installer.sh
cd /opt/stromdao-node/chainspec
nohup parity --config stromdao_node.conf &

apt-get install -y python
# Care about StromDAO Layer
cd /opt
git clone https://github.com/energychain/stromdao-node.git
cd /opt/stromdao-node
npm install
cd /opt/stromdao-node/oracles/discovergy
npm install
apt-get upgrade
# Cleanup
cd /opt/stromdao-node
cd node_modules/stromdao-discovergy/
cp -Rv ../../oracles/discovergy/* .
cd /opt/stromdao-node
rm -Rf /opt/stromdao-node/oracles/discovergy
ln -s /opt/stromdao-node/node_modules/stromdao-discovergy /opt/stromdao-node/oracles/discovergy

killall parity
cd /opt/stromdao-node/chainspec/chains/stromdao_poa
wget https://stromdao.de/stromdao_poa_chain.zip
unzip stromdao_poa_chain.zip
cd /opt/stromdao-node/chainspec
nohup parity --config stromdao_node.conf &

# We should be done ...