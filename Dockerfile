# EnergyChain - Distributed Ledger Technology with power
##########################################################
FROM ubuntu

# Set the working directory to /app
WORKDIR /data

# Copy the current directory contents into the container at /app
ADD . /app

# Install any needed packages specified in requirements.txt
RUN bash /app/install.sh
VOLUME /data

# Make ports available to the world outside this container
EXPOSE 80
EXPOSE 4001
EXPOSE 4002/udp
EXPOSE 5001
EXPOSE 8080
EXPOSE 8081
EXPOSE 8089
EXPOSE 8181

# Run app.py when the container launches
CMD ["/bin/bash", "/app/launch.sh"]
