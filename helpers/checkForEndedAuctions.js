const Notification = require("../models/NotificationModel");
const Product = require("../models/ProductModel");
const Bid = require("../models/BidModel");
const ProductWon = require("../models/ProductWonModel");


async function checkForEndedAuctions(products) {
    let numberOfAuctionsEnded = 0

    const currentDateTime = new Date()

    for ( const p of products) {

        if (!p.auctionEnded) {
            // const endDt = new Date(p.auctionEndDt)
            const endDt = new Date(p.auctionEndDt)


            if ((endDt - currentDateTime) < 0){

                if (p.isHighestBid){
                    await ProductWon.newWin(p.id, p.bidderEmail, p.bidPrice)
                    await Bid.updateBidAsWinningBid(p.bidId)
                    await Notification.add(
                    p.bidderEmail, 
                    `Congratulations! You have won the auction for the ${p.name} `, 
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
