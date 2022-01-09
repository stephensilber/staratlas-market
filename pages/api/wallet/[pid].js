export default async function handler(req, res) {
  const { pid } = req.query;

  const tokens = req.query.tokens.split(",") || [];

  console.log(`TOKENS `, tokens);

  if (!pid || !tokens) {
    res.status(404).json({ message: "No wallet provided" });
  }

  const walletAddress = pid;

  const data = tokens.map((tokenAddress) => {
    return {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [
        walletAddress,
        {
          mint: tokenAddress,
        },
        {
          encoding: "jsonParsed",
        },
      ],
    };
  });

  const response = await fetch(`https://api.mainnet-beta.solana.com`, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await response.json();

  const formattedJSON = json.map((x) => {
    const accounts = x.result.value.map((y) => {
      return y.account.data.parsed.info;
    });

    if (accounts.length !== 1) {
      console.error(`Multiple accounts found for `, accounts);
      return {};
    }

    return accounts[0];
  });

  let mappedResponse = {};
  formattedJSON.forEach((x) => {
    mappedResponse[x.mint] = x;
  });

  res.status(200).json(mappedResponse);
}
