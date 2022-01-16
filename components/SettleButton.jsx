import {
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { Button } from "@mantine/core";
import { useState, useEffect, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Market, OpenOrders } from "@project-serum/serum";

const PROGRAM_ADDRESS = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";
const programmAddressKey = new PublicKey(PROGRAM_ADDRESS);

export const createAssociatedTokenAccountIx = (
  mint,
  associatedAccount,
  owner
) =>
  Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    associatedAccount,
    owner,
    owner
  );

export const findAssociatedTokenAddress = async (
  walletAddress,
  tokenMintAddress
) => {
  return (
    await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];
};

export const signAndSendRawTransaction = async (
  connection,
  transaction,
  wallet,
  ...signers
) => {
  transaction.feePayer = wallet.publicKey;
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash("max")
  ).blockhash;
  signers.forEach((signer) => transaction.partialSign(signer));

  transaction = await wallet.signTransaction(transaction);

  return await connection.sendRawTransaction(transaction.serialize());
};

const settleFunds = async (connection, market, openOrders, wallet) => {
  if (!wallet.publicKey || !wallet.signTransaction) return;

  const tx = new Transaction();

  const [[baseAccount], [quoteAccount]] = await Promise.all([
    market.findBaseTokenAccountsForOwner(connection, openOrders.owner),
    market.findQuoteTokenAccountsForOwner(connection, openOrders.owner),
  ]);

  const getOrCreateOpenOrdersWallet = async (pubkey, mintAddress) => {
    let openOrdersWallet =
      pubkey || (mintAddress.equals(WRAPPED_SOL_MINT) && wallet.publicKey);
    if (!openOrdersWallet) {
      openOrdersWallet = await findAssociatedTokenAddress(
        wallet.publicKey,
        mintAddress
      );
      tx.add(
        createAssociatedTokenAccountIx(
          mintAddress,
          openOrdersWallet,
          wallet.publicKey
        )
      );
    }
    return openOrdersWallet;
  };

  const baseWallet = await getOrCreateOpenOrdersWallet(
    baseAccount.pubkey,
    market.baseMintAddress
  );
  const quoteWallet = await getOrCreateOpenOrdersWallet(
    quoteAccount.pubkey,
    market.quoteMintAddress
  );

  const settleFundsTx = await market.makeSettleFundsTransaction(
    connection,
    openOrders,
    baseWallet,
    quoteWallet
  );
  const { signers, transaction } = settleFundsTx;
  tx.add(transaction);

  return await signAndSendRawTransaction(connection, tx, wallet, ...signers);
};

export const SettleAllButton = ({ markets }) => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const [settlementState, setSettlementState] = useState(null);
  const [unsettledOrders, setUnsettledOrders] = useState([]);

  const checkForUnsettled = async () => {
    console.log(`Checking for unsettled open orders...`);
    setSettlementState("checking");

    const allOpenOrders = await OpenOrders.findForOwner(
      connection,
      new PublicKey(wallet.publicKey),
      programmAddressKey
    );

    console.log(`${allOpenOrders.length} open orders found`);

    let unsettled = [];

    await allOpenOrders.forEach(async (openOrders) => {
      // Check if we have balances to settle for this OpenOrder
      if (openOrders.baseTokenFree > 0 || openOrders.quoteTokenFree > 0) {
        console.log(
          `Found open order that needs settlement for ${openOrders.market}`
        );

        unsettled.push(openOrders);
      }
    });

    setUnsettledOrders(unsettled);
    setSettlementState(unsettled.length > 0 ? "unsettled" : null);
  };

  const settleAllOrders = async () => {
    setSettlementState("settling");
    await unsettledOrders.forEach(async (openOrders) => {
      const market = await Market.load(
        connection,
        openOrders.market,
        {},
        programmAddressKey
      );

      await settleFunds(connection, market, openOrders, wallet);
    });

    setUnsettledOrders([]);
    setSettlementState("settled");

    checkForUnsettled();
  };

  useEffect(() => {
    if (wallet.connected && wallet.publicKey !== null) {
      checkForUnsettled();
    }
  }, [wallet.publicKey]);

  const buttonCopy = useMemo(() => {
    switch (settlementState) {
      case "unsettled":
        return `Settle ${unsettledOrders.length} orders`;
      case "checking":
        return `Checking orders...`;
      case "settled":
        return "Settled";
      case "settling":
        return "Settling...";
      case null:
        return "No unsettled orders";
    }
  }, [settlementState, unsettledOrders]);

  return (
    <div className="flex flex-col">
      <div className="flex gap-x-1 items-center">
        <Button
          color={settlementState === "unsettled" ? "green" : "gray"}
          loading={settlementState === "settling"}
          disabled={settlementState === "checking"}
          size="sm"
          className="w-full"
          onClick={() => {
            if (unsettledOrders.length > 0) {
              settleAllOrders();
            } else {
              checkForUnsettled();
            }
          }}
        >
          {buttonCopy}
        </Button>
        <Button
          color={"blue"}
          loading={settlementState === "checking"}
          size="sm"
          onClick={() => {
            checkForUnsettled();
          }}
          disabled={
            settlementState === "checking" || settlementState === "settling"
          }
        >
          {!(settlementState !== "unsettled" && settlementState !== null) && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
};
