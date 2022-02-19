import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as EXTERNAL_ADDRESSES from "../constants/externalAddresses.json";
import { BigNumber } from "ethers";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  network,
  ethers,
}: HardhatRuntimeEnvironment) {
  console.log("Running RibbonThetaVault deploy script");

  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const owner = deployer;

  const networkName = network.name;

  const addresses =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    EXTERNAL_ADDRESSES[networkName] ||
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    EXTERNAL_ADDRESSES[Object.keys(EXTERNAL_ADDRESSES)[0]];

  const { parseEther } = ethers.utils;

  const { address } = await deploy("RibbonThetaVault", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    args: [
      addresses.assets.weth,
      (await deployments.get("RibbonFactory")).address,
      (await deployments.get("VaultRegistry")).address,
      addresses.assets.weth,
      addresses.assets.usdc,
      addresses.airswapSwap,
      18,
      // WETH: 10**18, 10**10 0.0000001
      // WBTC: 0.000001
      BigNumber.from("10").pow(BigNumber.from("10")).toString(),
      false,
    ],
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [
            owner,
            owner,
            parseEther("1000").toString(),
            "Ribbon ETH Theta Vault",
            "rETH-THETA",
          ],
        },
      },
    },
  });

  console.log("RibbonThetaVault deployed at ", address);
};

export default deployFunction;

deployFunction.dependencies = ["RibbonFactory", "VaultRegistry"];

deployFunction.tags = ["RibbonThetaVault"];
