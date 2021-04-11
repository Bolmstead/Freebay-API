/** Routes for authentication. */

const jsonschema = require("jsonschema");

const User = require("../models/UserModel");
const Notification = require("../models/NotificationModel");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");

/// WORKS!!!!!!!!!!!!!!!!!!
/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 */
router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);

    if (!validator.valid) {

      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const { email, password } = req.body;
    const user = await User.authenticate(email, password);

    // Determine if user is eligible for the daily reward
    const loggedInOnDifferentDay = await User.checkForLoginOnDifferentDay(user)

    if (loggedInOnDifferentDay) {
      // if User logs in on different day, increase their 
      // balance and send notification
      await User.increaseBalance(user.email, 100);
      await Notification.add(user.email,
        "Welcome back! Here's $100 freeBay bucks", "gift")
    }

    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});


/// WORKS!!!!!!!!!!!!!!!!!!
/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 */
router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.register({ ...req.body, });

    if (newUser) {
      Notification.add(newUser.email, 
        `Welcome! Here's $100 freeBay bucks!`,"gift")
    }

    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
