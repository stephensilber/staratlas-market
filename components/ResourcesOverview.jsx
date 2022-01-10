import { Loader } from "@mantine/core";
import { useWallet } from "@solana/wallet-adapter-react";
import useSWR from "swr";
import { formatNumberLarge } from "../formatters";

const fetcher = (url) => fetch(url).then((r) => r.json());

const RESOURCE_ADDRESSES = [
  "ammoK8AkX2wnebQb35cDAZtTkvsXQbi82cGeTnUvvfK",
  "foodQJAztMzX1DKpLaiounNe2BDMds5RNuPC6jsNrDG",
  "fueL3hBZjLLLJHiFH9cqZoozTG3XQZ53diwFPwbzNim",
  "tooLsNYLiVqzg8o4m3L2Uetbn62mvMWRqkog6PQeYKL",
];

export const ResourcesOverview = ({
  ammoBurn,
  fuelBurn,
  foodBurn,
  toolsBurn,
}) => {
  const wallet = useWallet();

  if (!wallet.autoConnect) {
    wallet.autoConnect = true;
  }

  const { data: balances, isValidating: loadingBalances } = useSWR(
    wallet.connected && wallet.publicKey
      ? `/api/wallet/${wallet.publicKey}?tokens=${RESOURCE_ADDRESSES.join(",")}`
      : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 30000,
      fallbackData: {
        [RESOURCE_ADDRESSES[0]]: { tokenAmount: { uiAmount: 0 } },
        [RESOURCE_ADDRESSES[1]]: { tokenAmount: { uiAmount: 0 } },
        [RESOURCE_ADDRESSES[2]]: { tokenAmount: { uiAmount: 0 } },
        [RESOURCE_ADDRESSES[3]]: { tokenAmount: { uiAmount: 0 } },
      },
    }
  );

  const ammoBalance =
    balances[RESOURCE_ADDRESSES[0]].tokenAmount.uiAmount.toFixed(0);
  const foodBalance =
    balances[RESOURCE_ADDRESSES[1]].tokenAmount.uiAmount.toFixed(0);
  const fuelBalance =
    balances[RESOURCE_ADDRESSES[2]].tokenAmount.uiAmount.toFixed(0);
  const toolkitBalance =
    balances[RESOURCE_ADDRESSES[3]].tokenAmount.uiAmount.toFixed(0);

  return (
    <>
      {loadingBalances && <Loader />}
      {!loadingBalances && (
        <div className="flex flex-col gap-y-1 font-mono font-bold">
          <span
            className={
              ammoBalance < 10_000 || (ammoBurn && ammoBalance < ammoBurn)
                ? "text-red-400"
                : ""
            }
          >
            Ammo: {formatNumberLarge(ammoBalance)}{" "}
            {ammoBurn &&
              !isNaN(ammoBurn) &&
              `(${formatNumberLarge(ammoBurn)}/day)`}
          </span>
          <span
            className={
              foodBalance < 10_000 || (foodBurn && foodBalance < foodBurn)
                ? "text-red-400"
                : ""
            }
          >
            Food: {formatNumberLarge(foodBalance)}{" "}
            {foodBurn &&
              !isNaN(foodBurn) &&
              `(${formatNumberLarge(foodBurn)}/day)`}
          </span>
          <span
            className={
              fuelBalance < 10_000 || (fuelBurn && fuelBalance < fuelBurn)
                ? "text-red-400"
                : ""
            }
          >
            Fuel: {formatNumberLarge(fuelBalance)}{" "}
            {fuelBurn &&
              !isNaN(fuelBurn) &&
              `(${formatNumberLarge(fuelBurn)}/day)`}
          </span>
          <span
            className={
              toolkitBalance < 10_000 ||
              (toolsBurn && toolkitBalance < toolsBurn)
                ? "text-red-400"
                : ""
            }
          >
            Tool: {formatNumberLarge(toolkitBalance)}{" "}
            {toolsBurn &&
              !isNaN(toolsBurn) &&
              `(${formatNumberLarge(toolsBurn)}/day)`}
          </span>
        </div>
      )}
    </>
  );
};
