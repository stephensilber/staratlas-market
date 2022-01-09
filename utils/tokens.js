//   export interface Token {
//     chainId: number; // 101,
//     address: string; // 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
//     symbol: string; // 'USDC',
//     name: string; // 'Wrapped USDC',
//     decimals: number; // 6,
//     logoURI: string; // 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png',
//     tags: string[]; // [ 'stablecoin' ]
// }

export const USDC_TOKEN = {
  chainId: 101,
  address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  symbol: "USDC",
  name: "Wrapped USDC",
  decimals: 6,
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png",
  tags: ["stablecoin"],
};

export const ATLAS_TOKEN = {
  chainId: 101,
  address: "ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx",
  symbol: "ATLAS",
  name: "Star Atlas",
  decimals: 8,
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx/logo.png",
  tags: ["utility-token"],
  extensions: {
    coingeckoId: "star-atlas",
    description: "Star Atlas Token",
    serumV3Usdc: "Di66GTLsV64JgCCYGVcY21RZ173BHkjJVgPyezNN7P1K",
    waterfallbot: "https://bit.ly/ATLASwaterfall",
    website: "https://staratlas.com",
  },
};
