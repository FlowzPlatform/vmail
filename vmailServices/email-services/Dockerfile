FROM node:alpine
MAINTAINER flowz <dm@officebrain.com>

#working directoryy
WORKDIR /opt/app/
ADD . /opt/app/
RUN npm install
CMD npm start

# Ports
EXPOSE 3000