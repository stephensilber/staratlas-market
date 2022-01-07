import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import web3, { PublicKey, Connection } from "@solana/web3.js";

import {
  getShipStakingAccount,
  getShipStakingAccountInfo,
} from "@staratlas/factory";

const factionProgramId = new PublicKey(
  "FACTNmq2FhA2QNTnGM2aWJH3i7zT3cND5CgvjYTjyVYe"
);

const fleetProgramId = new PublicKey(
  "FLEET1qqzpexyaDpqb2DGsSzE2sDCizewCg9WjrA6DBW"
);

export default async function handler(req, res) {
  const walletAddress =
    req.query.walletAddress || "ESj7WidZkXDd2xEAp6zoEXakKZUmFTXxypqykwGm52w5";
  const shipMint =
    req.query.pid || "DsJHgpnNovjJ981QJJnqMggexAekNawbSavfV1QuTpis";

  const solana = new Connection(
    "https://frosty-dawn-snowflake.solana-mainnet.quiknode.pro/380e75fde83d58ce13804c6ffc1692c56cae26bc/"
  );

  const walletKey = new PublicKey(walletAddress);
  const shipMintKey = new PublicKey(shipMint);
  // const account = await getShipStakingAccount(
  //   fleetProgramId,
  //   shipMintKey,
  //   walletKey
  // );

  const info = await getShipStakingAccountInfo(
    solana,
    fleetProgramId,
    shipMintKey,
    walletKey
  );


  // Current capcity represents seconds until the resources is depleted
  res.status(200).json({
    shipsInEscrow: info.shipQuantityInEscrow.toNumber(),
    foodInEscrow: info.foodQuantityInEscrow.toNumber(),
    fuelInEscrow: info.fuelQuantityInEscrow.toNumber(),
    armsInEscrow: info.armsQuantityInEscrow.toNumber(),
    fuelCurrentCapacity: info.fuelCurrentCapacity.toNumber(),
    foodCurrentCapacity: info.foodCurrentCapacity.toNumber(),
    armsCurrentCapacity: info.armsCurrentCapacity.toNumber(),
    healthCurrentCapacity: info.healthCurrentCapacity.toNumber(),
    rewardsPending: info.pendingRewards.toNumber(),
    totalRewardsPaid: info.totalRewardsPaid.toNumber(),
  });
}
