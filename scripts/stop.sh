#!/bin/bash

# use this script to stop the dev environment

docker stop mq db

docker rm mq db

docker network rm opencodelab-dev