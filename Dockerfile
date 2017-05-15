FROM joakimbeng/java-node

COPY . /opt/tw

WORKDIR /opt/tw 

EXPOSE 8114
EXPOSE 8124
EXPOSE 3030

RUN npm install

ENTRYPOINT ["bash", "start.sh", "--configuration", "config/config.properties.caprads"] 
