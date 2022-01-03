/* eslint-disable @typescript-eslint/no-var-requires */
const withTM = require('next-transpile-modules')(['@blocto/sdk', '@project-serum/sol-wallet-adapter']);


module.exports = withTM({
  reactStrictMode: false,
  images: {
    domains: ["storage.googleapis.com"],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack5: true,
})