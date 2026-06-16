"use strict";

const https = require("https");
const { BadRequestError } = require("../expressError");

async function fetchSolUsdPrice() {
  const data = await new Promise((resolve, reject) => {
    https
      .get(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
        (response) => {
          let body = "";

          response.on("data", (chunk) => {
            body += chunk;
          });

          response.on("end", () => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
              reject(new BadRequestError("Unable to fetch SOL/USD price from CoinGecko"));
              return;
            }

            try {
              resolve(JSON.parse(body));
            } catch (err) {
              reject(new BadRequestError("Unable to parse SOL/USD price from CoinGecko"));
            }
          });
        }
      )
      .on("error", reject);
  });

  const price = data && data.solana && data.solana.usd;

  if (!price) throw new BadRequestError("CoinGecko did not return a SOL/USD price");
  return Number(price);
}

module.exports = { fetchSolUsdPrice };
