import { useRef, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import useSWR from "swr";
import { Loader, Text, Badge, Kbd } from "@mantine/core";
import MarketDataFeed from "../../components/MarketDataFeed";
import { useHotkeys } from "@mantine/hooks";
import {
  colorForRarity,
  colorGradientForRarity,
  colorForItemType,
} from "../../nfts";
import { nftForMarket } from "../../nfts";
import { fetchNFTs } from "../api/nfts";
const fetcher = (url) => fetch(url).then((r) => r.json());

async function getMarketData({ market }) {
  const res = await fetch(`/api/market/${market}`);
  return await res.json();
}

function MarketSize({ title, data, conversion }) {
  return (
    <div className="flex flex-col">
      <div className="font-bold text-lg">{title}</div>
      {!data.length && <div>None</div>}
      {data.map((x) => (
        <div className="flex flex-row justify-start gap-x-6">
          <p className="w-12 font-mono text-xs">x{x.size}</p>
          <p
            className={`font-mono ${conversion && "text-green-300"}`}
            alt={x.price}
          >
            {!conversion && x.price}{" "}
            {conversion && `$${(x.price * conversion).toFixed(2)}`}
          </p>
        </div>
      ))}
    </div>
  );
}

function MarketOrderBook({ market, nft, conversion }) {
  const { data, isValidating, error } = useSWR(
    `/api/market/${market.id}`,
    fetcher,
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      initialData: { bids: [], asks: [] },
    }
  );

  return (
    <div className="flex flex-col gap-y-3 w-full">
      <div className="flex flex-row justify-start items-center gap-x-4">
        <div className="font-bold text-xl">
          Orders{" "}
          <span className="font-light text-md">({market.quotePair})</span>
        </div>
        {isValidating && (
          <Loader
            color={nft ? colorForRarity(nft.attributes.rarity) : "white"}
            size="xs"
            variant="dots"
          />
        )}
      </div>
      {data && (
        <div className="flex flex-row gap-x-24 w-full">
          <MarketSize
            conversion={market.quotePair == "ATLAS" ? conversion : null}
            title="Asks"
            data={data.asks}
            flipped
          />
          <MarketSize
            conversion={market.quotePair == "ATLAS" ? conversion : null}
            title="Bids"
            data={data.bids}
          />
        </div>
      )}
    </div>
  );
}

const Feed = ({ markets, nft }) => {
  const homeRef = useRef(null);

  const { data } = useSWR(`/api/price`, fetcher, {
    refreshInterval: 10000,
    initialData: {},
  });

  useHotkeys([["shift+H", () => homeRef.current.click()]]);

  if (!nft) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-4 p-8">
      <div className="flex flex-row gap-x-3">
        <Link href="/">
          <a ref={homeRef}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </a>
        </Link>
        <div className="flex flex-row">
          <Kbd>shift</Kbd>
          <Kbd>H</Kbd>
        </div>
      </div>
      <div className="flex flex-col gap-y-8 sm:flex-row sm:gap-x-8">
        <div className="flex gap-x-16">
          <div className="flex flex-col">
            <MarketDataFeed symbols={markets.map((x) => x.id)} />
          </div>
        </div>
      </div>
    </div>
  );
};

// this function only runs on the server by Next.js
export const getServerSideProps = async ({ params }) => {
  const nfts = await fetchNFTs();

  const nft = nfts[0];
  const _markets = nfts
    .filter((x) => x.attributes.itemType == "ship")
    .map((x) => x.markets);

  let markets = [];
  _markets.forEach((x) => {
    markets.push(...x);
  });

  let fallback = {};
  return {
    props: {
      markets,
      nft,
      fallback: fallback,
    },
  };
};

export default Feed;
