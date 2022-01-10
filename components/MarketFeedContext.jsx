import React, {
  createContext,
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useNotifications } from "@mantine/notifications";

import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export const MarketFeedContext = createContext();

export const MarketFeedProvider = ({ walletAddress, children }) => {
  const notifications = useNotifications();

  const wallet = useWallet();

  const [marketIds, setMarketIds] = useState([]);
  const [shipInfo, setShipInfo] = useState({});

  const { data: nfts } = useSWR("/api/nfts", fetcher, {
    fallbackData: [],
  });

  const resources = {
    food: 0.0006144,
    fuel: 0.0014336,
    ammo: 0.0021504,
    tools: 0.0017408,
  };
  // const { data: resources } = useSWR("/api/resources", fetcher, {
  //   fallbackData: {},
  // });

  const { data: priceData } = useSWR(`/api/price`, fetcher, {
    refreshInterval: 10000,
    initialData: {},
  });

  const STAKING_URL = `/api/staking/all?wallet=${wallet.publicKey}`;
  const { data: stakeInfo } = useSWR(
    wallet.connected ? STAKING_URL : null,
    fetcher,
    {
      refreshInterval: 60000,
      initialData: {},
    }
  );

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
        sendMessage(JSON.stringify(subscribeL3));
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

    const isMarketInUsdc = (nft, market) => {
      return nft.markets.filter((x) => x.id == market)[0].quotePair == "USDC";
    };
    const notificationTitle = (nft, event) => {
      switch (event.type) {
        case "fill":
          if (event.side == "sell") {
            return `${nft.name} sold`;
          } else {
            return `${nft.name} bought`;
          }
        case "open":
          if (event.side == "buy") {
            return `${nft.name} bid created`;
          } else {
            return `${nft.name} listed`;
          }
        case "done":
          return null;
      }
    };
    const notificationMessage = (nft, event) => {
      let adjustedPrice = event.price;
      if (!isMarketInUsdc(nft, event.market) && adjustedPrice && priceData) {
        adjustedPrice = parseFloat(adjustedPrice * priceData.rate).toFixed(2);
      }
      switch (event.type) {
        case "open":
          if (event.side == "buy") {
            return `Bid created at $${adjustedPrice}`;
          } else {
            return `Listed for $${adjustedPrice}`;
          }
        case "fill":
          if (event.side == "sell") {
            return `Sold ${event.size} at ${adjustedPrice}`;
          } else {
            return `Bought ${event.size} at ${adjustedPrice}`;
          }
        case "done":
          return `Order done: ${event.reason}`;
      }
    };

    if (["open", "fill", "close"].includes(event.type)) {
      if (event.side == "buy" && event.type == "fill") return;
      const nft = nftForMarketId(event.market);
      notifications.showNotification({
        title: notificationTitle(nft, event),
        message: notificationMessage(nft, event),
        color: event.type == "fill" ? "green" : "gray",
        icon: (
          <div className="w-12 h-12 rounded-md">
            <img
              className="w-full h-full object-cover"
              src={nft.image}
              alt={nft.name}
            />
          </div>
        ),
        autoClose: 10000,
      });
    }

    if (event.type !== "l3snapshot") {
      return;
    }

    const bids = event.bids.map((x) => [x.price, x.size]);
    const asks = event.asks.map((x) => [x.price, x.size]);

    let latestData = {
      bids: bids,
      asks: asks,
      timestamp: event.timestamp,
      lastUpdated: performance.now(),
    };

    let totalListed = 0;

    if (bids.length > 0) {
      latestData.latestBid = bids[0][0];
      latestData.latestBidSize = bids[0][1];
    }

    if (asks.length > 0) {
      latestData.latestAsk = asks[0][0];
      latestData.latestAskSize = asks[0][1];
      asks.forEach((x) => {
        totalListed = totalListed + parseInt(x[1]);
      });
    }

    latestData.totalListed = totalListed;

    try {
      const ship = nftForMarketId(event.market);

      const rateResponse = await fetch(`/api/ships/${ship.mint}`);
      const shipRates = await rateResponse.json();

      setShipInfo((prev) => ({
        ...prev,
        [ship.mint]: shipRates,
      }));
    } catch (e) {
      console.log(e);
    }

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

  return (
    <MarketFeedContext.Provider
      value={{
        connectionStatus,
        priceData,
        nfts,
        marketMap,
        resourcePrices: resources,
        stakeInfo,
        shipInfo,
      }}
    >
      {children}
    </MarketFeedContext.Provider>
  );
};
