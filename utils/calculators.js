export const calculateTotals = (nft, atlas, usdc) => {
  // use reduce to add up all of the 'supply' values of each airdrop in nft.airdrops
  const airdropSupply = (nft.airdrops || []).reduce((acc, cur) => {
    return acc + cur.supply;
  }, 0);
  const primarySaleSupply = (nft.primarySales || []).reduce((acc, cur) => {
    return acc + cur.supply;
  }, 0);

  const totalAtOrigination =
    parseFloat(usdc.latestAsk).toFixed(2) <= parseFloat(msrp).toFixed(2)
      ? usdc.latestAskSize
      : 0;

  return {
    totalListed: atlas.totalListed + usdc.totalListed,
    totalSupply: airdropSupply + primarySaleSupply,
    totalAtOrigination,
  };
};

export const calculateShipFinancials = (
  shipResourceData,
  priceData,
  resourcePrices
) => {
  const grossPerDayUsdc = shipResourceData.grossRewards * priceData.rate;
  const foodPerDayUsdc =
    shipResourceData.foodBurn * priceData.rate * resourcePrices.food * 24 * 60;
  const fuelPerDayUsdc =
    shipResourceData.fuelBurn * priceData.rate * resourcePrices.fuel * 24 * 60;
  const ammoPerDayUsdc =
    shipResourceData.ammoBurn * priceData.rate * resourcePrices.ammo * 24 * 60;
  const toolsPerDayUsdc =
    shipResourceData.toolsBurn *
    priceData.rate *
    resourcePrices.tools *
    24 *
    60;

  const netPerDayUsdc =
    grossPerDayUsdc -
    foodPerDayUsdc -
    fuelPerDayUsdc -
    ammoPerDayUsdc -
    toolsPerDayUsdc;

  const resourceCostPerDayUsdc =
    foodPerDayUsdc + fuelPerDayUsdc + ammoPerDayUsdc + toolsPerDayUsdc;
  const resourceCostPerDay = resourceCostPerDayUsdc / priceData.rate;

  return {
    grossPerDay: shipResourceData.grossRewards,
    grossPerDayUsdc,
    foodPerDayUsdc,
    fuelPerDayUsdc,
    ammoPerDayUsdc,
    toolsPerDayUsdc,
    resourceCostPerDayUsdc,
    resourceCostPerDay,
    netPerDayUsdc,
  };
};
