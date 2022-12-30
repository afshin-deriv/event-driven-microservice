# Case study: Event-driven architecture

A simple event-driven microservice trading system written in Node.js

- Trade microservice: handles buy and sell transactions and publishes respective events
- Payment microservice: manages the funds (deposits and withdrawals) for the users and published respective events
- Reporting microservice: listens to the events from both Trade and Payment services and shows statistics. 

## Requirements:
* docker >= 17.12.0+
* docker-compose

## Quick Start
* Clone or download this repository
* Go inside of directory,  `cd Case-study-Event-driven-architecture`
* Run this command `docker-compose up -d`
