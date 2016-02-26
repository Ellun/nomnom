DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS food_table;

CREATE TABLE users (
       id SERIAL UNIQUE PRIMARY KEY,
       email VARCHAR(255),
       password_digest TEXT
);

CREATE TABLE food_table (
      id SERIAL UNIQUE PRIMARY KEY,
      name VARCHAR(255),
      calories INT
)
