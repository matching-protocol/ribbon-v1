import "dotenv/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-gas-reporter";

import { HardhatUserConfig } from "hardhat/config";

const accounts = [
  process.env.MNEMONIC ||
    "test test test test test test test test test test test junk",
];

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      ropsten: process.env.ETHERSCAN_API_KEY,
      rinkeby: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      kovan: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY,
      avalanche: process.env.AVALANHE_API_KEY,
    },
  },
  gasReporter: {
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    currency: "USD",
    enabled: process.env.REPORT_GAS === "true",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    admin: {
      default: 1,
    },
    dev: {
      default: 2,
    },
  },
  networks: {
    eth: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
      chainId: 1,
    },
    hardhat: {
      forking: {
        url: `${process.env.TEST_URI}`,
        blockNumber: 11611333,
      },
    },
    bsc: {
      url: `https://bsc-dataseed.binance.org/`,
      accounts,
      chainId: 56,
    },
    "bsc-testnet": {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts,
      chainId: 97,
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts,
      chainId: 3,
      live: true,
      saveDeployments: true,
      tags: ["staging"],
      gasMultiplier: 15,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
      chainId: 4,
      live: true,
      saveDeployments: true,
      tags: ["staging"],
      gasMultiplier: 15,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
      chainId: 5,
      live: true,
      saveDeployments: true,
      tags: ["staging"],
      gasMultiplier: 15,
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts,
      chainId: 42,
      live: true,
      saveDeployments: true,
      tags: ["staging"],
      gasMultiplier: 10,
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts,
      chainId: 80001,
      live: true,
      saveDeployments: true,
      gasMultiplier: 10,
    },
    polygon: {
      url: "https://polygon-rpc.com",
      accounts,
      chainId: 137,
      live: true,
      saveDeployments: true,
      gasMultiplier: 2,
    },
    avanlance: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts,
      chainId: 43114,
      live: true,
      saveDeployments: true,
    },
  },
  solidity: {
    version: "0.7.2",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  typechain: {
    outDir: "typechain",
    target: "web3-v1",
  },
  mocha: {
    timeout: 500000,
  },
};

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
export default config;
