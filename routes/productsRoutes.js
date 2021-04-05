/** Routes for products. */

// const jsonschema = require("jsonschema");
const express = require("express");
const { authenticateJWT } = require("../middleware/auth");
const Product = require("../models/ProductModel");
const Bid = require("../models/BidModel");
const ProductWon = require("../models/ProductWonModel");



const router = new express.Router();

// route grabs all information of a group of products.
// search query can be passed to the route to specify which products to pull
router.get("/", async function (req, res, next) {
  try {
    const q = req.query;
    const allProducts = await Product.getProducts(q);

    //Current datetime to be used to determine if a products auction has ended
    const currentDateTime = Date.parse(new Date())

    // Variable to be used to determine the total number of queried
    // products still in auction. Will be used to assist frontend pagination
    let numberOfAuctionsEnded = 0

    // Check all queried products if their auction has ended.
    // If so, execute newWin method and add one to numberOfAuctionsEnded.
    for ( const p of allProducts) {
      const endDt = new Date(p.auctionEndDt)
      if ((currentDateTime - Date.parse(endDt)) > 0){
        if(p.bidderEmail) {
          ProductWon.newWin(p.id, p.bidderEmail, p.bidPrice)
          Notification.add(
            p.bidderEmail, 
            `Congratulations! Your bid has won for ${p.name} `, 
            `win`, 
            p.id)
        } 
        Product.endAuction(p.id)
        numberOfAuctionsEnded += 1
      } 
    }

    const paginatedProducts = await Product.getProducts(q, pagination = true)
    return  res.json({
      products: paginatedProducts,
      numOfProductsInAuction: (allProducts.length - numberOfAuctionsEnded)
    })
  } catch (err){
    return next(err)
  }

});

// WORKS!!!!!!!!!!!!!!!!!!!!!!!!!
// Grabs information about the product and bidder
router.get("/:id", async function (req, res, next) {
  try {
    const productResult = await Product.getProduct(req.params.id);
    const numOfBids = await Bid.getBidCount(req.params.id)

    if (productResult.bidId) {
      productResult["numOfBids"] = numOfBids
    }

    return res.json({ productResult});
  } catch (err) {
    return next(err);
  }

});






module.exports = router;
