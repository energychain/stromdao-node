#!/bin/sh
echo "#################################################################"
echo "#  Energychain - Distributed Ledger Technology                  #"
echo "#                                                               #"
echo "#  Phase 1: System Update                                       #"
echo "#################################################################"
apt update > /dev/null
apt install -y python2.7 python build-essential sudo git curl openssl netcat g++ apache2 > /dev/null
a2enmod rewrite
a2enmod proxy
a2enmod headers
a2enmod proxy_http
cp /app/000-default.conf /etc/apache2/sites-available
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
apt-get install -y nodejs > /dev/null
echo "#################################################################"
echo "#  Energychain - Distributed Ledger Technology                  #"
echo "#                                                               #"
echo "#  Phase 2: Installation of STROMDAO Toolchain                  #"
echo "#################################################################"

cd /
chmod -R 777 /usr/lib/node_modules/
npm install -g node-gyp
curl -o /tmp/energychain.tgz https://l3.stromdao.de/energychain.tgz
tar -zxf /tmp/energychain.tgz

rm -Rf /opt/energychain-node/keys/
rm /opt/energychain-node/chains/energychain_poa/network/key

/usr/local/bin/ipfs init
echo "#################################################################"
echo "#  Energychain - Distributed Ledger Technology                  #"
echo "#                                                               #"
echo "#  Phase 3: Starting Core Services                              #"
echo "#################################################################"
service apache2 restart
chmod -R 777 /usr/lib/node_modules/
sudo npm install -g stromdao-bo-mpo > /dev/null
sudo npm install -g fury.network > /dev/null
mv -r /app/public /data
chmod -r 644 /data/public 
cd /data
stromdao store container 1
cp /app/dot_env.rpc /data/.env

