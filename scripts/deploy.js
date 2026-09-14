const hre = require("hardhat");

async function main() {
  console.log("--------------------------------------------------");
  console.log("Deploying BotMultisender to network:", hre.network.name);
  console.log("--------------------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "BOT");

  const BotMultisender = await hre.ethers.getContractFactory("BotMultisender");
  const multisender = await BotMultisender.deploy();

  await multisender.waitForDeployment();
  const contractAddress = await multisender.getAddress();

  console.log("✅ BotMultisender successfully deployed at:", contractAddress);
  console.log("--------------------------------------------------");
  console.log("Save this address to your frontend config: src/config/contracts.js");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
