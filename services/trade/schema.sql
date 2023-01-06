CREATE TABLE market (
    market_id BIGSERIAL,
    market_name TEXT,
    open_from TIME NOT NULL,
    open_until TIME NOT NULL
);

CREATE TABLE symbol (
    symbol_id BIGSERIAL,
    symbol_name TEXT,
    market_id BIGSERIAL
);