import React, { useRef, useState, useContext, useMemo } from "react";
import { useHotkeys } from "@mantine/hooks";
import { useRouter } from "next/router";
import { Drawer } from "@mantine/core";

import {
  formatRelativePercentage,
  formatCurrencyLarge,
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatNumberLarge,
} from "../formatters";

import dynamic from "next/dynamic";
import { MarketFeedContext } from "../components/MarketFeedContext";
import { Wallet } from "../components/Wallet";

const Grid = dynamic(() => import("../components/Grid"), { ssr: false });

const columns = [
  {
    prop: "symbol",
    title: "Symbol",
    width: 100,
    kind: "text",
  },
  {
    prop: "name",
    title: "Name",
    width: 200,
    kind: "text",
  },
  {
    prop: "shipsInEscrow",
    title: "Deployed",
    width: 67,
    kind: "text",
  },
  {
    prop: "apr",
    title: "APR (%)",
    width: 80,
    kind: "number",
    render: formatRelativePercentage,
  },
  {
    prop: "msrp",
    title: "MSRP",
    width: 80,
    kind: "number",
    // render: formatNumberLarge
    //   render: (value) => "$" + value.toFixed(2),
  },
  {
    prop: "percentAboveMSRP",
    title: "% >MSRP",
    width: 80,
    kind: "number",
    render: formatPercentage,
  },
  {
    prop: "atlasLatestAsk",
    title: "(A) Ask",
    width: 90,
    kind: "number",
    render: formatCurrency,
    themeOverride: (value, row) => {
      if (
        parseFloat(row.msrp).toFixed(2) === parseFloat(value).toFixed(2) ||
        parseFloat(row.usdcLatestAsk) < parseFloat(value)
      ) {
        return {
          bgCell: "#1F5139",
        };
      }
      return {
        bgCell: "rgb(0, 0, 0, 0.0)",
      };
    },
  },
  {
    prop: "atlasLatestBid",
    title: "(A) Bid",
    width: 90,
    kind: "text",
    render: formatCurrency,
  },
  {
    prop: "usdcLatestAsk",
    title: "($) Ask",
    width: 90,
    kind: "text",
    render: formatCurrency,
    themeOverride: (value, row) => {
      if (
        parseFloat(row.msrp).toFixed(2) === parseFloat(value).toFixed(2) ||
        parseFloat(row.atlasLatestAsk) < parseFloat(value)
      ) {
        return {
          bgCell: "#1F5139",
        };
      }
      return {
        bgCell: "rgb(0, 0, 0, 0.0)",
      };
    },
  },
  {
    prop: "usdcLatestBid",
    title: "($) Bid",
    width: 90,
    kind: "number",
    render: formatCurrency,
  },
  {
    prop: "totalSupply",
    title: "Supply",
    width: 80,
    kind: "number",
  },
  {
    prop: "marketCap",
    title: "Mkt Cap",
    width: 80,
    kind: "number",
    render: formatCurrencyLarge,
  },
  {
    prop: "totalSupplyListed",
    title: "Listed %",
    width: 80,
    kind: "number",
    render: formatPercentage,
  },
  {
    prop: "totalAtOrigination",
    title: "≤ MSRP",
    width: 90,
    kind: "number",
  },
  {
    prop: "grossPerDayUsdc",
    title: "Daily Gross",
    width: 90,
    kind: "number",
    render: formatCurrency,
  },
  {
    prop: "resourceCostPerDayUsdc",
    title: "Daily Burn",
    width: 80,
    kind: "number",
    render: formatCurrency,
  },
  {
    prop: "netPerDayUsdc",
    title: "Daily Net",
    width: 80,
    kind: "number",
    render: formatCurrency,
  },
  {
    prop: "totalDailyNet",
    title: "Total Daily Net",
    width: 120,
    kind: "number",
    render: formatCurrencyLarge,
  },

  {
    prop: "currentAmmoHealth",
    title: "Ammo %",
    width: 120,
    kind: "number",
    render: formatPercentage,
  },
  {
    prop: "currentFoodHealth",
    title: "Food %",
    width: 120,
    kind: "number",
    render: formatPercentage,
  },
  {
    prop: "currentFuelHealth",
    title: "Fuel %",
    width: 120,
    kind: "number",
    render: formatPercentage,
  },
  {
    prop: "shipSpec",
    title: "Spec",
    width: 150,
    kind: "bubble",
  },
];

