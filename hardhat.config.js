// hardhat.config.js (ESM version)
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.INFURA_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};

export default config;