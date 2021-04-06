/** Routes for products. */

// const jsonschema = require("jsonschema");
const express = require("express");
const { authenticateJWT } = require("../middleware/auth");
const User = require("../models/UserModel");
const Product = require("../models/ProductModel");
const ProductWon = require("../models/ProductWonModel");
const Notification = require("../models/NotificationModel");
const {checkForEndedAuctions} = require("../helpers/checkForEndedAuctions")
const Bid = require("../models/BidModel");

const router = new express.Router();

// Check all bids if a product has won. Called when a user accesses
// homepage to get most updated information. 
router.get("/check-all-bids-for-ended-auctions", async function (req, res, next) {
  try {
    
    const highestBids = await Bid.getHighestBids();
    console.log("highestBids",highestBids)
    const numberOfAuctionsEnded = await checkForEndedAuctions(highestBids)

    return res.json( `All bids check for ended auctions. ${numberOfAuctionsEnded} auctions have ended` );
  } catch (err) {
    return next(err);
  }

});


// WORKSSS!!!!!!!
// called to grab product and bidder information 
// of products that have most recently been bidded on
router.get("/recent/:num", async function (req, res, next) {
  try {
    const numOfProducts = req.params.num;
    const highestBids = await Bid.getHighestBids(numOfProducts);

    return res.json( highestBids );
  } catch (err) {
    return next(err);
  }

});

// CHECK ON FRONTEND TO SEE IF WORKS. RES.LOCALS.USER NOT PULLING USER
// NEED TO PUT IN MIDDLEWARE
// Route for submitting bid on product
router.post("/:productId/placeBid/:amount", async function (req, res, next) {
  try {
    // grab the user saved in local storage and pull information of that user from API
    console.log("res.locals",res.locals)
    const user = await User.get(res.locals.user.username)
    const productId = req.params.productId;
    const product = await Product.getProduct(productId)
    console.log("product in bids route", product)
    console.log("user in bids route", user)


    const newBidAmount = req.params.amount;
    const newBidInteger = parseInt(newBidAmount)

    if (newBidInteger > user.balance) {
      throw new ForbiddenError(`Insufficient funds`);
    }

    // If product already has a bid placed
    if (product.bidPrice) {

      // convert bid strings to integers
      const oldBidInteger = parseInt(product.bidPrice)

      // If the new bid is greater than the current bid
      if (newBidInteger > oldBidInteger) {
        // set the is_highest_bid column to false for the old Bid 
        Bid.setIsHighestBidToFalse(product.bidId)

        // if previous bidder is different from the new bidder, 
        // send notification to previous bidder
        if( product.bidderEmail !== user.email) {
          Notification.add(product.bidderEmail, 
            `You have been outbid by ${user.username} for the ${product.name}`,
            "outbid", product.id )
        } 

        // Refill previous bidder's balance by previous bid amount
        await User.increaseBalance(product.bidderEmail, oldBidInteger)

      } else {
        throw new BadRequestError(
          `Your bid of ${newBid} is not higher than the previous bid of 
          ${bidPrice}`);
      }
    } else {
        // If no bid placed and the new bid is less than the starting bid
        if (newBidInteger < parseInt(product.startingBid)) {
          throw new BadRequestError(
            `Your bid of ${newBid} is not higher than the starting bid of 
            ${product.startingBid}`);
        }
    }

    // Add the highest bidder email and price to bids table
    await Bid.addBid(product.id, user.email, newBidInteger);
    // decrease user's balance by the bid amount 
    await User.decreaseBalance(user.email, newBidInteger)
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
