<img src="documents/images/Event_Driven.png" width="639" height="510">
      
*Comic by* [*Forrest Brazeal*](https://www.goodtechthings.com/event-driven/)

# Event-Driven Microservices Backend Case study

Proof of Concept for a scalable simple trading Application, based on simplified event-driven microservices architecture and Docker containers. :whale:

[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)

[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)


- Trade service: handles buy and sell transactions and publishes respective events
- Payment service: manages the funds (deposits and withdrawals) for the users and published respective events
- Reporting service: listens to the events from both Trade and Payment services and shows statistics.

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


## How-To

```sh
$ npm install -g wscat
$ wscat -c 127.0.0.1:3000

{"user_id":<USER-ID>, "type": "SELL | BUY", "amount": "<AMOUNT>", "symbol": "<SYMBOL-NAME>"}
```
### Payment Service
Read request from **payment** stream channel, and response in **payment-response** channel

#### Create user
```yaml
request
{
  "id": "message identifier",
  "type": "ADD_USER"
}

response
{
  "id": "request message identifier",
  "status": "OK/ERROR",
  "user_id": "New user identifier",
  "message": "descriptive message",
}
```
#### Remove user
```yaml
request
{
  "id": "message identifier",
  "type": "REMOVE_USER",
  "user_id": "user identifier"
}

response
{
  "id": "request message identifier",
  "status": "OK/ERROR",
  "user_id": "deleted user identifier",
  "message": "descriptive message",
}
```

#### Deposit
```yaml
request
{
  "id": "message identifier",
  "type": "DEPOSIT",
  "user_id": "user identifier",
  "amount": "amount to add to user account"
}

response
{
  "id": "request message identifier",
  "status": "OK/ERROR",
  "message": "descriptive message",
}
```

#### Withdraw
```yaml
request
{
  "id": "message identifier",
  "type": "WITHDRAW",
  "user_id": "user identifier",
  "amount": "amount to remove from user account"
}

response
{
  "id": "request message identifier",
  "status": "OK/ERROR",
  "message": "descriptive message"
}
```
#### User info
```yaml
request
{
  "id": "message identifier",
  "type": "USER_INFO",
  "user_id": "user identifier"
}

response
{
  "id": "request message identifier",
  "status": "OK/ERROR",
  "user_id": "user identifier",
  "amount": "Amount in user account",
  "message": "descriptive message"
}
```
### Trade Service
Read request from **api** stream channel, and response in **api-response** channel

#### Purchase
```yaml
request
{
  "id": "message identifier",
  "type": "BUY",
  "user_id": "user identifier",
  "symbol": "Asset symbol",
  "price": "price to buy",
  "amount": "amount to buy"
}

response
{
  "id": "request message identifier",
  "status": "OK/ERROR",
  "message": "descriptive message"
}
```

#### Sell
```yaml
request
{
  "id": "message identifier",
  "type": "SELL",
  "user_id": "user identifier",
  "symbol": "Asset symbol",
  "price": "price to sell",
  "amount": "amount to sell"
}

response
{
  "id": "request message identifier",
  "status": "OK/ERROR",
  "message": "descriptive message"
}
```
