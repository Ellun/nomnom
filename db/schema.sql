DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS food_table CASCADE;
DROP TABLE IF EXISTS user_info CASCADE;

CREATE TABLE users (
       id SERIAL UNIQUE PRIMARY KEY,
       email VARCHAR(255),
       password_digest TEXT
);

CREATE TABLE food_table (
      id SERIAL UNIQUE PRIMARY KEY,
      user_id INT REFERENCES users,
      name VARCHAR(255),
      brand_name VARCHAR(255),
      calories INT,
      serving_size INT
);

CREATE TABLE user_info (
      id SERIAL UNIQUE PRIMARY KEY,
      user_id INT REFERENCES users,
      sex INT,
      weight INT NOT NULL,
      gWeight INT NOT NULL,
      deadline INT NOT NULL,
      height INT NOT NULL,
      age INT NOT NULL,
      activity INT
);
