"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { NotFoundError, BadRequestError, UnauthorizedError} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {

  // authenticate user with username, password. Method is called when user logs in
  static async authenticate(email, password) {
    // find the user first
    const result = await db.query(
      `SELECT email,
              username,
              password,
              first_name AS "firstName",
              last_name AS "lastName",
              image_url AS "imageUrl",
              balance,
              last_login AS "lastLogin"
       FROM users
       WHERE email = $1`,
    [email],
    );
    const user = result.rows[0];
    
    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid email/password");
  }

  // Check if user logged in on a different day. Returns True if so
  static async checkForLoginOnDifferentDay(user) {
    // Grab the last login datetime object
    let lastLogin = user.lastLogin
    // Update a users last login with current datetime.
    let updateLastLoginResult = await db.query(
        `UPDATE users 
        SET last_login = CURRENT_TIMESTAMP
        WHERE email = $1
        RETURNING last_login AS "lastLogin"`,[user.email]
    );

    if (!updateLastLoginResult) throw new BadRequestError(`Unable to update the last login for user: ${user.email}`);
    
    let newLogin = updateLastLoginResult.rows[0].lastLogin
    // Function returns false if the previous login datetime 
    // is on a different day than the new login datetime. 
    // If logins are on same day, returns true.
    const lastLoginSameDayAsNewLogin = Boolean(
      lastLogin.getFullYear() === newLogin.getFullYear() && 
      lastLogin.getMonth() === newLogin.getMonth() &&
      lastLogin.getDate() === newLogin.getDate()
    )

    const loggedInOnDifferentDay = !lastLoginSameDayAsNewLogin

    return loggedInOnDifferentDay
  }

  // Register user with data. Throws BadRequestError on duplicates.
  static async register({ email, username, password, firstName, lastName, imageUrl }) {
    const duplicateCheck = await db.query(
          `SELECT email
           FROM users
           WHERE email = $1`,
        [email],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    // Let user start off with $100 in freeBay bucks
    let balance = 100

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    // Insert new user with hashed password
    const result = await db.query(
          `INSERT INTO users
           (email, username, password, first_name, last_name, image_url, balance)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING email, username, password, first_name AS firstName, last_name AS lastName, image_url AS imageUrl, balance`,
        [
          email,
          username,
          hashedPassword,
          firstName,
          lastName,
          imageUrl,
          balance
        ],
    );

    if (!result) {
      throw new BadRequestError(`Unable to insert into users`);
    }

    const user = result.rows[0];
    return user;
  }


  /** Given a username, return data about user.
   *  Throws NotFoundError if user not found.
   **/
  static async get(username) {
    const userRes = await db.query(
          `SELECT email,
                  username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  image_url AS "imageUrl",
                  balance
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = userRes.rows[0];

    if (!user) {
      throw new NotFoundError(`No user: ${username}`)
    }
    else {
      // Grab all users highest bids ordered by most recent and add to user object
      const bidsResult = await User.getUsersBids(user.email)
      user.bids = bidsResult;

      // Grab all products a user has won ordered by most recent and add to user object
      const productsWon = await User.getUsersProductsWon(user.email)
      user.productsWon = productsWon;

      // Grab all user's notifications ordered by most recent and add to user object
      const notifications = await User.getUsersNotifications(user.email)
      user.notifications = notifications;
      return user
    }
  }


  // Grabs the user's highest bids and checks if auction has ended for each product.
  // If auction ended, regrabs the user's updated highest bids.
  static async getUsersBids(email) {
    const query =        
         `SELECT products.id,
              products.name,
              products.category,
              products.sub_category AS "subCategory",
              products.description,
              products.rating,
              products.num_of_ratings AS "numOfRatings",
              products.image_url AS "imageUrl",
              products.starting_bid AS "startingBid",
              products.auction_end_dt AS "auctionEndDt",
              products.auction_ended AS "auctionEnded",
              bids.bid_id AS "bidId",
              bids.is_highest_bid AS "isHighestBid",
              bids.bid_price AS "bidPrice",
              bids.bid_time AS "bidTime",
              bids.was_winning_bid AS "wasWinningBid"
          FROM bids
          FULL OUTER JOIN products ON bids.product_id = products.id
          WHERE bids.user_email = $1
          ORDER BY bids.bid_time DESC`
    const bidsRes = await db.query(query, [email]);
  
    return bidsRes.rows
  }

  // Grabs all of a user's products won ordered by most recent
  static async getUsersProductsWon(email) {
    const productsWonRes = await db.query(
          `SELECT products.id,
                  products.name,
                  products.category,
                  products.sub_category AS "subCategory",
                  products.description,
                  products.rating,
                  products.num_of_ratings AS "numOfRatings",
                  products.image_url AS "imageUrl",
                  products.starting_bid AS "startingBid",
                  products.auction_end_dt AS "auctionEndDt",
                  products.auction_ended AS "auctionEnded",
                  products_won.bid_price AS "bidPrice",
                  products_won.won_time AS "wonTime"
          FROM products_won
          FULL OUTER JOIN products ON products_won.product_id = products.id
          WHERE products_won.user_email = $1
          ORDER BY products_won.won_time DESC`, [email]);
          
    return productsWonRes.rows;
  }

  // Grabs all of a user's notifications ordered by most recent
  static async getUsersNotifications(email) {
      const notificationsRes = await db.query(
        `SELECT notifications.id,
                notifications.text,
                notifications.related_product_id AS "relatedProductId",
                notifications.was_viewed AS "wasViewed",
                notifications.notification_time AS "notificationTime",
                notifications.category AS "category"
          FROM notifications
          WHERE notifications.user_email = $1
          ORDER BY notifications.notification_time DESC`, [email]);

      return notificationsRes.rows
  }


  // Decrease a user's freeBay bucks balance by parameter amount
  static async decreaseBalance(email, amount) {
    const result = await db.query(`UPDATE users 
                      SET balance = balance - $1
                      WHERE email = $2`,[amount, email]);
    if (!result) throw new BadRequestError(
      `Balance not lowered by ${amount} for user:  ${email}`
    );
  }

  // Increase a user's freeBay bucks balance by parameter amount
  static async increaseBalance(email, amount) {
    const result = await db.query(`UPDATE users 
                      SET balance = balance + $1
                      WHERE email = $2`,[amount, email]);
    if (!result) throw new BadRequestError(
      `Balance not increased by ${amount} for user:  ${email}`
    );

    return result;
  }

}


module.exports = User;
