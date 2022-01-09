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
    "https://frosty-dawn-snowflake.solana-mainnet.quiknode.pro/380e75fde83d58ce13804c6ffc1692c56cae26bc/"
  );

  const shipMintKey = new PublicKey(shipMint);
  const shipInfo = await getScoreVarsShipInfo(
    solana,
    fleetProgramId,
    shipMintKey
  );

//   console.log(`Rewards per second: ${shipInfo.rewardRatePerSecond.toNumber() / (10 ** 8)}`);

  // Current capcity represents seconds until the resources is depleted
  // FIXME: WHY 1666666?!
  res.status(200).json({
    rewardRatePerSecond: shipInfo.rewardRatePerSecond.toNumber() / 1666666,
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
