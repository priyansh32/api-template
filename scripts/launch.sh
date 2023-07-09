#!/bin/bash

# use this script to launch the dev environment

docker network create opencodelab-dev

docker run -d --name mq-dev --network opencodelab-dev -p 15672:15672 -p 5672:5672 rabbitmq:3.12-management-alpine

docker run -d --name db-dev --network opencodelab-dev -p 27017:27017 mongo

echo "Waiting for RabbitMQ & MongoDB to start..." 
sleep 10

npm install

npm run dev