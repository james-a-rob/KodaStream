FROM node:20

RUN apt-get update && apt-get install -y openssh-server
RUN apt-get update && apt-get install -y wget qemu-user-static && \
    wget -O dockerize.tar.gz https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz && \
    tar -C /usr/local/bin -xzf dockerize.tar.gz && \
    rm dockerize.tar.gz

RUN mkdir /var/run/sshd
# Set root password for SSH access (change 'your_password' to your desired password)
RUN echo 'root:your_password' | chpasswd
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd


WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY public ./public
COPY videos ./videos




RUN npm install
RUN npm run build



EXPOSE 22 
EXPOSE 3000
EXPOSE 4000

CMD dockerize -wait tcp://db:5432 -timeout 60s npm run migrations:run && npm run start:dev

# CMD ["npm", "run", "start:dev"]
