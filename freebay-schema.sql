DROP TABLE IF EXISTS products, users, products_won, bids, notifications;

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(1000) NOT NULL,
  category VARCHAR(100) NOT NULL,
  sub_category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  condition VARCHAR(50) NOT NULL,
  rating DECIMAL NOT NULL CHECK (rating <= 5.0),
  num_of_ratings INTEGER NOT NULL,
  image_url VARCHAR(2083) NOT NULL,
  starting_bid DECIMAL NOT NULL,
  auction_end_dt TIMESTAMP NOT NULL,
  auction_ended BOOLEAN DEFAULT false
);

CREATE TABLE users (
  email varchar(50) PRIMARY KEY NOT NULL,
  username VARCHAR(30) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  balance DECIMAL NOT NULL,
  image_url VARCHAR(2083) NOT NULL,
  last_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products_won (
  product_id INTEGER NOT NULL
    REFERENCES products(id) ON DELETE CASCADE,
  user_email VARCHAR(50) NOT NULL
    REFERENCES users(email) ON DELETE CASCADE,
  bid_price DECIMAL NOT NULL,
  won_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bids (
  bid_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL
    REFERENCES products(id) ON DELETE CASCADE,
  user_email VARCHAR(50) NOT NULL
    REFERENCES users(email) ON DELETE CASCADE,
  bid_price DECIMAL NOT NULL,
  is_highest_bid BOOLEAN DEFAULT true,
  was_winning_bid BOOLEAN DEFAULT false,
  bid_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(50)
    REFERENCES users(email) ON DELETE CASCADE,
  text TEXT,
  related_product_id INTEGER,
  was_viewed BOOLEAN DEFAULT false,
  category VARCHAR(50),
  notification_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)