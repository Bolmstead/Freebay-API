"use strict";

const { PublicKey } = require("@solana/web3.js");
const { mongoose } = require("../db");
const { BadRequestError } = require("../expressError");
const {
  MERCHANT_WALLET_ADDRESS,
} = require("../config");
const { fetchSolUsdPrice } = require("../helpers/solPrice");
const { formatInvoice } = require("../helpers/modelFormatters");

const invoiceSchema = new mongoose.Schema({
  auctionId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  amountUSD: { type: Number, required: true, min: 0 },
  amountSOL: { type: Number, required: true, min: 0 },
  paymentAddress: { type: String, required: true, index: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "expired"],
    default: "pending",
    index: true,
  },
  expiresAt: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  txSignature: { type: String, default: null, index: true },
});

invoiceSchema.statics.format = formatInvoice;

invoiceSchema.statics.markExpiredInvoices = async function () {
  await this.updateMany(
    { status: "pending", expiresAt: { $lte: new Date() } },
    { status: "expired" }
  );
};

invoiceSchema.statics.createForAuction = async function ({ auctionId, userId, amountUSD }) {
  if (!MERCHANT_WALLET_ADDRESS) {
    throw new BadRequestError("MERCHANT_WALLET_ADDRESS is not configured");
  }

  try {
    new PublicKey(MERCHANT_WALLET_ADDRESS);
  } catch (err) {
    throw new BadRequestError("MERCHANT_WALLET_ADDRESS is not a valid Solana address");
  }

  await this.markExpiredInvoices();

  const existingInvoice = await this.findOne({
    auctionId: auctionId.toString(),
    userId,
    status: { $in: ["pending", "confirmed"] },
  }).sort({ createdAt: -1 });

  if (existingInvoice) return existingInvoice;

  const solUsd = await fetchSolUsdPrice();
  const amountSOL = Math.ceil((Number(amountUSD) / solUsd) * 1_000_000_000) / 1_000_000_000;

  return this.create({
    auctionId: auctionId.toString(),
    userId,
    amountUSD: Number(amountUSD),
    amountSOL,
    paymentAddress: MERCHANT_WALLET_ADDRESS,
    status: "pending",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    txSignature: null,
  });
};

invoiceSchema.statics.matchPayment = async function (paymentAddress, receivedSOL, txSignature) {
  if (!txSignature || (await this.findOne({ txSignature }))) return null;

  await this.markExpiredInvoices();

  const invoice = await this.findOne({
    paymentAddress,
    status: "pending",
    expiresAt: { $gt: new Date() },
    amountSOL: { $lte: Number(receivedSOL) + 0.000000001 },
  }).sort({ createdAt: 1 });

  if (!invoice) return null;

  invoice.status = "confirmed";
  invoice.txSignature = txSignature;
  await invoice.save();

  try {
    const Notification = require("./NotificationModel");
    await Notification.add(
      invoice.userId,
      `Payment confirmed for auction ${invoice.auctionId}`,
      "payment",
      invoice.auctionId
    );
  } catch (err) {
    console.error("Unable to add payment notification:", err.message);
  }

  return invoice;
};

module.exports = mongoose.model("Invoice", invoiceSchema);
