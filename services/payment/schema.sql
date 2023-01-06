CREATE TABLE asset (
    asset_id BIGSERIAL,
    asset_name TEXT,
    user_id BIGSERIAL,
    amount INTEGER
);

CREATE TABLE user (
    user_id BIGSERIAL,
    fullname TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);