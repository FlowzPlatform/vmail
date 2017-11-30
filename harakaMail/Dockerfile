# See http://phusion.github.io/baseimage-docker/
FROM phusion/baseimage:latest


ENV HOME /root

RUN /etc/my_init.d/00_regen_ssh_host_keys.sh

RUN sed 's/main$/main universe/' -i /etc/apt/sources.list
RUN DEBIAN_FRONTEND=noninteractive apt-get -y -q update
RUN DEBIAN_FRONTEND=noninteractive apt-get -y -q install python-software-properties g++ make git curl
RUN curl -sL https://deb.nodesource.com/setup_7.x | setuser root bash -
RUN DEBIAN_FRONTEND=noninteractive apt-get -y -q install nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN add-apt-repository ppa:jonathonf/python-3.6
RUN apt-get update
RUN apt-get install -y python3.6
RUN apt-get install -y python-pip
RUN apt-get install -y python3-pip
RUN python -m pip install --upgrade pip
RUN pip install numpy
RUN pip3 install --upgrade pip
RUN apt-get install -y python3-numpy python3-scipy
# RUN apt-get install -y python-talon
# RUN apt-get install -y python3-talon
RUN pip3 install talon

RUN which python3

# Install Haraka
RUN npm install -g Haraka
RUN haraka -i /usr/local/haraka
WORKDIR /usr/local/haraka
COPY . /usr/local/haraka


# Install app dependencies
RUN cd /usr/local/haraka && npm install

# Create haraka runit service
RUN mkdir /etc/service/haraka
ADD haraka.sh /etc/service/haraka/run

EXPOSE 25

# Start the init daemon - runit will launch the Haraka process
CMD ["/sbin/my_init"]
