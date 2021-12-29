const SUPABASE_URL = "https://lkgwfudnziuoroixqhha.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDc5MDczMSwiZXhwIjoxOTU2MzY2NzMxfQ.kwzMV--nLAzjF8UfHYZyzruk2UkvLKfGZ3SdWQjh78Y";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  const json = await fetchNFTs();

  if (req.query.updateDatabase) {
    const supabaseJson = json.map((j) => {
      return {
        _id: j._id,
        createdAt: j.createdAt || null,
        updatedAt: j.updatedAt || null,
        name: j.name || null,
        deactivated: j.deactivated,
        description: j.description || null,
        image: j.image || null,
        symbol: j.symbol || null,
        slots: j.slots || null,
        media: j.media || null,
        mint: j.mint || null,
        markets: j.markets || null,
        attributes__itemType: j.attributes.itemType || null,
        attributes__tier: j.attributes.tier || null,
        attributes__class: j.attributes.class || null,
        attributes__category: j.attributes.category || null,
        attributes__score: j.attributes.score || null,
        attributes__rarity: j.attributes.rarity || null,
        attributes__make: j.attributes.make || null,
        attributes__model: j.attributes.model || null,
        attributes__spec: j.attributes.spec || null,
        collection__name: j.collection.name || null,
        collection__family: j.collection.family || null,
        airdrops: j.airdrops || null,
        tradeSettings: j.tradeSettings || null,
      };
    });

    const { data, error } = await supabase.from("nft").upsert(supabaseJson);

    if (error) {
      res.status(400).json({ error });
      return;
    }
  }

  res.status(200).json(json);
}

export async function fetchNFTs() {
  const response = await fetch("https://galaxy.staratlas.com/nfts", {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "sec-gpc": "1",
      Referer: "https://play.staratlas.com/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });

  const json = await response.json();

  return json;
}
