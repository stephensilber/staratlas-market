import { TOKEN_LIST_URL } from "@jup-ag/core";
import { useJupiter } from "@jup-ag/react-hook";
import { PublicKey } from "@solana/web3.js";
import { Button, NumberInput, Loader } from "@mantine/core";
import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import useSWR from "swr";
import { USDC_TOKEN, ATLAS_TOKEN } from "../utils/tokens";

const fetcher = (url) => fetch(url).then((r) => r.json());

export const SwapForm = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const { data: balances, isValidating: loadingBalances } = useSWR(
    wallet.connected &&
      wallet.publicKey &&
      (!swapState || swapState == "Confirmed")
      ? `/api/wallet/${wallet.publicKey}?tokens=${USDC_TOKEN.address},${ATLAS_TOKEN.address}`
      : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 30000,
      fallbackData: {
        [USDC_TOKEN.address]: { tokenAmount: { uiAmount: 0 } },
        [ATLAS_TOKEN.address]: { tokenAmount: { uiAmount: 0 } },
      },
    }
  );

  useEffect(() => {
    if (wallet && !wallet.connected && !wallet.connecting) {
      wallet.autoConnect = true;
    }
  }, [wallet]);

  const [fromAmount, setFromAmount] = useState(0);

  const [swapState, setSwapState] = useState(null);
  const [usdcMint] = useState(new PublicKey(USDC_TOKEN.address));
  const [atlasMint] = useState(new PublicKey(ATLAS_TOKEN.address));
  const [toAtlas, setToAtlas] = useState(true);

  const usdcBalance =
    balances[USDC_TOKEN.address].tokenAmount.uiAmount.toFixed(2);
  const atlasBalance =
    balances[ATLAS_TOKEN.address].tokenAmount.uiAmount.toFixed(2);

  const fromAmountInt =
    fromAmount * 10 ** (toAtlas ? USDC_TOKEN.decimals : ATLAS_TOKEN.decimals);
  const jupiter = useJupiter({
    amount: fromAmountInt, // integer amount in term of input mint
    inputMint: toAtlas ? usdcMint : atlasMint,
    outputMint: toAtlas ? atlasMint : usdcMint,
    slippage: 1, // 1% slippage
    debounceTime: 250, // debounce (ms) time before refresh
  });

  const {
    allTokenMints, // all the token mints that is possible to be input
    routeMap, // routeMap, same as the one in @jup-ag/core
    exchange, // exchange
    refresh, // function to refresh rates
    lastRefreshTimestamp, // timestamp when the data was last returned
    loading, // loading states
    routes, // all the routes from inputMint to outputMint
    error,
  } = jupiter;

  const humanReadableQuote = routes
    ? routes[0].outAmount /
      10 ** (toAtlas ? ATLAS_TOKEN.decimals : USDC_TOKEN.decimals)
    : 0;

  useEffect(() => {
    refresh();
  }, [fromAmount]);

  const performSwap = async () => {
    // Routes returned by Jupiter are always sorted by their outAmount
    // Therefore the best route is always the first route in the array
    const bestRoute = routes[0];

    const swapResult = await exchange({
      wallet: {
        sendTransaction: wallet.sendTransaction,
        publicKey: wallet.publicKey,
        signAllTransactions: wallet.signAllTransactions,
        signTransaction: wallet.signTransaction,
      },
      route: bestRoute,
      confirmationWaiterFactory: async (txid) => {
        setSwapState("Confirming");
        console.log("sending transaction");
        await connection.confirmTransaction(txid);
        setSwapState("Confirmed");
        console.log("confirmed transaction");

        setTimeout(() => {
          setSwapState(null);
          refresh();
        }, [1000]);
        return await connection.getTransaction(txid, {
          commitment: "confirmed",
        });
      },
    });

    console.log({ swapResult });

    if ("error" in swapResult) {
      console.log("Error:", swapResult.error);
    } else if ("txid" in swapResult) {
      console.log("Sucess:", swapResult.txid);
      console.log("Input:", swapResult.inputAmount);
      console.log("Output:", swapResult.outputAmount);
    }
  };

  return (
    <div className="flex gap-x-4 items-end">
      <TokenInput
        token={USDC_TOKEN}
        isFrom={toAtlas}
        loadingBalances={loadingBalances}
        balance={usdcBalance}
        onChange={setFromAmount}
        onClickBalance={(balance) => setFromAmount(balance)}
        value={!toAtlas ? humanReadableQuote : fromAmount}
      />
      <Button color="gray" size="xs" onClick={() => setToAtlas(!toAtlas)}>
        <SwapIcon toAtlas={toAtlas} />
      </Button>
      <TokenInput
        token={ATLAS_TOKEN}
        isFrom={!toAtlas}
        loadingBalances={loadingBalances}
        balance={atlasBalance}
        onChange={setFromAmount}
        onClickBalance={(balance) => setFromAmount(balance)}
        value={toAtlas ? humanReadableQuote : fromAmount}
      />
      <Button
        loading={loading && !swapState}
        color="purple"
        size="sm"
        disabled={loading || routes == null || routes.length == 0}
        onClick={performSwap}
      >
        {swapState && swapState}
        {!loading && !swapState && "Swap"}
      </Button>
    </div>
  );
};

function TokenInput({
  token,
  isFrom,
  loadingBalances,
  balance,
  onChange,
  value,
  onClickBalance,
}) {
  return (
    <NumberInput
      label={
        <span
          className={`${
            isFrom ? "cursor-pointer" : "cursor-default"
          } font-mono text-xs font-bold`}
          onClick={() => {
            if (!isFrom) return;
            onClickBalance(parseFloat(balance));
          }}
        >
          {!loadingBalances ? `Balance: ${balance}` : "Loading..."}
        </span>
      }
      styles={{ input: { width: 150, textAlign: "center" } }}
      disabled={!isFrom}
      precision={2}
      value={value}
      onChange={onChange}
      error={isFrom && parseFloat(value) > parseFloat(balance)}
      icon={
        <img
          className="p-2 rounded-full"
          src={token.logoURI}
          alt={token.symbol}
        />
      }
    />
  );
}

function SwapIcon({ toAtlas }) {
  return (
    <>
      {!toAtlas && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {toAtlas && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </>
  );
}
