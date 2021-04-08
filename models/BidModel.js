const db = require("../db");
const { BadRequestError, ForbiddenError } = require("../expressError");



/** Related functions for the bids table. */

class Bid {

  static async addBid(productId, userEmail, newBid) {
    // add bid from the bids table.
    const addBidResult = await db.query(
      `INSERT INTO bids (product_id, user_email, bid_price)
      VALUES ($1, $2, $3)
      RETURNING product_id AS "productId", user_email AS "newBidderEmail", bid_price AS "bidPrice"`, [productId, userEmail, newBid]);
    if (!addBidResult) throw new BadRequestError(`product not added!`);
  }

  static async getRecentBids(numOfProducts) {
    // Grab all highest bid's product and bidder information
    // ordered by most recent. If numOfProducts has not been
    // passed in, request will grab all bids
    let query =
      `SELECT products.id,
              products.name,
              products.category,
              products.sub_category AS "subCategory",
              products.description,
              products.rating,
              products.image_url AS "imageUrl",
              products.auction_end_dt AS "auctionEndDt",
              products.auction_ended AS "auctionEnded",
              bids.bid_id AS "bidId",
              bids.bid_price AS "bidPrice",
              bids.bid_time AS "bidTime",
              bids.is_highest_bid AS "isHighestBid",
              bids.was_winning_bid AS "wasWinningBid",
              bids.user_email AS "bidderEmail",
              users.username,
              users.email
        FROM bids
        FULL OUTER JOIN products ON bids.product_id = products.id
        FULL OUTER JOIN users ON bids.user_email = users.email
        WHERE bids.is_highest_bid = true AND bids.was_winning_bid = false AND products.auction_ended = false
        ORDER BY bids.bid_time DESC`;

    // if number parameter passed in, add limit to query.
    // Otherwise return all bids
    if (numOfProducts) {
      query += ` LIMIT ${numOfProducts}`
    }

    const bidsRes = await db.query(query)

    if (!bidsRes) throw new BadRequestError(`Unable to getBids in bidModel.js`);

    return bidsRes.rows
  }

  static async setIsHighestBidToFalse(bidId) {
    // sets the is_highest_bid column to false for a certain product
    const updateBidRes = await db.query(
      `UPDATE bids
      SET is_highest_bid = false
      WHERE bid_id = $1`, 
      [bidId]);
    if (!updateBidRes) throw new BadRequestError(`product not added!`);
  }

  static async updateBidAsWinningBid(bidId) {
    // sets the was_winning_bid column to false for a certain product
    const updateBidRes = await db.query(
      `UPDATE bids
      SET was_winning_bid = true
      WHERE bid_id = $1`, 
      [bidId]);
    if (!updateBidRes) throw new BadRequestError(`product not added!`);
  }

  static async getBidCount(productId) {
    // Grab number of total bids a product has
    let query =
      `SELECT COUNT(*) 
      FROM bids
      WHERE product_id = $1`

    const bidsRes = await db.query(query,[productId])

    if (!bidsRes) throw new BadRequestError(`Unable to getBidCount in bidModel.js`);

    return bidsRes.rows[0].count
  }

}



module.exports = Bid;
