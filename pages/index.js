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
import { SwapForm } from "../components/SwapForm";
import { SettleAllButton } from "../components/SettleButton";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ResourcesOverview } from "../components/ResourcesOverview";
const Grid = dynamic(() => import("../components/Grid"), { ssr: false });

const MILLISECONDS_PER_DAY = 86_400_000;

const columns = [
  // {
  //   prop: "symbol",
  //   title: "Symbol",
  //   width: 100,
  //   kind: "text",
  // },
  {
    prop: "name",
    title: "Name",
    width: 180,
    kind: "text",
  },
  {
    prop: "shipsInEscrow",
    title: "Fleet",
    width: 48,
    kind: "text",
  },
  {
    prop: "apr",
    title: "APR (%)",
    width: 70,
    kind: "number",
    render: formatRelativePercentage,
  },
  {
    prop: "msrp",
    title: "MSRP",
    width: 70,
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
    prop: "atlasLatestBid",
    title: "(A) Bid",
    width: 90,
    kind: "text",
    render: formatCurrency,
    themeOverride: (value, row) => {
      if (parseFloat(row.usdcLatestBid) < parseFloat(value)) {
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
    prop: "atlasLatestAsk",
    title: "(A) Ask",
    width: 90,
    kind: "number",
    render: formatCurrency,
    themeOverride: (value, row) => {
      if (
        parseFloat(row.msrp).toFixed(2) === parseFloat(value).toFixed(2) ||
        parseFloat(row.usdcLatestAsk) > parseFloat(value)
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
    prop: "benSpacer",
    title: " ",
    width: 30,
    kind: "text",
  },
  {
    prop: "usdcLatestBid",
    title: "($) Bid",
    width: 90,
    kind: "number",
    render: formatCurrency,
    themeOverride: (value, row) => {
      if (parseFloat(row.atlasLatestBid) < parseFloat(value)) {
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
    prop: "usdcLatestAsk",
    title: "($) Ask",
    width: 90,
    kind: "text",
    render: formatCurrency,
    themeOverride: (value, row) => {
      if (
        parseFloat(row.msrp).toFixed(2) === parseFloat(value).toFixed(2) ||
        parseFloat(row.atlasLatestAsk) > parseFloat(value)
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
    prop: "totalSupply",
    title: "Supply",
    width: 70,
    kind: "number",
    render: formatNumberLarge,
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
    width: 60,
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
    width: 100,
    kind: "number",
    render: formatCurrencyLarge,
  },

  {
    prop: "ammoHealth",
    title: "Ammo (%)",
    width: 100,
    kind: "number",
    render: formatPercentage,
    themeOverride: (value, row) => {
      if (parseFloat(value) < 0.2) {
        return {
          bgCell: "#F87171",
        };
      }
      return {
        bgCell: "rgb(0, 0, 0, 0.0)",
      };
    },
  },
  {
    prop: "foodHealth",
    title: "Food (%)",
    width: 100,
    kind: "number",
    render: formatPercentage,
    themeOverride: (value, row) => {
      if (parseFloat(value) < 0.2) {
        return {
          bgCell: "#F87171",
        };
      }
      return {
        bgCell: "rgb(0, 0, 0, 0.0)",
      };
    },
  },
  {
    prop: "fuelHealth",
    title: "Fuel (%)",
    width: 100,
    kind: "number",
    render: formatPercentage,
    themeOverride: (value, row) => {
      if (parseFloat(value) < 0.2) {
        return {
          bgCell: "#F87171",
        };
      }
      return {
        bgCell: "rgb(0, 0, 0, 0.0)",
      };
    },
  },
  {
    prop: "toolsHealth",
    title: "Tools (%)",
    width: 100,
    kind: "number",
    render: formatPercentage,
    themeOverride: (value, row) => {
      if (parseFloat(value) < 0.2) {
        return {
          bgCell: "#F87171",
        };
      }
      return {
        bgCell: "rgb(0, 0, 0, 0.0)",
      };
    },
  },
  {
    prop: "shipSpec",
    title: "Spec",
    width: 120,
    kind: "bubble",
  },
];

export default function Ships() {
  const router = useRouter();
  const wallet = useWallet();

  const { marketMap, nfts, shipInfo, stakeInfo, resourcePrices, priceData } =
    useContext(MarketFeedContext);

  const source = useMemo(() => {
    if (!marketMap || !priceData || !resourcePrices) {
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

        // Contains rewards per second, max reserves, time to burn resources
        const ship = shipInfo ? shipInfo[nft.mint] : {};

        // Contains data specific to the user's staked ship (quantities in escrow, timestamps, etc)
        const shipStake = stakeInfo ? stakeInfo[nft.mint] : {};

        let grossPerDayUsdc = 0;
        let foodPerDayUsdc = 0;
        let fuelPerDayUsdc = 0;
        let ammoPerDayUsdc = 0;
        let toolsPerDayUsdc = 0;
        let netPerDayUsdc = 0;

        let totalDailyAmmoBurn = 0;
        let totalDailyFuelBurn = 0;
        let totalDailyFoodBurn = 0;
        let totalDailyToolkitBurn = 0;

        const primarySaleCount = nft.primarySales.length || 0;

        if (ship) {
          totalDailyAmmoBurn =
            MILLISECONDS_PER_DAY / ship.millisecondsToBurnOneArms;
          totalDailyFuelBurn =
            MILLISECONDS_PER_DAY / ship.millisecondsToBurnOneFuel;
          totalDailyFoodBurn =
            MILLISECONDS_PER_DAY / ship.millisecondsToBurnOneFood;
          totalDailyToolkitBurn =
            MILLISECONDS_PER_DAY / ship.millisecondsToBurnOneToolkit;

          const primarySaleCount = nft.primarySales.length || 0;
          grossPerDayUsdc = ship.rewardRatePerSecond * priceData.rate * 60 * 24;
          foodPerDayUsdc =
            (MILLISECONDS_PER_DAY / ship.millisecondsToBurnOneFood) *
            priceData.rate *
            resourcePrices.food;
          fuelPerDayUsdc =
            (MILLISECONDS_PER_DAY / ship.millisecondsToBurnOneFuel) *
            priceData.rate *
            resourcePrices.fuel;
          ammoPerDayUsdc =
            (MILLISECONDS_PER_DAY / ship.millisecondsToBurnOneArms) *
            priceData.rate *
            resourcePrices.ammo;
          toolsPerDayUsdc =
            (MILLISECONDS_PER_DAY / ship.millisecondsToBurnOneToolkit) *
            priceData.rate *
            resourcePrices.tools;

          netPerDayUsdc =
            grossPerDayUsdc -
            foodPerDayUsdc -
            fuelPerDayUsdc -
            ammoPerDayUsdc -
            toolsPerDayUsdc;
        }

        let resourceSummary = {};

        if (shipStake) {
          const now = new Date();
          const lastFueled = new Date(shipStake.fueledAtTimestamp * 1000);
          const lastFed = new Date(shipStake.fedAtTimestamp * 1000);
          const lastArmed = new Date(shipStake.armedAtTimestamp * 1000);
          const lastRepaired = new Date(shipStake.repairedAtTimestamp * 1000);

          const secondsSinceFueled = (now - lastFueled) / 1000;
          const secondsSinceFed = (now - lastFed) / 1000;
          const secondsSinceArmed = (now - lastArmed) / 1000;
          const secondsSinceRepaired = (now - lastRepaired) / 1000;

          const secondsToFullyBurnFuel =
            (ship.millisecondsToBurnOneFuel * ship.fuelMaxReserve) / 1000;
          const secondsToFullyBurnFood =
            (ship.millisecondsToBurnOneFood * ship.foodMaxReserve) / 1000;
          const secondsToFullyBurnAmmo =
            (ship.millisecondsToBurnOneArms * ship.armsMaxReserve) / 1000;
          const secondsToFullyBurnTools =
            (ship.millisecondsToBurnOneToolkit * ship.toolkitMaxReserve) / 1000;

          const fuelHealth = 1 - secondsSinceFueled / secondsToFullyBurnFuel;
          const foodHealth = 1 - secondsSinceFed / secondsToFullyBurnFood;
          const ammoHealth = 1 - secondsSinceArmed / secondsToFullyBurnAmmo;
          const toolsHealth =
            1 - secondsSinceRepaired / secondsToFullyBurnTools;

          const fuelTotal = (ship.fuelMaxReserve * shipStake.shipQuantityInEscrow)
          const foodTotal = (ship.foodMaxReserve * shipStake.shipQuantityInEscrow)
          const ammoTotal = (ship.armsMaxReserve * shipStake.shipQuantityInEscrow)
          const toolsTotal = (ship.toolkitMaxReserve * shipStake.shipQuantityInEscrow)

          const remainingFuel = fuelHealth * fuelTotal;
          const remainingFood = foodHealth * foodTotal;
          const remainingAmmo = ammoHealth * ammoTotal;
          const remainingTools = toolsHealth * toolsTotal;

          const fuelNeededToFill = fuelTotal - remainingFuel;
          const foodNeededtoFill = foodTotal - remainingFood;
          const ammoNeededToFill = ammoTotal - remainingAmmo;
          const toolsNeededToFill = toolsTotal - remainingTools;

          resourceSummary = {
            lastFueled,
            lastFed,
            lastArmed,
            lastRepaired,
            remainingAmmo,
            remainingFood,
            remainingFuel,
            remainingTools,
            fuelHealth,
            foodHealth,
            ammoHealth,
            toolsHealth,
            fuelNeededToFill,
            foodNeededtoFill,
            ammoNeededToFill,
            toolsNeededToFill,
          };

          console.log(`Resource for ${nft.name}: `, resourceSummary);
        }

        const currentFuelHealth =
          ship && shipStake && shipStake.shipQuantityInEscrow > 0
            ? shipStake.fuelQuantityInEscrow /
              (ship.fuelMaxReserve * shipStake.shipQuantityInEscrow)
            : 0;
        const currentFoodHealth =
          ship && shipStake && shipStake.shipQuantityInEscrow > 0
            ? shipStake.foodQuantityInEscrow /
              (ship.fuelMaxReserve * shipStake.shipQuantityInEscrow)
            : 0;
        const currentAmmoHealth =
          ship && shipStake && shipStake.shipQuantityInEscrow > 0
            ? shipStake.armsQuantityInEscrow /
              (ship.armsMaxReserve * shipStake.shipQuantityInEscrow)
            : 0;

        const shipsInEscrow = shipStake
          ? shipStake.shipQuantityInEscrow || 0
          : 0;

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

        const marketCap = totalSupply * (usdc.latestAsk || msrp);
        const atlasLatestBid = atlas.latestBid * priceData.rate;
        const atlasLatestAsk = atlas.latestAsk * priceData.rate;

        return {
          ...nft,
          ...usdcShipData,
          ...usdc.shipStake,
          ...resourceSummary,
          lastUpdated: usdc.lastUpdated,
          ship: ship,
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
          totalDailyAmmoBurn,
          totalDailyFuelBurn,
          totalDailyFoodBurn,
          totalDailyToolkitBurn,
        };
      })
      .sort((a, b) => {
        if (isNaN(a.apr)) {
          return -1;
        }
        if (isNaN(b.apr)) {
          return -1;
        }

        if (a.apr > b.apr) {
          return -1;
        } else {
          return 1;
        }
      });
  }, [marketMap, nfts, shipInfo, stakeInfo]);

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

  const totalShipDailyRewards = useMemo(() => {
    if (!priceData) return 0;
    let totalValue = 0;
    source.forEach((x) => {
      if (!x.ship) return;
      if (isNaN(x.shipsInEscrow)) return;
      const grossRewards = x.ship.rewardRatePerSecond * 24 * 60;

      const fuelCost =
        (86400000 / x.ship.millisecondsToBurnOneFuel) * resourcePrices.fuel;
      const ammoCost =
        (86400000 / x.ship.millisecondsToBurnOneArms) * resourcePrices.ammo;
      const toolCost =
        (86400000 / x.ship.millisecondsToBurnOneToolkit) * resourcePrices.tools;
      const foodCost =
        (86400000 / x.ship.millisecondsToBurnOneFood) * resourcePrices.food;
      const burnCost =
        (fuelCost + ammoCost + toolCost + foodCost) * priceData.rate;

      const totalGross = x.shipsInEscrow * grossRewards;
      const totalBurn = x.shipsInEscrow * burnCost;
      const netValue = totalGross - totalBurn;
      totalValue += netValue;
    });
    return totalValue * priceData.rate;
  }, [source, priceData]);

  const totalShipResourcesNeeded = useMemo(() => {
    if (!priceData) return 0;
    let totalAmmo = 0;
    let totalFood = 0;
    let totalFuel = 0;
    let totalTools = 0;
    let ammoNeeded = 0;
    let foodNeeded = 0;
    let fuelNeeded = 0;
    let toolsNeeded = 0;
    source.forEach((x) => {
      if (!x.ship) return;
      if (isNaN(x.shipsInEscrow)) return;
      if (isNaN(x.ammoNeededToFill)) {
        return;
      }

      totalAmmo += x.ship.armsMaxReserve;
      totalFood += x.ship.foodMaxReserve;
      totalFuel += x.ship.fuelMaxReserve;
      totalTools += x.ship.toolkitMaxReserve;
      ammoNeeded += x.ammoNeededToFill;
      foodNeeded += x.foodNeededtoFill;
      fuelNeeded += x.fuelNeededToFill;
      toolsNeeded += x.toolsNeededToFill;
      console.log(
        `Adding resources to totals needed for ${x.name}`,
        totalAmmo,
        totalFood,
        totalFuel,
        totalTools
      );
    });
    return {
      totalAmmo,
      totalFood,
      totalFuel,
      totalTools,
      ammoNeeded,
      foodNeeded,
      toolsNeeded,
      fuelNeeded,
    };
  }, [source, priceData, shipInfo]);

  return (
    <div className="h-screen max-h-[100vh] max-w-screen flex flex-row">
      <div className="flex-grow flex-shrink h-screen w-[75%]">
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
      <div className="flex flex-col gap-y-12 flex-shrink-0 p-4 text-xs w-[25%] ">
        <Wallet />
        <div className="font-mono flex flex-col font-bold gap-y-1">
          {priceData && (
            <span className="my-2">
              ATLAS PRICE: ${priceData.rate.toFixed(5)}
            </span>
          )}
          <span>MARKET CAP: {formatCurrency(totalMarketCap)}</span>
          <span>DAILY RWRD: {formatCurrency(totalDailyNet)}</span>
          <span>DAILY BURN: {formatCurrency(totalDailyBurn)}</span>
        </div>
        <div className="font-mono flex flex-col"></div>
        <div className="flex flex-col gap-y-2">
          <h3 className="font-bold text-sm">Resources</h3>
          <ResourcesOverview {...totalShipResourcesNeeded} />
        </div>
        <div className="font-bold flex flex-col gap-y-2">
          <h3 className="font-bold text-sm">NAV</h3>
          <div className="font-bold flex flex-col gap-y-0">
            <span className="font-mono ">
              FLEET VALUE: {formatCurrency(totalShipValue)}
            </span>
            <span className="font-mono ">
              DAILY YIELD: {formatCurrency(totalShipDailyRewards)} (
              {formatPercentage(totalShipDailyRewards / totalShipValue)})
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-y-3">
          <h3 className="font-bold text-sm">Token Swap</h3>
          <SwapForm />
        </div>
        <div className="flex flex-col gap-y-3">
          <h3 className="font-bold text-sm">Settlements</h3>
          <SettleAllButton />
        </div>
      </div>
    </div>
  );
}
