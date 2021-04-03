/** Routes for products. */

// const jsonschema = require("jsonschema");
const express = require("express");
const { authenticateJWT } = require("../middleware/auth");
const User = require("../models/UserModel");
const Product = require("../models/ProductModel");
const ProductWon = require("../models/ProductWonModel");
const Bid = require("../models/BidModel");
const SeedProducts = require("../FreebaySeed");

const router = new express.Router();


// called to grab product and bidder information 
// of products that have most recently been bidded on
router.get("/recent/:numOfProducts", async function (req, res, next) {
  try {
    const numOfProducts = req.params.numOfProducts;
    const products = await Bid.getBids(numOfProducts);
    return res.json( products );
  } catch (err) {
    return next(err);
  }

});

// NEED TO PUT IN MIDDLEWARE
// Route for submitting bid on product
router.post("/:productId/placeBid/:amount", async function (req, res, next) {
  try {
    // grab the user saved in local storage and pull information of that user from API
    console.log("res.locals",res.locals)
    const user = await User.get(res.locals.user.username)
    const newBidAmount = req.params.amount;
    const productId = req.params.productId;
    const product = await Product.getProduct(productId);

    // If product already has a bid placed
    if (product.bidPrice) {

      // convert bid strings to integers
      const oldBidInteger = parseInt(product.bidPrice)
      const newBidInteger = parseInt(newBidAmount)

      if (newBidInteger > user.balance) {
        throw new ForbiddenError(`Insufficient funds`);
      }

      // If the new bid is greater than the current bid
      if (newBidInteger > oldBidInteger) {
        // set the is_highest_bid column to false for the old Bid 
        Bid.setIsHighestBidToFalse(product.bidId)

        // if previous bidder is different from the new bidder, 
        // send notification to previous bidder
        if( bidderEmail !== user.email) {
          Notification.add(bidderEmail, 
            `You have been outbid by ${user.username} for the ${product.name}`,
            "outbid", product.id )
        } 

        // Refill previous bidder's balance by previous bid amount
        await User.increaseBalance(oldBidInteger, bidderEmail)

      } else {
        throw new BadRequestError(
          `Your bid of ${newBid} is not higher than the previous bid of 
          ${bidPrice}`);
      }
    }
    // Add the highest bidder email and price to bids table
    Bid.addBid(product.id, user.email, newBid);
    // decrease user's balance by the bid amount 
    User.decreaseBalance(user.email, newBidInteger)
    // Send notification to the new bidder to confirm a bid has been placed
    Notification.add(user.email, 
      `You have placed a bid on ${product.name}`, 
      "bid", product.id)

    return res.json({result: "success"});
  } catch (err) {
    return next(err);
  }

});



module.exports = router;
