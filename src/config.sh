#!/bin/bash -xe
# Update with optional user data that will run on instance start.
# Learn more about user-data: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html
#mkdir -p /home/ec2-user/test
#installing libs
yum update -y
amazon-linux-extras install docker
service docker start
systemctl enable docker
usermod -a -G docker ec2-user
docker info
cd /home/ec2-user/
touch /home/ec2-user/Dockerfile
tee -a /home/ec2-user/Dockerfile <<EOF
FROM ubuntu:18.04

# Install dependencies
RUN apt-get update && \
 apt-get -y install apache2

# Install apache and write hello world message
RUN echo 'Hello World!' > /var/www/html/index.html

# Configure apache
RUN echo '. /etc/apache2/envvars' > /root/run_apache.sh && \
 echo 'mkdir -p /var/run/apache2' >> /root/run_apache.sh && \
 echo 'mkdir -p /var/lock/apache2' >> /root/run_apache.sh && \ 
 echo '/usr/sbin/apache2 -D FOREGROUND' >> /root/run_apache.sh && \ 
 chmod 755 /root/run_apache.sh

EXPOSE 80

CMD /root/run_apache.sh
EOF

echo `pwd` >> /home/ec2-user/pwd.txt  

docker build -t hello-world .

sleep 10

docker images --filter reference=hello-world

sleep 30

docker run -d -t -i -p 80:80 hello-world

sleep 20

mkdir -p /root/.aws
cd ~/.aws

tee -a config <<EOF 
[default]
output = json
region = us-east-1
EOF

sleep 10

aws ecr create-repository --repository-name hello-repository --region us-east-1

docker tag hello-world 459602490943.dkr.ecr.us-east-1.amazonaws.com/hello-repository

aws ecr get-login-password | docker login --username AWS --password-stdin 459602490943.dkr.ecr.us-east-1.amazonaws.com

docker push 459602490943.dkr.ecr.us-east-1.amazonaws.com/hello-repository
