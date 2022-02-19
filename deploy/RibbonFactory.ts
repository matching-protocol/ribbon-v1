import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  ethers,
}: HardhatRuntimeEnvironment) {
  console.log("Running RibbonFactory deploy script");
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const owner = deployer;
  const instrumentAdmin = deployer;

  const { address } = await deploy("RibbonFactory", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [owner, instrumentAdmin],
        },
      },
    },
  });

  console.log("RibbonFactory deployed at ", address);

  const ribbonFactory = await ethers.getContractAt("RibbonFactory", address);
  console.log("RibbonFactory setAdapter");
  await (
    await ribbonFactory.setAdapter(
      "OPYN_GAMMA",
      (await deployments.get("GammaAdapter")).address,
      { from: deployer }
    )
  ).wait();
  console.log("RibbonFactory setAdapter");
};

export default deployFunction;

deployFunction.dependencies = ["GammaAdapter"];

deployFunction.tags = ["RibbonFactory"];
