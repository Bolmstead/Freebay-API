/** Routes for users. */
const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const User = require("../models/UserModel");
const Notification = require("../models/NotificationModel");

const router = express.Router();

// route called to grab user's information for profile page
router.get("/:username", async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json(user);
  } catch (err) {
    return next(err);
  }
});

// route called to set a user's notifications was_viewed column to true
router.post("/view_notifications/:username", async function (req, res, next) {
  try {

    await Notification.wasViewed(req.params.username);

    return res.json("success");
  } catch (err) {
    return next(err);
  }
});



module.exports = router;
