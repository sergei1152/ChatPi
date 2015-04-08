#!/bin/bash
#Starts up the mongodb and the redis server in the background
mongod --dbpath data &> /dev/null &
redis-server &> dev/null &