export default function Ships() {
  const [selectedMarket, setSelectedMarket] = useState(null);
  const router = useRouter();

  const { marketMap, nfts, shipData, resourcePrices, priceData } =
    useContext(MarketFeedContext);

  const source = useMemo(() => {
    if (!marketMap || !shipData || !priceData || !resourcePrices) {
      return [];
    }
    return nfts
      .filter((x) => x.attributes.itemType === "ship")
      .map((nft) => {
        const marketPairs = nft.markets.map((x) => {
          return {
            quotePair: x.quotePair,
            id: x.id,
          };
        });
        const atlas = marketMap[marketPairs[0].id] || {};
        const usdc = marketMap[marketPairs[1].id] || {};

        console.log(`USDC`, usdc);

        let grossPerDayUsdc = 0;
        let foodPerDayUsdc = 0;
        let fuelPerDayUsdc = 0;
        let ammoPerDayUsdc = 0;
        let toolsPerDayUsdc = 0;
        let netPerDayUsdc = 0;

        const shipResourceData = usdc.shipRates;

        if (shipResourceData) {
          const MILLISECONDS_PER_DAY = 86_400_000;

          grossPerDayUsdc =
            shipResourceData.rewardRatePerSecond * priceData.rate * 60 * 24;
          foodPerDayUsdc =
            (MILLISECONDS_PER_DAY /
              shipResourceData.millisecondsToBurnOneFood) *
            priceData.rate *
            resourcePrices.food;
          fuelPerDayUsdc =
            (MILLISECONDS_PER_DAY /
              shipResourceData.millisecondsToBurnOneFuel) *
            priceData.rate *
            resourcePrices.fuel;
          ammoPerDayUsdc =
            (MILLISECONDS_PER_DAY /
              shipResourceData.millisecondsToBurnOneArms) *
            priceData.rate *
            resourcePrices.ammo;
          toolsPerDayUsdc =
            (MILLISECONDS_PER_DAY /
              shipResourceData.millisecondsToBurnOneToolkit) *
            priceData.rate *
            resourcePrices.tools;

          netPerDayUsdc =
            grossPerDayUsdc -
            foodPerDayUsdc -
            fuelPerDayUsdc -
            ammoPerDayUsdc -
            toolsPerDayUsdc;
        }

        const currentFuelHealth =
          usdc.shipRates && usdc.stakeInfo && usdc.stakeInfo.shipsInEscrow > 0
            ? usdc.stakeInfo.fuelInEscrow /
              (usdc.shipRates.fuelMaxReserve * usdc.stakeInfo.shipsInEscrow)
            : 0;
        const currentFoodHealth =
          usdc.shipRates && usdc.stakeInfo && usdc.stakeInfo.shipsInEscrow > 0
            ? usdc.stakeInfo.foodInEscrow /
              (usdc.shipRates.fuelMaxReserve * usdc.stakeInfo.shipsInEscrow)
            : 0;
        const currentAmmoHealth =
          usdc.shipRates && usdc.stakeInfo && usdc.stakeInfo.shipsInEscrow > 0
            ? usdc.stakeInfo.armsInEscrow /
              (usdc.shipRates.armsMaxReserve * usdc.stakeInfo.shipsInEscrow)
            : 0;

        const shipsInEscrow = usdc.stakeInfo
          ? usdc.stakeInfo.shipsInEscrow || 0
          : 0;

        console.log(
          `RES: `,
          currentAmmoHealth,
          currentFoodHealth,
          currentFuelHealth
        );

        const resourceCostPerDayUsdc =
          foodPerDayUsdc + fuelPerDayUsdc + ammoPerDayUsdc + toolsPerDayUsdc;
        const resourceCostPerDay = resourceCostPerDayUsdc / priceData.rate;

        const usdcShipData = {
          grossPerDay: grossPerDayUsdc / priceData.rate,
          grossPerDayUsdc,
          foodPerDayUsdc,
          fuelPerDayUsdc,
          ammoPerDayUsdc,
          toolsPerDayUsdc,
          resourceCostPerDayUsdc,
          resourceCostPerDay,
          netPerDayUsdc,
        };

        let shipPriceUsdc = usdc.latestAsk;

        if (
          atlas.latestAsk * priceData.rate < shipPriceUsdc &&
          atlas.latestAsk != 0
        ) {
          shipPriceUsdc = atlas.latestAsk * priceData.rate;
        }
        const apr = (netPerDayUsdc / shipPriceUsdc) * 365 * 100;

        let msrp = 0;
        if (
          nft.tradeSettings &&
          nft.tradeSettings.msrp &&
          nft.tradeSettings.msrp.value
        ) {
          msrp = nft.tradeSettings.msrp.value.toString();
        }

        const percentAboveMSRP = (shipPriceUsdc - msrp) / msrp;

        // use reduce to add up all of the 'supply' values of each airdrop in nft.airdrops
        const airdropSupply = (nft.airdrops || []).reduce((acc, cur) => {
          return acc + cur.supply;
        }, 0);
        const primarySaleSupply = (nft.primarySales || []).reduce(
          (acc, cur) => {
            return acc + cur.supply;
          },
          0
        );

        const totalListed = atlas.totalListed + usdc.totalListed;
        const totalSupply = airdropSupply + primarySaleSupply;
        const totalDailyNet = totalSupply * netPerDayUsdc;
        const totalDailyBurn = totalSupply * resourceCostPerDayUsdc;
        const totalSupplyListed = totalListed / Math.max(totalSupply, 1);
        const totalAtOrigination =
          parseFloat(usdc.latestAsk).toFixed(2) == parseFloat(msrp).toFixed(2)
            ? usdc.latestAskSize
            : 0;

        const primarySaleCount = nft.primarySales.length || 0;
        const marketCap = totalSupply * (usdc.latestAsk || msrp);
        const atlasLatestBid = atlas.latestBid * priceData.rate;
        const atlasLatestAsk = atlas.latestAsk * priceData.rate;

        return {
          ...nft,
          ...usdcShipData,
          ...usdc.stakeInfo,
          shipRates: usdc.shipRates,
          shipSpec: [nft.attributes.spec],
          shipsInEscrow,
          shipPriceUsdc,
          marketCap,
          apr: apr,
          msrp: msrp,
          totalAtOrigination,
          totalListed,
          totalSupplyListed,
          totalSupply,
          primarySaleCount,
          atlasBids: atlas.bids || [],
          usdcBids: usdc.bids || [],
          atlasAsks: atlas.asks,
          atlasTimestamp: atlas.timestamp,
          usdcTimestamp: usdc.timestamp,
          usdcAsks: usdc.asks,
          atlasLatestBid,
          usdcLatestBid: usdc.latestBid,
          atlasLatestAsk,
          usdcLatestAsk: usdc.latestAsk,
          atlasLastBidSize: atlas.lastBidSize,
          usdcLastAskSize: usdc.lastAskSize,
          totalDailyNet,
          totalDailyBurn,
          currentAmmoHealth,
          currentFuelHealth,
          currentFoodHealth,
          percentAboveMSRP,
        };
      })
      .sort((a, b) => {
        if (isNaN(a.apr)) {
          return -1;
        }
        if (isNaN(b.apr)) {
          return 1;
        }

        if (a.apr > b.apr) {
          return -1;
        } else {
          return 1;
        }
      });
  }, [marketMap, nfts, shipData]);

  const totalShipValue = useMemo(() => {
    let totalValue = 0;
    source.forEach((x) => {
      totalValue +=
        (isNaN(x.shipsInEscrow) ? 0 : x.shipsInEscrow) * x.usdcLatestBid;
    });

    return totalValue;
  }, [source, priceData]);

  const totalMarketCap = useMemo(() => {
    let totalValue = 0;
    source.forEach((x) => {
      if (isNaN(x.marketCap)) return;
      totalValue += x.marketCap;
    });

    return totalValue;
  }, [source, priceData]);

  const totalDailyNet = useMemo(() => {
    let totalValue = 0;
    source.forEach((x) => {
      if (isNaN(x.totalDailyNet)) return;
      totalValue += x.totalDailyNet;
    });

    return totalValue;
  }, [source, priceData]);

  const totalDailyBurn = useMemo(() => {
    let totalValue = 0;
    source.forEach((x) => {
      if (isNaN(x.totalDailyBurn)) return;
      totalValue += x.totalDailyBurn;
    });

    return totalValue;
  }, [source, priceData]);

  console.log(`market cap`, totalMarketCap);

  const totalShipDailyRewards = useMemo(() => {
    if (!priceData) return 0;
    let totalValue = 0;
    source.forEach((x) => {
      if (!x.shipRates) return;
      if (isNaN(x.shipsInEscrow)) return;
      const grossRewards = x.shipRates.rewardRatePerSecond * 24 * 60;

      const fuelCost =
        (86400000 / x.shipRates.millisecondsToBurnOneFuel) *
        resourcePrices.fuel;
      const ammoCost =
        (86400000 / x.shipRates.millisecondsToBurnOneArms) *
        resourcePrices.ammo;
      const toolCost =
        (86400000 / x.shipRates.millisecondsToBurnOneToolkit) *
        resourcePrices.tools;
      const foodCost =
        (86400000 / x.shipRates.millisecondsToBurnOneFood) *
        resourcePrices.food;
      const burnCost =
        (fuelCost + ammoCost + toolCost + foodCost) * priceData.rate;

      const totalGross = x.shipsInEscrow * grossRewards;
      const totalBurn = x.shipsInEscrow * burnCost;
      const netValue = totalGross - totalBurn;
      totalValue += netValue;
    });
    return totalValue * priceData.rate;
  }, [source, priceData]);
  //   useHotkeys([
  //     ["ctrl+K", () => searchRef.current.focus()],
  //     ["mod+K", () => searchRef.current.focus()],
  //     ["ctrl+J", () => typeRef.current.focus()],
  //     ["mod+J", () => typeRef.current.focus()],
  //   ]);

  return (
    <div className="h-screen w-screen flex flex-col">
      {selectedMarket && <Drawer position="right" size="90vw"></Drawer>}
      <div className="flex justify-between flex-shrink-0 p-4 text-sm">
        <div className="font-mono text-white flex flex-col">
          {priceData && <span>ATLAS PRICE: ${priceData.rate.toFixed(5)}</span>}
        </div>
        <div className="font-mono text-white flex flex-col">
          <span>SHIPS VALUE: {formatCurrency(totalShipValue)}</span>
          <span>DAILY NET: {formatCurrency(totalShipDailyRewards)}</span>
        </div>
        <div className="font-mono text-white flex flex-col">
          <span>MARKET CAP: {formatCurrency(totalMarketCap)}</span>
          <span>TOTAL NET: {formatCurrency(totalDailyNet)}</span>
          <span>TOTAL BURN: {formatCurrency(totalDailyBurn)}</span>
        </div>
        <Wallet />
      </div>

      <div className="flex-grow flex-shrink h-full w-full">
        <Grid
          source={source}
          defaultSortColumn={"apr"}
          columns={columns}
          cellWasDoubleClicked={(row) => {
            router.push(`/market/${row.markets[0].id}`);
            //   setSelectedMarket(row.markets[0].id);
          }}
        />
      </div>
    </div>
  );
}
