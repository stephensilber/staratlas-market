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
  totalAmmo,
  ammoNeeded,
  totalFuel,
  fuelNeeded,
  totalFood,
  foodNeeded,
  totalTools,
  toolsNeeded,
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
      <div className="flex flex-col gap-y-1 font-mono font-bold">
        <ResourceRow
          name="Ammo"
          balance={ammoBalance}
          needed={ammoNeeded}
          total={totalAmmo}
          isValidating={loadingBalances}
        />
        <ResourceRow
          name="Food"
          balance={foodBalance}
          needed={foodNeeded}
          total={totalFood}
          isValidating={loadingBalances}
        />
        <ResourceRow
          name="Fuel"
          balance={fuelBalance}
          needed={fuelNeeded}
          total={totalFuel}
          isValidating={loadingBalances}
        />
        <ResourceRow
          name="Tool"
          balance={toolkitBalance}
          needed={toolsNeeded}
          total={totalTools}
          isValidating={loadingBalances}
        />
      </div>
    </>
  );
};

function ResourceRow({
  name,
  balance,
  needed,
  total,
  isValidating,
  lowBalanceAmount = 10_000,
}) {
  return (
    <span
      className={`flex gap-x-2 items-center ${
        balance < lowBalanceAmount || (needed && balance < needed)
          ? "text-red-400"
          : ""
      }`}
    >
      {name}:{" "}
      {isValidating && (!balance || !needed) && (
        <Loader color="white" size="xs" variant="dots" />
      )}
      {balance && needed && (
        <>
          {formatNumberLarge(balance)}{" "}
          {needed &&
            !isNaN(needed) &&
            `(${formatNumberLarge(needed)} / ${formatNumberLarge(
              total
            )} needed)`}
        </>
      )}
    </span>
  );
}
