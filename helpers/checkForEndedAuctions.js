const Notification = require("../models/NotificationModel");
const Product = require("../models/ProductModel");
const Bid = require("../models/BidModel");
const ProductWon = require("../models/ProductWonModel");


async function checkForEndedAuctions(products) {
    let numberOfAuctionsEnded = 0

    const currentDateTime = new Date()

    for ( const p of products) {
        console.log("checking for ", p.name)

        if (!p.auctionEnded) {
            // const endDt = new Date(p.auctionEndDt)
            console.log("product's auction ended is false and is the highest bid!!!!!!")
            const endDt = new Date(p.auctionEndDt)
            console.log("endDt", endDt)
            console.log("currentDateTime", currentDateTime)
            console.log("currentDateTime - endDt", currentDateTime - endDt)


            if ((endDt - currentDateTime) < 0){
                console.log("endDt minus the currentDateTime is less than 0!!!!!!!!!!1")
                if (p.isHighestBid){
                    console.log("there is a bid")
                    console.log("p.id, p.bidderEmail, p.bidPrice",p.id, p.bidderEmail, p.bidPrice)
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
