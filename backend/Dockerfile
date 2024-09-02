FROM node:20

RUN apt-get update && apt-get install -y ffmpeg

RUN apt-get update && apt-get install -y wget qemu-user-static && \
    wget -O dockerize.tar.gz https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz && \
    tar -C /usr/local/bin -xzf dockerize.tar.gz && \
    rm dockerize.tar.gz


WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY . .


RUN rm -fr node_modules
RUN npm install
RUN npm run build



EXPOSE 22 
EXPOSE 3000
EXPOSE 4000


CMD dockerize -wait tcp://db:5432 -timeout 60s npm run migrations:run && npm run start:dev
