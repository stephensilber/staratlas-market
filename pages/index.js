import React, { useRef } from "react";
import Link from "next/link";
import Head from "next/head";
import { Badge, Text, Title, Select, Kbd } from "@mantine/core";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useHotkeys } from "@mantine/hooks";
import {
  colorForItemType,
  colorGradientForRarity,
  sortOrderForRarity,
} from "../nfts";
import { MultiSelect } from "@mantine/core";
import { fetchNFTs } from "./api/nfts";

export default function Home({ itemTypes, itemRarity, itemClasses, nfts }) {
  const [selectedItemTypes, setSelectedItemTypes] = React.useState(["ship"]);
  const [selectedItemClasses, setSelectedItemClasses] = React.useState([]);
  const [selectedItemRarity, setSelectedItemRarity] = React.useState([]);

  const searchRef = useRef(null);
  const typeRef = useRef(null);

  useHotkeys([
    ["ctrl+K", () => searchRef.current.focus()],
    ["mod+K", () => searchRef.current.focus()],
    ["ctrl+J", () => typeRef.current.focus()],
    ["mod+J", () => typeRef.current.focus()],
  ]);

  const filteredNfts = nfts
    .filter((x) => {
      if (selectedItemTypes.length > 0) {
        if (!selectedItemTypes.includes(x.attributes.itemType.toString())) {
          return false;
        }
      }
      if (selectedItemClasses.length > 0) {
        if (!selectedItemClasses.includes(x.attributes.class)) {
          return false;
        }
      }
      if (selectedItemRarity.length > 0) {
        if (!selectedItemRarity.includes(x.attributes.rarity)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      return (
        sortOrderForRarity(a.attributes.rarity) -
        sortOrderForRarity(b.attributes.rarity)
      );
    });

  return (
    <div className={styles.container}>
      <Head>
        <title>Star Atlas Market</title>
        <meta
          name="description"
          content="Lightweight access to the Star Atlas market"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="p-4">
        <div className="">
          <div className="max-w-2xl mx-auto py-8 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
            <Title order={1}>Star Atlas Market</Title>

            <div className="flex flex-col gap-y-4 sm:gap-x-8 sm:flex-row justify-between my-6">
              <div className="flex flex-col gap-y-4 sm:gap-x-8 sm:flex-row justify-start">
                <MultiSelect
                  elementRef={typeRef}
                  searchable
                  value={selectedItemTypes}
                  onChange={setSelectedItemTypes}
                  className="max-w-lg"
                  data={itemTypes.map((x) => {
                    return { value: x, label: x };
                  })}
                  label="Types"
                  placeholder="Filter item types"
                  rightSection={
                    <div className="mr-4 pb-1">
                      <Kbd>⌘</Kbd>
                      <Kbd>J</Kbd>
                    </div>
                  }
                />
                <MultiSelect
                  value={selectedItemClasses}
                  onChange={setSelectedItemClasses}
                  className="max-w-lg"
                  data={itemClasses.map((x) => {
                    return { value: x, label: x };
                  })}
                  label="Classes"
                  placeholder="Filter item class"
                />
                <MultiSelect
                  value={selectedItemRarity}
                  onChange={setSelectedItemRarity}
                  className="max-w-lg"
                  data={itemRarity.map((x) => {
                    return { value: x, label: x };
                  })}
                  label="Rarity"
                  placeholder="Filter by rarity"
                />
              </div>
              <Select
                elementRef={searchRef}
                label="Search"
                placeholder="Find item by name"
                searchable
                nothingFound="No matches"
                rightSection={
                  <div className="mr-4 pb-1">
                    <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd>
                  </div>
                }
                onChange={(x) => {
                  console.log(x);
                  if (!x) {
                    return;
                  }
                  window.location.href = `/market/${x}`;
                }}
                data={nfts.map((x) => {
                  return {
                    value: x.markets[0].id,
                    label: x.name,
                  };
                })}
              />
            </div>

            <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:grid-cols-6 xl:gap-x-8">
              {filteredNfts.map((nft) => (
                <a
                  key={nft._id}
                  href={`/market/${nft.markets[0].id}`}
                  className="group"
                >
                  <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden xl:aspect-w-7 xl:aspect-h-8">
                    <Image
                      src={nft.media.thumbnailUrl || nft.image}
                      alt={nft.name}
                      height={200}
                      width={200}
                      loading="eager"
                      layout="responsive"
                      className="w-full h-full object-center object-cover group-hover:opacity-75"
                    />
                  </div>

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
                  <br />
                  <Badge
                    variant="filled"
                    color={colorForItemType(nft.attributes.itemType)}
                  >
                    {nft.attributes.itemType.toUpperCase()}
                  </Badge>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
}

export async function getServerSideProps(context) {
  const nftData = await fetchNFTs();
  const itemTypes = Array.from(
    new Set(nftData.map((x) => x.attributes.itemType.toString()))
  );
  const itemClasses = Array.from(
    new Set(nftData.map((x) => x.attributes.class))
  );
  const itemRarity = Array.from(
    new Set(nftData.map((x) => x.attributes.rarity))
  );

  return {
    props: {
      itemTypes,
      itemClasses,
      itemRarity,
      nfts: nftData,
    }, // will be passed to the page component as props
  };
}
