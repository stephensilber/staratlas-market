export default async function handler(req, res) {
  const resourcePrices = {
    food: 0.0006144,
    fuel: 0.0014336,
    ammo: 0.0021504,
    tools: 0.0017408,
  };

  let shipData = {
    OPALJ: {
      grossRewards: 0.939168,
      foodBurn: 0.0145833,
      fuelBurn: 0.0256944,
      ammoBurn: 0.0180556,
      toolsBurn: 0.025,
    },
    PX4: {
      grossRewards: 0.87696,
      foodBurn: 0.0159722,
      fuelBurn: 0.0201389,
      ammoBurn: 0.0270833,
      toolsBurn: 0.0284722,
    },
    OPALJJ: {
      grossRewards: 12.242,
      foodBurn: 0.1,
      fuelBurn: 0.31,
      ammoBurn: 0.15,
      toolsBurn: 0.3,
    },
    PX5: {
      grossRewards: 6.2536,
      foodBurn: 0.12,
      fuelBurn: 0.15,
      ammoBurn: 0.2,
      toolsBurn: 0.21,
    },
    VZUSAM: {
      grossRewards: 47.742,
      foodBurn: 0.58,
      fuelBurn: 0.87,
      ammoBurn: 0.94,
      toolsBurn: 1.01,
    },
    PX6: {
      grossRewards: 38.562,
      foodBurn: 0.59,
      fuelBurn: 0.72,
      ammoBurn: 0.98,
      toolsBurn: 1.01,
    },
    FBLBEA: {
      grossRewards: 36.995,
      foodBurn: 0.58,
      fuelBurn: 0.79,
      ammoBurn: 0.98,
      toolsBurn: 0.79,
    },
    TUFAFE: {
      grossRewards: 33.949,
      foodBurn: 0.29,
      fuelBurn: 0.79,
      ammoBurn: 0.98,
      toolsBurn: 1.01,
    },
    CHI: {
      grossRewards: 40.12,
      foodBurn: 0.57,
      fuelBurn: 0.43,
      ammoBurn: 0.98,
      toolsBurn: 1.01,
    },
    VZUSOP: {
      grossRewards: 69.523,
      foodBurn: 2.51,
      fuelBurn: 1.97,
      ammoBurn: 1.16,
      toolsBurn: 1.63,
    },
    CALEV: {
      grossRewards: 106.565,
      foodBurn: 3.02,
      fuelBurn: 2.03,
      ammoBurn: 2.15,
      toolsBurn: 2.79,
    },
    OM: {
      grossRewards: 111.644,
      foodBurn: 2.44,
      fuelBurn: 1.39,
      ammoBurn: 2.21,
      toolsBurn: 2.67,
    },
    PF4: {
      grossRewards: 118.984,
      foodBurn: 1.86,
      fuelBurn: 2.32,
      ammoBurn: 3.13,
      toolsBurn: 3.25,
    },
    FBLBPL: {
      grossRewards: 138.9425,
      foodBurn: 2.44,
      fuelBurn: 3.48,
      ammoBurn: 2.44,
      toolsBurn: 1.97,
    },
    CALCH: {
      grossRewards: 146.881,
      foodBurn: 2.44,
      fuelBurn: 2.15,
      ammoBurn: 2.38,
      toolsBurn: 2.67,
    },
    FBLEGR: {
      grossRewards: 352.983,
      foodBurn: 6.58,
      fuelBurn: 6.65,
      ammoBurn: 7.39,
      toolsBurn: 9.61,
    },
    OGKATP: {
      grossRewards: 430.194,
      foodBurn: 5.91,
      fuelBurn: 8.13,
      ammoBurn: 9.42,
      toolsBurn: 10.35,
    },
    PR8: {
      grossRewards: 433.998,
      foodBurn: 7.39,
      fuelBurn: 8.13,
      ammoBurn: 6.65,
      toolsBurn: 9.61,
    },
    OGKAJA: {
      grossRewards: 1170.732,
      foodBurn: 22.42,
      fuelBurn: 17.93,
      ammoBurn: 14.27,
      toolsBurn: 17.93,
    },
    CALG: {
      grossRewards: 1174.471,
      foodBurn: 17.12,
      fuelBurn: 15.08,
      ammoBurn: 16.71,
      toolsBurn: 18.75,
    },
    PC9: {
      grossRewards: 1210.444,
      foodBurn: 13.04,
      fuelBurn: 16.3,
      ammoBurn: 22.01,
      toolsBurn: 22.82,
    },
    FBLEBO: {
      grossRewards: 1374.6,
      foodBurn: 14.51,
      fuelBurn: 14.67,
      ammoBurn: 22.01,
      toolsBurn: 22.82,
    },
    PC11: {
      grossRewards: 3462.064,
      foodBurn: 39.22,
      fuelBurn: 49.02,
      ammoBurn: 66.23,
      toolsBurn: 68.85,
    },
    FBLETR: {
      grossRewards: 3980.102,
      foodBurn: 43.64,
      fuelBurn: 44.12,
      ammoBurn: 66.23,
      toolsBurn: 68.65,
    },
  };

  Object.keys(shipData).forEach((symbol) => {
    const x = shipData[symbol];
    shipData[symbol] = {
      ...x,
      foodAtlas: x.foodBurn * resourcePrices.food,
      fuelAtlas: x.fuelBurn * resourcePrices.fuel,
      ammoAtlas: x.ammoBurn * resourcePrices.ammo,
      toolsAtlas: x.toolsBurn * resourcePrices.tools,
    };
  });

  res.status(200).json({
    shipData,
    resourcePrices,
  });
}
