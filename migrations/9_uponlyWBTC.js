const Factory = artifacts.require("RibbonFactory");
const BN = web3.utils.BN;
const BTCPriceProvider = artifacts.require("FakeBTCPriceProvider");
const StakingWBTC = artifacts.require("HegicStakingWBTC");
const WBTCOptions = artifacts.require("HegicWBTCOptions");
const WBTCStakingRewards = artifacts.require("WBTCStakingRewards");
const WBTCRewards = artifacts.require("HegicWBTCRewards");
const AmmAdapterLib = artifacts.require("AmmAdapter");
const ProtocolAdapterLib = artifacts.require("ProtocolAdapter");
const StakedPut = artifacts.require("StakedPut");
const StakingETH = artifacts.require("HegicStakingETH");
const ETHPool = artifacts.require("HegicETHPool");
const PriceProvider = artifacts.require("FakePriceProvider");
const ETHOptions = artifacts.require("HegicETHOptions");
const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const { encodeCall } = require("@openzeppelin/upgrades");
const { constants } = require("@openzeppelin/test-helpers");
const {
  updateDeployedAddresses,
} = require("../scripts/helpers/updateDeployedAddresses");
const ADDRESSES = require("../constants/externalAddresses.json");
const ACCOUNTS = require("../constants/accounts.json");
const EXTERNAL_ADDRESSES = require("../constants/externalAddresses.json");
const DEPLOYMENTS = require("../constants/deployments.json");

let network;

const params = {
  ETHtoBTC() {
    return this.ETHPrice.mul(new BN("10000000000000000000000000000000")).div(
      this.BTCPrice
    );
  },
  BTCPrice: new BN("1161000000000"),
  ETHPrice: new BN(380e8),
};

module.exports = async function (deployer, _network) {
  network = _network;
  console.log(network);
  const networkLookup = network.replace("-fork", "");
  const { admin, owner } = ACCOUNTS[network.replace("-fork", "")];

  await deployer.deploy(
    StakingETH,
    EXTERNAL_ADDRESSES[networkLookup].assets.hegic
  );

  await deployer.deploy(
    ETHOptions,
    EXTERNAL_ADDRESSES[networkLookup].feeds["eth/usd"],
    EXTERNAL_ADDRESSES[networkLookup].assets.wbtc2,
    EXTERNAL_ADDRESSES[networkLookup].hegicStakingETH
  );

  // // deploy staked put
  await deployer.deploy(ProtocolAdapterLib);
  await deployer.link(ProtocolAdapterLib, StakedPut);

  await deployer.deploy(AmmAdapterLib);
  await deployer.link(AmmAdapterLib, StakedPut);

  await deployer.deploy(
    StakedPut,
    DEPLOYMENTS[networkLookup].RibbonFactory,
    DEPLOYMENTS[networkLookup].UniswapAdapter,
    EXTERNAL_ADDRESSES[networkLookup].assets.wbtc2,
    EXTERNAL_ADDRESSES[networkLookup].hegicWBTCOptions,
    EXTERNAL_ADDRESSES[networkLookup].assets.usdc,
    EXTERNAL_ADDRESSES[networkLookup].feeds.btc_usd
  );
};