const Notification = require("../models/NotificationModel");
const Product = require("../models/ProductModel");
const Bid = require("../models/BidModel");
const ProductWon = require("../models/ProductWonModel");
const Invoice = require("../models/InvoiceModel");


async function checkForEndedAuctions(products) {
    let numberOfAuctionsEnded = 0

    const currentDateTime = new Date()

    for ( const p of products) {

        if (!p.auctionEnded) {
            // const endDt = new Date(p.auctionEndDt)
            const endDt = new Date(p.auctionEndDt)


            if ((endDt - currentDateTime) < 0){

                if (p.isHighestBid){
                    const productWon = await ProductWon.newWin(p.id, p.bidderEmail, p.bidPrice)
                    await Bid.updateBidAsWinningBid(p.bidId)
                    try {
                        const invoice = await Invoice.createForAuction({
                        auctionId: p.id,
                        userId: p.bidderEmail,
                        amountUSD: Number(p.bidPrice),
                        })
                        await ProductWon.attachInvoice(productWon._id, invoice._id)
                    } catch (err) {
                        console.error("Unable to create invoice for ended auction:", err.message)
                    }
                    await Notification.add(
                    p.bidderEmail, 
                    `Congratulations! You won ${p.name}. Please pay the Solana invoice before it expires.`, 
                    `win`, 
                    p.id)
                    console.log("successful product won!!!!!!!!!")

                }
                await Product.endAuction(p.id)
                numberOfAuctionsEnded += 1
            } 
        }
    }
    return numberOfAuctionsEnded
}

module.exports = { checkForEndedAuctions };
