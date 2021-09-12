import { useRef, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import useSWR from "swr";
import { Loader, Text, Badge, Kbd } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import {
  colorForRarity,
  colorGradientForRarity,
  colorForItemType,
} from "../../nfts";
import { nftForMarket } from "../../nfts";
const fetcher = (url) => fetch(url).then((r) => r.json());

async function getMarketData({ market }) {
  const res = await fetch(`/api/market/${market}`);
  return await res.json();
}

function MarketSize({ title, data }) {
  return (
    <div className="flex flex-col">
      <div className="font-bold text-lg">{title}</div>
      {!data.length && <div>None</div>}
      {data.map((x) => (
        <div className="flex flex-row justify-start gap-x-6">
          <p className="w-8 font-mono text-xs">x{x.size}</p>
          <p className="font-mono">{x.price}</p>
        </div>
      ))}
    </div>
  );
}

const Detail = ({ market, cachedNft }) => {
  const homeRef = useRef(null);
  const { data, isValidating, error } = useSWR(
    `/api/market/${market}`,
    fetcher,
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  useHotkeys([["shift+H", () => homeRef.current.click()]]);

  const nft = data ? data.nft : cachedNft;

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
        <div className="flex flex-col max-w-lg">
          <div className="overflow-hidden">
            <img
              key={nft.image}
              className="w-full rounded"
              src={nft.image}
              alt={nft.name}
            />
            <div className="py-4">
              <Text
                component="span"
                align="center"
                variant="gradient"
                gradient={colorGradientForRarity(nft.attributes.rarity)}
                size="lg"
                weight={700}
                style={{ fontFamily: "Dosis, sans-serif" }}
              >
                {nft.name}
              </Text>
              <p className="text-gray-300 text-base">{nft.description}</p>
            </div>
            <div className="pt-4 pb-2">
              <Link href={`https://play.staratlas.com/dex/${market}`}>
                <a className="text-blue-500 font-bold">Star Atlas Market</a>
              </Link>
            </div>
            <div className="pt-4 pb-2 flex flex-row gap-x-2">
              <Badge
                variant="filled"
                color={colorForRarity(nft.attributes.rarity)}
              >
                {nft.attributes.rarity.toUpperCase()}
              </Badge>
              <Badge
                variant="filled"
                color={colorForItemType(nft.attributes.itemType)}
              >
                {nft.attributes.itemType.toUpperCase()}
              </Badge>
              <Badge variant="filled" color={"gray"}>
                Supply: {nft.totalSupply}
              </Badge>
              {nft.attributes.tier && (
                <Badge variant="filled" color={"gray"}>
                  Tier: {nft.attributes.tier}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {data && (
          <div className="flex flex-col gap-y-3 w-full">
            <div className="flex flex-row justify-start items-center gap-x-4">
              <div className="font-bold text-xl">Orders</div>
              {isValidating && (
                <Loader
                  color={nft ? colorForRarity(nft.attributes.rarity) : "white"}
                  size="xs"
                  variant="dots"
                />
              )}
            </div>
            <div className="flex flex-row gap-x-24 w-full">
              <MarketSize title="Asks" data={data.asks} flipped />
              <MarketSize title="Bids" data={data.bids} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// this function only runs on the server by Next.js
export const getServerSideProps = async ({ params }) => {
  const market = params.pid;
  // const marketData = await getMarketData({ market });
  // const marketDataPath = `/api/market/${market}`;
  const marketData = null;
  const nft = nftForMarket(market);
  let fallback = {};
  // fallback[marketDataPath] = marketData;
  return {
    props: {
      market,
      cachedNft: nft,
      fallback: fallback,
    },
  };
};

export default Detail;
