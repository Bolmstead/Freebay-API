"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    console.log("authenticatingJWT middleware")


    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      console.log("token from the authenticateJWT middleware function", token)

      res.locals.user = jwt.verify(token, SECRET_KEY);
      console.log("res.locals.user after the jwt.verify")
    }
    return next();
  } catch (err) {
    return next();
  }
}


module.exports = {
  authenticateJWT
};
