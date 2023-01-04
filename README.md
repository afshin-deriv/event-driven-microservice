# Event-Driven Microservices Backend Case study

Proof of Concept for a scalable simple trading Application, based on simplified event-driven microservices architecture and Docker containers. :whale:

[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)


- Trade microservice: handles buy and sell transactions and publishes respective events
- Payment microservice: manages the funds (deposits and withdrawals) for the users and published respective events
- Reporting microservice: listens to the events from both Trade and Payment services and shows statistics. 

## Requirements:
* docker >= 17.12.0+
* docker-compose

## Running the entire application stack
* Clone or download this repository
* Go inside of directory,  `cd Case-study-Event-driven-architecture`
```
docker-compose up -d --build
docker-compose down --rmi all
```


## Environments
The Compose file contains the following environment variables:

* `POSTGRES_USER` the default value is **postgres**
* `POSTGRES_PASSWORD` the default value is **changeme**
* `PGADMIN_PORT` the default value is **5432**


## Test

```sh
npm install -g wscat
wscat -c 127.0.0.1:8080 -x '{"user_id":<USER-ID>, "type": "sell | buy", "amount": "<AMOUNT>", "symbol": "<SYMBOL-NAME>"}'
```