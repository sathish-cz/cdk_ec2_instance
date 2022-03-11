#!/bin/bash -xe
# Update with optional user data that will run on instance start.
# Learn more about user-data: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html
mkdir -p /home/ec2-user/test
touch /home/ec2-user/file