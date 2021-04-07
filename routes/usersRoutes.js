/** Routes for users. */
const express = require("express");
const User = require("../models/UserModel");
const {ensureLoggedIn} = require("../middleware/auth")
const {checkForEndedAuctions} = require("../helpers/checkForEndedAuctions.js");



const router = express.Router();

// route called to grab user's information
router.get("/:username", async function (req, res, next) {
  try {
    let user = await User.get(req.params.username);
    console.log("user in users/:username", user)
    let numberOfAuctionsEnded = await checkForEndedAuctions(user.bids)
    
    // if the user won any of their bids, grab the most recent user info
    if (numberOfAuctionsEnded > 0) {
      user = await User.get(req.params.username);
    }

  
    return res.json(user);
  } catch (err) {
    return next(err);
  }
});



module.exports = router;
