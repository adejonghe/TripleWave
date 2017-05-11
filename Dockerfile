FROM node

RUN echo "deb http://http.debian.net/debian jessie-backports main" >> /etc/apt/sources.list

RUN apt-get -qq update && apt-get -qq install -y -t jessie-backports openjdk-8-jdk 

COPY . /opt/tw

WORKDIR /opt/tw 

EXPOSE 8114
EXPOSE 8124
EXPOSE 3030

RUN npm install

ENTRYPOINT ["bash", "start.sh", "--configuration", "config/config.properties.caprads"] 
