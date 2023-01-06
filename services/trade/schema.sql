CREATE TABLE market (
    market_id BIGSERIAL,
    market_name TEXT,
    open_from TIMESTAMP,
    open_until TIMESTAMP
);

CREATE TABLE symbol (
    symbol_id BIGSERIAL,
    symbol_name TEXT
);