FROM node:20

RUN apt-get update && apt-get install -y openssh-server

RUN mkdir /var/run/sshd
# Set root password for SSH access (change 'your_password' to your desired password)
RUN echo 'root:your_password' | chpasswd
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

WORKDIR /usr/src/app

COPY test.js ./

EXPOSE 22

CMD ["node", "test.js"]
