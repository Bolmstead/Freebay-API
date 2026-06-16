/** Routes for products. */

// const jsonschema = require("jsonschema");
const express = require("express");
const User = require("../models/UserModel");
const Product = require("../models/ProductModel");
const Notification = require("../models/NotificationModel");
const {checkForEndedAuctions} = require("../helpers/checkForEndedAuctions")
const Bid = require("../models/BidModel");
const {ensureLoggedIn} = require("../middleware/auth")
const { BadRequestError } = require("../expressError");


const router = new express.Router();

// Check all bids if a product has won. Called when a user accesses
// homepage to get most updated information. 
router.get("/check-all-bids-for-ended-auctions", async function (req, res, next) {
  try {
    
    const highestBids = await Bid.getRecentBids();
    const numberOfAuctionsEnded = await checkForEndedAuctions(highestBids)

    return res.json( `All bids check for ended auctions. ${numberOfAuctionsEnded} auctions have ended` );
  } catch (err) {
    return next(err);
  }

});


// called to grab product and bidder information 
// of products that have most recently been bidded on
router.get("/recent/:num", async function (req, res, next) {
  try {
    const numOfProducts = req.params.num;
    const highestBids = await Bid.getRecentBids(numOfProducts);

    return res.json( highestBids );
  } catch (err) {
    return next(err);
  }

});


// Route for submitting bid on product
router.post("/:productId/placeBid/:amount", ensureLoggedIn, async function (req, res, next) {
  try {
    // grab the user saved in local storage and pull information of that user from API
    const user = await User.get(res.locals.user.username)
    const productId = req.params.productId;
    const product = await Product.getProduct(productId)
    const newBidAmount = req.params.amount;
    const newBidInteger = Number(newBidAmount)

    if (!Number.isFinite(newBidInteger) || newBidInteger <= 0) {
      throw new BadRequestError(`Please submit a real bid`);
    }

    if (product.auctionEnded) {
      throw new BadRequestError(`This auction has ended`);
    }

    // If product already has a bid placed
    if (product.bidPrice) {

      // convert bid strings to integers
      const oldBidInteger = Number(product.bidPrice)

      // If the new bid is greater than the current bid
      if (newBidInteger > oldBidInteger) {
        // set the is_highest_bid column to false for the old Bid 
        await Bid.setIsHighestBidToFalse(product.bidId)

        // if previous bidder is different from the new bidder, 
        // send notification to previous bidder
        if( product.bidderEmail !== user.email) {
          Notification.add(product.bidderEmail, 
            `You have been outbid by ${user.username} for the ${product.name}`,
            "outbid", product.id )
        } 

      } else {
        throw new BadRequestError(
          `Your bid of ${newBidInteger} is not higher than the previous bid of 
          ${oldBidInteger}`);
      }
    } else {
        // If no bid placed and the new bid is less than the starting bid
        if (newBidInteger < Number(product.startingBid)) {
          throw new BadRequestError(
            `Your bid of ${newBidInteger} is not higher than the starting bid of 
            ${product.startingBid}`);
        }
    }

    // Add the highest bidder email and price to bids table
    await Bid.addBid(product.id, user.email, newBidInteger);
    // Send notification to the new bidder to confirm a bid has been placed
    await Notification.add(user.email, 
      `You have placed a bid on ${product.name}`, 
      "bid", product.id)

    return res.json({result: "success"});
  } catch (err) {
    return next(err);
  }

});



module.exports = router;
