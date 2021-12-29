const API_KEY = "d0f9845c-5c5e-41df-9a7d-a00f2c406e19";
export default async function handler(req, res) {
  const symbol = req.query.symbol || "ATLAS";
  const response = await fetch("https://api.livecoinwatch.com/coins/single", {
    method: "POST",
    headers: new Headers({
      "content-type": "application/json",
      "x-api-key": API_KEY,
    }),
    body: JSON.stringify({
      currency: "USD",
      code: symbol,
      meta: true,
    }),
  });

  const json = await response.json();

  res.status(200).json(json);
}
