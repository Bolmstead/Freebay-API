/** Routes for users. */
const express = require("express");
const User = require("../models/UserModel");
const ProductWon = require("../models/ProductWonModel");
const Notification = require("../models/NotificationModel");
const Product = require("../models/ProductModel");


const router = express.Router();

// route called to grab user's information for profile page
router.get("/:username", async function (req, res, next) {
  try {
    let user = await User.get(req.params.username);

    const currentDateTime = Date.parse(new Date())
    let numberOfUserBidsWon = 0

    for ( const p of user.bids) {
      const endDt = new Date(p.auctionEndDt)
      if ((currentDateTime - Date.parse(endDt)) > 0){
        ProductWon.newWin(p.id, p.bidderEmail, p.bidPrice)
        Notification.add(
          p.bidderEmail, 
          `Congratulations! Your bid has won for ${p.name} `, 
          `win`, 
          p.id)
        Product.endAuction(p.id)
        numberOfUserBidsWon += 1
        } 
    } 
    
    // if the user won any of their bids, grab the most recent user info
    if (numberOfUserBidsWon > 0) {
      user = await User.get(req.params.username);
    }

    return res.json(user);
  } catch (err) {
    return next(err);
  }
});



module.exports = router;
