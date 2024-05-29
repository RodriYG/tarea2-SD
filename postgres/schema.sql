CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    Console VARCHAR(255),
    GameName VARCHAR(255),
    Review VARCHAR(255),
    Score DECIMAL,
    status VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS products(
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255),
    price DECIMAL,
    status VARCHAR(255)
);