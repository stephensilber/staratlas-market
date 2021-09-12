import { Account, Connection, PublicKey } from "@solana/web3.js";
import { Market } from "@project-serum/serum";
import { nftForMarket } from "../../../nfts";

const PROGRAM_ADDRESS = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";

export default async function handler(req, res) {
  const { pid } = req.query;

  if (!pid) {
    res.status(404).json({ message: "Market not found" });
  }

  let connection = new Connection("https://api.mainnet-beta.solana.com");
  let marketAddress = new PublicKey(pid);
  let programAddress = new PublicKey(PROGRAM_ADDRESS);
  let market = await Market.load(connection, marketAddress, {}, programAddress);

  // Fetching orderbooks
  let bids = await market.loadBids(connection);
  let asks = await market.loadAsks(connection);

  let bidBook = [];
  for (let [price, size, a, b] of bids.getL2(20)) {
    bidBook.push({ price: price.toFixed(2), size });
  }
  let askBook = [];
  for (let [price, size] of asks.getL2(20)) {
    askBook.push({ price: price.toFixed(2), size });
  }

  const nft = nftForMarket(pid);

  res.status(200).json({ bids: bidBook, asks: askBook, nft });
}
