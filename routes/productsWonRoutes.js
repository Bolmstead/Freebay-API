/** Routes for products. */

// const jsonschema = require("jsonschema");
const express = require("express");
const ProductWon = require("../models/ProductWonModel");
const Bid = require("../models/BidModel");
const Product = require("../models/ProductModel");

const Notification = require("../models/NotificationModel");

const router = new express.Router();

// WORKS!!!!!!!!!!!!!!!!!!!!!!!
// grabs product and bidder information of the products 
// that have most recently been won
router.get("/recent/:numOfProducts", async function (req, res, next) {
  try {
    const numOfProducts = req.params.numOfProducts
    // Grab all bids and check if any auctions have ended
    const bids = await Bid.getHighestBids()
    console.log("bids",bids)

    const currentDateTime = Date.parse(new Date())

    for ( const p of bids) {
      const endDt = new Date(p.auctionEndDt)
      if ((currentDateTime - Date.parse(endDt)) > 0){
          ProductWon.newWin(p.id, p.bidderEmail, p.bidPrice)
          Notification.add(
            p.bidderEmail, 
            `Congratulations! You have won the auction for the ${p.name} `, 
            `win`, 
            p.id)
        Product.endAuction(p.id)
      } 
    }

    // Grab the updated most recent winners
    const recentWinners = await ProductWon.getRecentWins(numOfProducts);

    return res.json( recentWinners );
  } catch (err) {
    return next(err);
  }

});



module.exports = router;
