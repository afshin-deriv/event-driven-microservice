CREATE TABLE user (
    user_id serial PRIMARY KEY,
    fullname TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY(user_id)
);

CREATE TABLE asset (
    asset_id serial PRIMARY KEY,
    asset_name TEXT NOT NULL,
    user_id int NOT NULL,
    amount INTEGER NOT NULL,
    PRIMARY KEY(asset_id)
);