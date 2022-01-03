import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import web3, { PublicKey, Connection } from "@solana/web3.js";

import { getScoreVarsShipInfo } from "@staratlas/factory";

const fleetProgramId = new PublicKey(
  "FLEET1qqzpexyaDpqb2DGsSzE2sDCizewCg9WjrA6DBW"
);

export default async function handler(req, res) {
  const shipMint =
    req.query.pid || "DsJHgpnNovjJ981QJJnqMggexAekNawbSavfV1QuTpis";

  const solana = new Connection(
    "https://sparkling-dark-meadow.solana-mainnet.quiknode.pro/406b0a513cd4214db1dcd98394fa0746e1689d67/"
  );

  const shipMintKey = new PublicKey(shipMint);
  const shipInfo = await getScoreVarsShipInfo(
    solana,
    fleetProgramId,
    shipMintKey
  );

  // Current capcity represents seconds until the resources is depleted
  res.status(200).json({
    rewardRatePerSecond: shipInfo.rewardRatePerSecond.toNumber(),
    fuelMaxReserve: shipInfo.fuelMaxReserve,
    foodMaxReserve: shipInfo.foodMaxReserve,
    armsMaxReserve: shipInfo.armsMaxReserve,
    toolkitMaxReserve: shipInfo.toolkitMaxReserve,
    millisecondsToBurnOneFuel: shipInfo.millisecondsToBurnOneFuel,
    millisecondsToBurnOneFood: shipInfo.millisecondsToBurnOneFood,
    millisecondsToBurnOneArms: shipInfo.millisecondsToBurnOneArms,
    millisecondsToBurnOneToolkit: shipInfo.millisecondsToBurnOneToolkit,
  });
}
