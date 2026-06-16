"use strict";

const express = require("express");
const Invoice = require("../models/InvoiceModel");
const Product = require("../models/ProductModel");
const Bid = require("../models/BidModel");
const ProductWon = require("../models/ProductWonModel");
const { BadRequestError, ForbiddenError, NotFoundError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const { checkForEndedAuctions } = require("../helpers/checkForEndedAuctions");
const { formatInvoice } = require("../helpers/modelFormatters");

const router = new express.Router();

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const { auctionId } = req.body;
    if (!auctionId) throw new BadRequestError("auctionId is required");

    let product = await Product.getProduct(auctionId);

    if (!product.auctionEnded) {
      await checkForEndedAuctions([product]);
      product = await Product.getProduct(auctionId);
    }

    if (!product.auctionEnded) {
      throw new BadRequestError("Auction has not ended yet");
    }

    if (!product.bidderEmail || !product.bidId) {
      throw new BadRequestError("Auction has no winning bid");
    }

    if (product.bidderEmail !== res.locals.user.email) {
      throw new ForbiddenError("Only the auction winner can create this invoice");
    }

    const invoice = await Invoice.createForAuction({
      auctionId: product.id,
      userId: product.bidderEmail,
      amountUSD: Number(product.bidPrice),
    });

    const productWon = await ProductWon.newWin(product.id, product.bidderEmail, product.bidPrice);
    await Bid.updateBidAsWinningBid(product.bidId);
    await ProductWon.attachInvoice(productWon._id, invoice._id);

    return res.status(201).json({ invoice: formatInvoice(invoice) });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    await Invoice.markExpiredInvoices();

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) throw new NotFoundError(`No invoice: ${req.params.id}`);

    if (invoice.userId !== res.locals.user.email) {
      throw new ForbiddenError("Only the invoice owner can view this invoice");
    }

    return res.json({ invoice: formatInvoice(invoice) });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
