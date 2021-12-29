import { nfts } from "../../nfts";

export default async function handler(req, res) {
  const collectionSymbol = req.query.symbol
  const query = {
    $match: {
      collectionSymbol: collectionSymbol,
    },
    $sort: {
      takerAmount: 1,
      createdAt: -1,
    },
    $skip: 0,
    $limit: 20,
  };
  const url = `https://api-mainnet.magiceden.io/rpc/getListedNFTsByQuery?q=${JSON.stringify(
    query
  )}`;
  const response = await fetch(url, {
    headers: {
      authority: "api-mainnet.magiceden.io",
      accept: "application/json, text/plain, */*",
      referer: "https://magiceden.io/",
      "accept-language": "en-US,en;q=0.9",
    },
  });
  const json = await response.json();
  res.status(200).json(json);
}
