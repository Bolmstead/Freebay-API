"use strict";

const { mongoose } = require("../db");

const notificationSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  text: { type: String, required: true },
  relatedProductId: { type: String },
  wasViewed: { type: Boolean, default: false },
  category: { type: String },
  notificationTime: { type: Date, default: Date.now, index: true },
});

notificationSchema.statics.wasViewed = async function (email) {
  await this.updateMany({ userEmail: email }, { wasViewed: true });
};

notificationSchema.statics.add = async function (userEmail, text, category, relatedProductId) {
  return this.create({
    userEmail,
    text,
    category,
    relatedProductId: relatedProductId ? relatedProductId.toString() : undefined,
  });
};

module.exports = mongoose.model("Notification", notificationSchema);
