import "../styles/globals.css";
import { useEffect, useMemo } from "react";
import { JssProvider, createGenerateId } from "react-jss";
import Head from "next/head";
import { MantineProvider, NormalizeCSS, GlobalStyles } from "@mantine/core";
import { MarketFeedProvider } from "../components/MarketFeedContext";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

require("@solana/wallet-adapter-react-ui/styles.css");

export default function App(props) {
  const { Component, pageProps } = props;

  const network = WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

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
            <MarketFeedProvider>
              <JssProvider generateId={createGenerateId()}>
                <Head>
                  <title>Star Atlas Marketplace</title>
                  <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width"
                  />
                </Head>
                <MantineProvider
                  theme={{
                    /** Put your mantine theme override here */
                    colorScheme: "dark",
                  }}
                >
                  <NormalizeCSS />
                  <GlobalStyles />
                  <Component {...pageProps} />
                </MantineProvider>
              </JssProvider>
            </MarketFeedProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
}
