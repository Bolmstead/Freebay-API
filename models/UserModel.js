"use strict";

const bcrypt = require("bcrypt");
const { mongoose } = require("../db");
const { BadRequestError, NotFoundError, UnauthorizedError } = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const {
  formatBidProduct,
  formatNotification,
  formatProductWon,
} = require("../helpers/modelFormatters");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  balance: { type: Number, default: 100 },
  imageUrl: { type: String, default: "" },
  lastLogin: { type: Date, default: Date.now },
});

userSchema.statics.authenticate = async function (email, password) {
  const user = await this.findOne({ email });

  if (user) {
    const isValid = await bcrypt.compare(password, user.password);
    if (isValid === true) {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    }
  }

  throw new UnauthorizedError("Invalid email/password");
};

userSchema.statics.checkForLoginOnDifferentDay = async function (user) {
  const lastLogin = new Date(user.lastLogin);
  const updatedUser = await this.findOneAndUpdate(
    { email: user.email },
    { lastLogin: new Date() },
    { new: true }
  );

  if (!updatedUser) throw new BadRequestError(`Unable to update last login for ${user.email}`);

  const newLogin = updatedUser.lastLogin;
  const lastLoginSameDayAsNewLogin = Boolean(
    lastLogin.getFullYear() === newLogin.getFullYear() &&
      lastLogin.getMonth() === newLogin.getMonth() &&
      lastLogin.getDate() === newLogin.getDate()
  );

  return !lastLoginSameDayAsNewLogin;
};

userSchema.statics.register = async function ({
  email,
  username,
  password,
  firstName,
  lastName,
  imageUrl,
}) {
  const duplicateEmail = await this.findOne({ email });
  if (duplicateEmail) throw new BadRequestError(`Duplicate email: ${email}`);

  const duplicateUsername = await this.findOne({ username });
  if (duplicateUsername) throw new BadRequestError(`Duplicate username: ${username}`);

  const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
  const user = await this.create({
    email,
    username,
    password: hashedPassword,
    firstName,
    lastName,
    imageUrl,
    balance: 100,
  });

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

userSchema.statics.get = async function (username) {
  const user = await this.findOne({ username });
  if (!user) throw new NotFoundError(`No user: ${username}`);

  const userObj = {
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    balance: user.balance,
  };

  userObj.bids = await this.getUsersBids(user.email);
  userObj.productsWon = await this.getUsersProductsWon(user.email);
  userObj.notifications = await this.getUsersNotifications(user.email);

  return userObj;
};

userSchema.statics.getUsersBids = async function (email) {
  const Bid = require("./BidModel");

  const bids = await Bid.find({ userEmail: email })
    .sort({ bidTime: -1 })
    .populate("product");

  return bids
    .filter((bid) => bid.product)
    .map((bid) => formatBidProduct(bid, bid.product, null));
};

userSchema.statics.getUsersProductsWon = async function (email) {
  const ProductWon = require("./ProductWonModel");

  const productsWon = await ProductWon.find({ userEmail: email })
    .sort({ wonTime: -1 })
    .populate("product")
    .populate("invoice");

  return productsWon
    .filter((win) => win.product)
    .map((win) => formatProductWon(win, win.product, null, win.invoice));
};

userSchema.statics.getUsersNotifications = async function (email) {
  const Notification = require("./NotificationModel");
  const notifications = await Notification.find({ userEmail: email }).sort({
    notificationTime: -1,
  });

  return notifications.map(formatNotification);
};

userSchema.statics.decreaseBalance = async function (email, amount) {
  return this.findOneAndUpdate({ email }, { $inc: { balance: -Number(amount) } }, { new: true });
};

userSchema.statics.increaseBalance = async function (email, amount) {
  return this.findOneAndUpdate({ email }, { $inc: { balance: Number(amount) } }, { new: true });
};

module.exports = mongoose.model("User", userSchema);
