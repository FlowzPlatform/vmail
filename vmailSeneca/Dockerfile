FROM node:alpine
#FROM node:8.2.1
#RUN apk update && apk upgrade
#RUN apk add --update nodejs nodejs-npm && npm install npm@latest -g
#RUN apk add nodejs


ADD . /usr/src/app/

WORKDIR /usr/src/app/

RUN npm install

EXPOSE 4000

CMD node index.js
