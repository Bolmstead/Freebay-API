/** Routes for users. */
const express = require("express");
const User = require("../models/UserModel");
const ProductWon = require("../models/ProductWonModel");
const Notification = require("../models/NotificationModel");

const router = express.Router();

// WORKS!!!!!!!!!!!!!!!!!!!!!!!
// route called to grab user's information for profile page
router.get("/:username", async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    const numberOfBidsWhichAuctionsEnded = await ProductWon.checkProductsForAuctionEnded(user.bids);
    // if the user won one of their bids, grab the most recent user info
    if (numberOfBidsWhichAuctionsEnded > 0) {
      user = await User.get(req.params.username);
    }
    return res.json(user);
  } catch (err) {
    return next(err);
  }
});



module.exports = router;
