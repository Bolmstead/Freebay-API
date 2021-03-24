const db = require("../db");
const { BadRequestError, ForbiddenError } = require("../expressError");
const User = require("./UserModel");
const Notification = require("./NotificationModel");


/** Related functions for the highest bids. */

class HighestBids {

  // Method to execute when a user submits a product bid. 
  static async updateBid(product, user, newBid ) {
    const {bidderEmail, currentBid } = product

    // Shorten product name for better display
    const productName = product.name.substring(0, 50) + "..."

    // If product already has a bid placed
    if (currentBid) {

      // convert bid strings to integers
      const currentBidInteger = parseInt(currentBid)
      const newBidInteger = parseInt(newBid)

      if (newBidInteger > user.balance) {
        throw new ForbiddenError(`Insufficient funds`);
      }

      // If the new bid is greater than the current bid
      if (newBidInteger > currentBidInteger) {

        // Remove the previous bid
        HighestBids.deleteBid(product.id)

        // If previous bidder is not the same as the new bidder, send notification to previous bidder
        if( bidderEmail !== user.email) {
          Notification.addNotification(bidderEmail, `You have been outbid by ${user.username} for the ${productName}`, "outbid", product.id )
        } 

        // Refill previous bidder's balance by previous bid amount
        await User.increaseBalance(currentBidInteger, bidderEmail)

      } else {
        throw new BadRequestError(`Your bid of ${newBid} is not higher than the previous bid of ${currentBid}`);
      }
    }

    // Add the highest bidder email and price to highest_bids table
    HighestBids.addBid(product.id, user.email, newBid);
    // Add 1 to the product's bid count
    HighestBids.addToBidCount(product.id);
    // Reduce the new bidder's balance by the bid amount
    User.decreaseBalance(newBid, user.email);
    // Send notification to the new bidder to confirm a bid has been placed
    Notification.addNotification(user.email, `You have placed a bid on ${productName}`, "bid", product.id)
  }

  static async deleteBid(id) {
    // remove bid from the highest_bids table
    const result = await db.query(
      `DELETE FROM highest_bids
      WHERE product_id = $1`,
      [id]);
    if (!result) throw new BadRequestError(`product not deleted!`);
  }

  static async addBid(productId, userEmail, newBid) {
    // add bid from the highest_bids table
    console.log("productId, userEmail, newBid", productId, userEmail, newBid)
    const addHighestBidder = await db.query(
      `INSERT INTO highest_bids (product_id, user_email, bid_price)
      VALUES ($1, $2, $3)
      RETURNING product_id AS "productId", user_email AS "newBidderEmail", bid_price AS "bidPrice"`, [productId, userEmail, newBid]);
    if (!addHighestBidder) throw new BadRequestError(`product not added!`);
  }

  static async addToBidCount(productId) {
  // Increase product's bid count by one in products table
    const result = await db.query(`UPDATE products 
                      SET bid_count = (bid_count + 1)
                      WHERE id = $1`,[productId]);
    if (!result) throw new BadRequestError(
          `Bid not added to count: ${productId}`);
    return result;
  }

  static async getBidsFeed() {
    // Grab information on products with the most recent bids if the product's auction has not ended
    const bidsFeedRes = await db.query(
      `SELECT products.id,
              products.name,
              products.category,
              products.sub_category AS "subCategory",
              products.description,
              products.condition,
              products.rating,
              products.image_url AS "imageUrl",
              products.auction_end_dt AS "auctionEndDt",
              products.bid_count AS "bidCount",
              products.auction_ended AS "auctionEnded",
              highest_bids.bid_price AS "bidPrice",
              highest_bids.datetime,
              users.username,
              users.email
        FROM highest_bids
        FULL OUTER JOIN products ON highest_bids.product_id = products.id
        FULL OUTER JOIN users ON highest_bids.user_email = users.email
        WHERE products.auction_ended = false AND bid_price > 1
        ORDER BY highest_bids.datetime DESC
        LIMIT 4`);

    if (!bidsFeedRes) throw new BadRequestError(`Undable to getHighestBids in userModel.js`);

    return bidsFeedRes.rows
  }
}



module.exports = HighestBids;
