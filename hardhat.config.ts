import "dotenv/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],

  solidity: {
    profiles: {
      default: {
        version: "0.8.20",
      },
      production: {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },

  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },

    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },

    mantleSepolia: {
      type: "http",
      chainType: "op",
      url: process.env.MANTLE_SEPOLIA_RPC || "https://rpc.sepolia.mantle.xyz",
      accounts: process.env.MANTLE_PRIVATE_KEY ? [process.env.MANTLE_PRIVATE_KEY] : [],
    },
  },
});
