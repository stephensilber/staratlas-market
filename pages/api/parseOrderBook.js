const cheerio = require("cheerio");

export default async function handler(req, res) {
  const id = req.query.id;
  const symbol = req.query.symbol;
  const url = `https://howrare.is/${symbol}/?wallet=&ids=${id}&attr_count=&background=&body=&earring=&ears=&expression=&glasses=&hat=&mouth=&shirt=&shoes=&wrist=&horns=&necklace=&wings=&special_name=&sort_by=rank&rank_from=&rank_to=`;

  try {
    const response = await fetch(url);
    const htmlString = await response.text();
    const $ = cheerio.load(htmlString);
    const textSelector = `body > div > div > div.col-md-10 > div.d-flex.flex-wrap.nft-listing > a > div > div`;
    const results = $(textSelector).text().split("\n").map(x => x.trim()).filter(x => x.length > 0);
    const parsedResults = {
      cow: results[0],
      rank: results[1].split(" ")[1],
      score: results[2].split(" ")[1]
    }

    res.statusCode = 200;
    return res.json(parsedResults);
  } catch (e) {
    res.statusCode = 404;
    console.log(e)
    return res.json({
      error: `Bid/Ask not found. Tip: Double check the market.`,
    });
  }

}
