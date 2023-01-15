-- trade database
CREATE DATABASE trade;
\c trade
CREATE TABLE market (
    market_id serial PRIMARY KEY,
    market_name TEXT NOT NULL,
    open_from TIME NOT NULL,
    open_until TIME NOT NULL
);

CREATE TABLE symbol (
    symbol_id serial PRIMARY KEY,
    symbol_name TEXT NOT NULL,
    market_id BIGSERIAL NOT NULL,
    CONSTRAINT fk_market
      FOREIGN KEY(market_id)
	  REFERENCES market(market_id)
);

-- trade payment
CREATE DATABASE payment;
\c payment
CREATE TABLE client (
    client_id  TEXT PRIMARY KEY,
    balance    MONEY DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE asset (
    asset_id serial PRIMARY KEY,
    asset_name TEXT NOT NULL,
    client_id int NOT NULL,
    amount INTEGER NOT NULL
);

-- trade reporting
CREATE DATABASE reporting;
\c reporting
CREATE TABLE transaction (
    transaction_id serial PRIMARY KEY,
    transaction_type TEXT,
    transaction_time TIMESTAMP,
    transaction_result TEXT
);
-- User
ALTER USER postgres WITH PASSWORD '123456';

