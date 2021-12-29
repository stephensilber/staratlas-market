export default async function handler(req, res) {
  const { pid } = req.query;

  if (!pid) {
    res.status(404).json({ message: "No wallet provided" });
  }

  console.log(`pid`, pid);

  const response = await fetch(`https://galaxy.staratlas.com/players/${pid}`, {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "if-none-match": 'W/"410-6m/UKtgwIffrJv83Zo4c37/XpVM"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "sec-gpc": "1",
      Referer: "https://play.staratlas.com/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: null,
    method: "GET",
  });

  console.log(`response`, response);

  const json = await response.json();

  res.status(200).json(json);
}
