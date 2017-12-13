FROM whiledo/letsencrypt-apache-ubuntu

# install dependencies
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		apache2 \
		git \
	&& rm -r /var/lib/apt/lists/*

#RUN echo "" > /var/www/html/index.html
#RUN git clone https://github.com/letsencrypt/letsencrypt
#RUN /data/letsencrypt/letsencrypt-auto --help

# Default command
CMD ["apachectl", "-D", "FOREGROUND"]

# Install Node.js
RUN apt-get update \
	&& apt-get install --yes curl
RUN curl --silent --location https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get install --yes nodejs
RUN apt-get install --yes build-essential

#create directory html
#RUN mkdir /var/www/html/dist
RUN mkdir -p /opt/app

#working directory
WORKDIR /opt/app
ADD . /opt/app
RUN npm install

#build application
ENV microUrl="http://api.flowz.com/vmailmicro"
ENV serverBaseUrl="http://api.flowz.com/vservice/"
ENV socketUrl="http://ws.flowz.com/vservice/"
ENV userUpdate="http://api.flowz.com/user"
RUN npm run build
RUN cp -a -f /opt/app/dist/* /var/www/html/
#RUN cp /opt/app/.htaccess /var/www/html/
#RUN cp /opt/app/vhost.conf /etc/apache2/sites-enabled/
RUN rm -rf /opt/app/*
RUN a2enmod rewrite
RUN service apache2 restart

EXPOSE 80 443
