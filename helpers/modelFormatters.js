"use strict";

function toObject(doc) {
  if (!doc) return null;
  return typeof doc.toObject === "function" ? doc.toObject() : doc;
}

function idOf(docOrId) {
  if (!docOrId) return null;
  if (docOrId._id) return docOrId._id.toString();
  return docOrId.toString();
}

function formatInvoice(invoice) {
  const i = toObject(invoice);
  if (!i) return null;

  return {
    id: idOf(i),
    auctionId: i.auctionId,
    userId: i.userId,
    amountUSD: i.amountUSD,
    amountSOL: i.amountSOL,
    paymentAddress: i.paymentAddress,
    status: i.status,
    expiresAt: i.expiresAt,
    createdAt: i.createdAt,
    txSignature: i.txSignature || null,
  };
}

function formatProduct(product, bid, bidder, extras = {}) {
  const p = toObject(product);
  const b = toObject(bid);
  const u = toObject(bidder);

  if (!p) return null;

  return {
    id: idOf(p),
    name: p.name,
    category: p.category,
    subCategory: p.subCategory,
    description: p.description,
    rating: p.rating,
    numOfRatings: p.numOfRatings,
    imageUrl: p.imageUrl,
    startingBid: p.startingBid,
    auctionEndDt: p.auctionEndDt,
    auctionEnded: p.auctionEnded,
    bidderEmail: b ? b.userEmail : undefined,
    bidderFirstName: u ? u.firstName : undefined,
    bidderLastName: u ? u.lastName : undefined,
    bidderUsername: u ? u.username : undefined,
    bidPrice: b ? b.bidPrice : undefined,
    bidId: b ? idOf(b) : undefined,
    isHighestBid: b ? b.isHighestBid : undefined,
    wasWinningBid: b ? b.wasWinningBid : undefined,
    ...extras,
  };
}

function formatBidProduct(bid, product, bidder, extras = {}) {
  const b = toObject(bid);
  const p = toObject(product);
  const u = toObject(bidder);

  if (!b || !p) return null;

  return {
    id: idOf(p),
    name: p.name,
    category: p.category,
    subCategory: p.subCategory,
    description: p.description,
    rating: p.rating,
    numOfRatings: p.numOfRatings,
    imageUrl: p.imageUrl,
    startingBid: p.startingBid,
    auctionEndDt: p.auctionEndDt,
    auctionEnded: p.auctionEnded,
    bidId: idOf(b),
    bidPrice: b.bidPrice,
    bidTime: b.bidTime,
    isHighestBid: b.isHighestBid,
    wasWinningBid: b.wasWinningBid,
    bidderEmail: b.userEmail,
    username: u ? u.username : undefined,
    email: u ? u.email : b.userEmail,
    ...extras,
  };
}

function formatNotification(notification) {
  const n = toObject(notification);
  if (!n) return null;

  return {
    id: idOf(n),
    text: n.text,
    relatedProductId: n.relatedProductId,
    wasViewed: n.wasViewed,
    notificationTime: n.notificationTime,
    category: n.category,
  };
}

function formatProductWon(productWon, product, user, invoice) {
  const w = toObject(productWon);
  const p = toObject(product);
  const u = toObject(user);

  if (!w || !p) return null;

  return {
    id: idOf(p),
    productWonId: idOf(w),
    name: p.name,
    category: p.category,
    subCategory: p.subCategory,
    description: p.description,
    rating: p.rating,
    numOfRatings: p.numOfRatings,
    imageUrl: p.imageUrl,
    startingBid: p.startingBid,
    auctionEndDt: p.auctionEndDt,
    auctionEnded: p.auctionEnded,
    bidPrice: w.bidPrice,
    wonTime: w.wonTime,
    username: u ? u.username : undefined,
    email: u ? u.email : w.userEmail,
    userImageUrl: u ? u.imageUrl : undefined,
    invoice: formatInvoice(invoice || w.invoice),
  };
}

module.exports = {
  formatBidProduct,
  formatInvoice,
  formatNotification,
  formatProduct,
  formatProductWon,
  idOf,
};
