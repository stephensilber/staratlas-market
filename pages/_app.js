import "../styles/globals.css";
import { useEffect, useMemo } from "react";
import { JssProvider, createGenerateId } from "react-jss";
import Head from "next/head";
import { MantineProvider, NormalizeCSS, GlobalStyles } from "@mantine/core";
import { MarketFeedProvider } from "../components/MarketFeedContext";
import { NotificationsProvider } from "@mantine/notifications";

import {
  ConnectionProvider,
  useConnection,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import { JupiterProvider } from "@jup-ag/react-hook";

import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

require("@solana/wallet-adapter-react-ui/styles.css");

export default function App(props) {
  const { Component, pageProps } = props;

  const network = WalletAdapterNetwork.Mainnet;
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const endpoint = "https://frosty-dawn-snowflake.solana-mainnet.quiknode.pro/380e75fde83d58ce13804c6ffc1692c56cae26bc/"
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  useEffect(() => {
    const jssStyles = document.getElementById("mantine-ssr-styles");
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <JupiterWrapper>
              <MantineProvider
                theme={{
                  /** Put your mantine theme override here */
                  colorScheme: "dark",
                }}
              >
                <NotificationsProvider>
                  <MarketFeedProvider>
                    <JssProvider generateId={createGenerateId()}>
                      <Head>
                        <title>Star Atlas Marketplace</title>
                        <meta
                          name="viewport"
                          content="minimum-scale=1, initial-scale=1, width=device-width"
                        />
                      </Head>
                      <NormalizeCSS />
                      <GlobalStyles />
                      <Component {...pageProps} />
                    </JssProvider>
                  </MarketFeedProvider>
                </NotificationsProvider>
              </MantineProvider>
            </JupiterWrapper>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
}

const JupiterWrapper = ({ children }) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  return (
    <JupiterProvider
      cluster="mainnet-beta"
      connection={connection}
      userPublicKey={wallet.publicKey || undefined}
    >
      {children}
    </JupiterProvider>
  );
};
