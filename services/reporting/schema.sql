CREATE TABLE transaction (
    transaction_id serial PRIMARY KEY
    transaction_type TEXT,
    transaction_time TIMESTAMP,
    transaction_result TEXT,
    PRIMARY KEY(transaction_id)
);
