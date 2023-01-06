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