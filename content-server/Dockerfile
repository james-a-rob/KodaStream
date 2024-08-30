FROM node:20

RUN apt-get update && apt-get install -y openssh-server

RUN mkdir /var/run/sshd && \
    echo 'root:password' | chpasswd && \
    sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

RUN echo "export VISIBLE=now" >> /etc/profile

WORKDIR /usr/src/app

COPY test.js ./

EXPOSE 22

CMD ["node", "test.js"]
