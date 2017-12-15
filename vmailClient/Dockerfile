FROM ubuntu:16.04

# install dependencies
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		apache2 \
	&& rm -r /var/lib/apt/lists/*

# Default command
CMD ["apachectl", "-D", "FOREGROUND"]

# Install Node.js
RUN apt-get update \
	&& apt-get install --yes curl
RUN curl --silent --location https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get install --yes nodejs
RUN apt-get install --yes build-essential

# Install ssl certificate
RUN apt-get update
RUN apt-get install software-properties-common
RUN add-apt-repository ppa:certbot/certbot
RUN apt-get update
RUN apt-get install python-certbot-apache

RUN certbot --apache

#create directory html
#RUN mkdir /var/www/html/dist
RUN mkdir -p /opt/app

#working directory
WORKDIR /opt/app
ADD . /opt/app
RUN npm install


ARG module1=vservice
ARG module2=vmailmicro
ARG module3=user


#build application
ENV microUrl="http://api.flowz.com/$module2"
ENV serverBaseUrl="http://api.flowz.com/$module1/"
ENV socketUrl="http://ws.flowz.com:4036"
ENV userUpdate="http://api.flowz.com/$module3"

RUN npm run build
RUN cp -a -f /opt/app/dist/* /var/www/html/
#RUN cp /opt/app/.htaccess /var/www/html/
#RUN cp /opt/app/vhost.conf /etc/apache2/sites-enabled/
RUN rm -rf /opt/app/*
RUN a2enmod rewrite
RUN service apache2 restart
