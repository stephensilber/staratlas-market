import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import web3, { PublicKey, Connection } from "@solana/web3.js";

import { getAllFleetsForUserPublicKey } from "@staratlas/factory";

export default async function handler(req, res) {
  const walletKey = new PublicKey(
    req.query.wallet || "ESj7WidZkXDd2xEAp6zoEXakKZUmFTXxypqykwGm52w5"
  );

  const fleetProgramId = new PublicKey(
    "FLEET1qqzpexyaDpqb2DGsSzE2sDCizewCg9WjrA6DBW"
  );

  const solana = new Connection(
    "https://frosty-dawn-snowflake.solana-mainnet.quiknode.pro/380e75fde83d58ce13804c6ffc1692c56cae26bc/"
  );

  const fleets = await getAllFleetsForUserPublicKey(
    solana,
    walletKey,
    fleetProgramId
  );

  // // Current capcity represents seconds until the resources is depleted
  // // FIXME: WHY 1666666?!

  let map = {};

  fleets.forEach((shipInfo) => {
    map[shipInfo.shipMint.toString()] = {
      shipMint: shipInfo.shipMint.toString(),
      shipQuantityInEscrow: shipInfo.shipQuantityInEscrow.toNumber(),
      fuelQuantityInEscrow: shipInfo.fuelQuantityInEscrow.toNumber(),
      foodQuantityInEscrow: shipInfo.foodQuantityInEscrow.toNumber(),
      armsQuantityInEscrow: shipInfo.armsQuantityInEscrow.toNumber(),
      fuelCurrentCapacity: shipInfo.fuelCurrentCapacity.toNumber(),
      foodCurrentCapacity: shipInfo.foodCurrentCapacity.toNumber(),
      armsCurrentCapacity: shipInfo.armsCurrentCapacity.toNumber(),
      healthCurrentCapacity: shipInfo.healthCurrentCapacity.toNumber(),
      stakedAtTimestamp: shipInfo.stakedAtTimestamp.toNumber(),
      fueledAtTimestamp: shipInfo.fueledAtTimestamp.toNumber(),
      fedAtTimestamp: shipInfo.fedAtTimestamp.toNumber(),
      armedAtTimestamp: shipInfo.armedAtTimestamp.toNumber(),
      repairedAtTimestamp: shipInfo.repairedAtTimestamp.toNumber(),
      currentCapacityTimestamp: shipInfo.currentCapacityTimestamp.toNumber(),
      totalTimeStaked: shipInfo.totalTimeStaked.toNumber(),
      stakedTimePaid: shipInfo.stakedTimePaid.toNumber(),
      pendingRewards: shipInfo.pendingRewards.toNumber(),
      totalRewardsPaid: shipInfo.totalRewardsPaid.toNumber(),
    };
  });

  console.log(`Fetched ${Object.keys(map).length} fleet ships`, map)

  res.status(200).json(map);
}
