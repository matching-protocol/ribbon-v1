import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import EXTERNAL_ADDRESSES from "../constants/externalAddresses.json";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) {
  console.log("Running GammaAdapter deploy script");
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const networkName = network.name;
  const addresses =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    EXTERNAL_ADDRESSES[networkName] ||
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    EXTERNAL_ADDRESSES[Object.keys(EXTERNAL_ADDRESSES)[0]];

  const { address } = await deploy("GammaAdapter", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    args: [
      addresses.oTokenFactory,
      addresses.gammaController,
      addresses.gammaMarginPool,
      addresses.feeds["usdc/eth"],
      addresses.uniswapV2Router,
      addresses.assets.weth,
      addresses.assets.usdc,
      addresses.zeroExExchangeV3,
    ],
  });

  console.log("GammaAdapter deployed at ", address);
};

export default deployFunction;

deployFunction.dependencies = [];

deployFunction.tags = ["GammaAdapter"];
