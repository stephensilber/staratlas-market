import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import web3, { PublicKey, Connection } from "@solana/web3.js";

import { getAllRegisteredShips } from "@staratlas/factory";

export default async function handler(req, res) {
  const fleetProgramId = new PublicKey(
    "FLEET1qqzpexyaDpqb2DGsSzE2sDCizewCg9WjrA6DBW"
  );

  const solana = new Connection(
    "https://frosty-dawn-snowflake.solana-mainnet.quiknode.pro/380e75fde83d58ce13804c6ffc1692c56cae26bc/"
  );

  const ships = await getAllRegisteredShips(solana, fleetProgramId);

  let map = {};

  ships.forEach((shipInfo) => {
    map[shipInfo.shipMint.toString()] = {
      rewardRatePerSecond: shipInfo.rewardRatePerSecond.toNumber() / 1666666,
      fuelMaxReserve: shipInfo.fuelMaxReserve,
      foodMaxReserve: shipInfo.foodMaxReserve,
      armsMaxReserve: shipInfo.armsMaxReserve,
      toolkitMaxReserve: shipInfo.toolkitMaxReserve,
      millisecondsToBurnOneFuel: shipInfo.millisecondsToBurnOneFuel,
      millisecondsToBurnOneFood: shipInfo.millisecondsToBurnOneFood,
      millisecondsToBurnOneArms: shipInfo.millisecondsToBurnOneArms,
      millisecondsToBurnOneToolkit: shipInfo.millisecondsToBurnOneToolkit,
    };
  });

  console.log(`Fetched ${Object.keys(map).length} registered ships`);

  res.status(200).json(map);
}
