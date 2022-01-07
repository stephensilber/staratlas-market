import React, {
  createContext,
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export const MarketFeedContext = createContext();

export const MarketFeedProvider = ({ walletAddress, children }) => {
  const { publicKey, sendTransaction } = useWallet();

  const [marketIds, setMarketIds] = useState([]);
  const { data: nfts } = useSWR("/api/nfts", fetcher, {
    fallbackData: [],
  });

  const { data: resources } = useSWR("/api/resources", fetcher, {
    fallbackData: {},
  });

  const { data: priceData } = useSWR(`/api/price`, fetcher, {
    refreshInterval: 10000,
    initialData: {},
  });

  const messageHistory = useRef([]);
  const [marketMap, setMarketMap] = useState({});

  useEffect(() => {
    if (!nfts) {
      setMarketIds([]);
    }
    const _markets = nfts
      .filter((x) => x.attributes.itemType == "ship")
      .map((x) => x.markets);

    let markets = [];
    _markets.forEach((x) => {
      markets.push(...x);
    });

    setMarketIds(markets.map((x) => x.id));
  }, [nfts]);

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    "wss://serum-vial.staratlas.cloud/v1/ws",
    {
      onOpen: () => {
        const subscribeL2 = {
          op: "subscribe",
          channel: "level2",
          markets: marketIds,
        };

        const subscribeL3 = {
          op: "subscribe",
          channel: "level3",
          markets: marketIds,
        };

        sendMessage(JSON.stringify(subscribeL2));
        // sendMessage(JSON.stringify(subscribeL3));
      },
    },
    marketIds.length > 0
  );

  messageHistory.current = useMemo(
    () => messageHistory.current.concat(lastMessage),
    [lastMessage]
  );

  function nftForMarketId(id) {
    return nfts.filter(
      (x) => x.markets.filter((y) => y.id == id).length > 0
    )[0];
  }

  async function handleNewLastMessage(lastMessage) {
    if (!lastMessage || !lastMessage.data) {
      return;
    }
    const event = JSON.parse(lastMessage.data);

    if (event.type !== "l2snapshot") {
      return;
    }

    let latestData = {
      bids: event.bids,
      asks: event.asks,
      timestamp: event.timestamp,
      lastUpdated: new Date(event.timestamp),
    };

    let totalListed = 0;

    if (event.bids.length > 0) {
      latestData.latestBid = event.bids[0][0];
      latestData.latestBidSize = event.bids[0][1];
    }

    if (event.asks.length > 0) {
      latestData.latestAsk = event.asks[0][0];
      latestData.latestAskSize = event.asks[0][1];
      event.asks.forEach((x) => {
        console.log(`Adding ${x[1]} to total listed`);
        totalListed = totalListed + parseInt(x[1]);
      });
    }

    latestData.totalListed = totalListed;

    try {
      const ship = nftForMarketId(event.market);
      if (publicKey) {
        const response = await fetch(
          `/api/staking/${ship.mint}?walletAddress=${publicKey.toString()}`
        );
        const stakeInfo = await response.json();

        latestData.stakeInfo = stakeInfo;
        console.log(
          `Number of ${ship.name} listed: ${stakeInfo.shipsInEscrow}`
        );
      }

      const rateResponse = await fetch(`/api/ships/${ship.mint}`);
      const shipRates = await rateResponse.json();

      console.log(`Fetched ship rates: `, shipRates);

      latestData.shipRates = shipRates;
    } catch (e) {
      console.log(e);
    }

    console.log(
      `Just got a new snapshot for ${event.market} at ${latestData.lastUpdated} (${totalListed})`
    );

    setMarketMap((prev) => ({
      ...prev,
      [event.market]: latestData,
    }));
  }

  useEffect(() => {
    handleNewLastMessage(lastMessage);
  }, [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const resourcePrices = resources ? resources.resourcePrices : {};
  const shipData = resources ? resources.shipData : {};

  return (
    <MarketFeedContext.Provider
      value={{
        connectionStatus,
        messageHistory,
        priceData,
        nfts,
        marketMap,
        resourcePrices,
        shipData,
      }}
    >
      {children}
    </MarketFeedContext.Provider>
  );
};
