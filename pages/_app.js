import '../styles/globals.css'
import { useEffect } from "react";
import { JssProvider, createGenerateId } from "react-jss";
import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider, NormalizeCSS, GlobalStyles } from "@mantine/core";

export default function App(props) {
  const { Component, pageProps } = props;

  useEffect(() => {
    const jssStyles = document.getElementById("mantine-ssr-styles");
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
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
    </>
  );
}
