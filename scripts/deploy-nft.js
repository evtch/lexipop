/**
 * 🚀 Deploy Lexipop Memory NFT Contract
 *
 * Deployment script for the Lexipop Memory NFT contract on Base network
 * Usage: npx hardhat run scripts/deploy-nft.js --network base-sepolia
 */

const hre = require("hardhat");

async function main() {
  console.log("🎨 Deploying Lexipop Memory NFT Contract...");

  // Get the contract factory
  const LexipopMemoryNFT = await hre.ethers.getContractFactory("LexipopMemoryNFT");

  // Deploy the contract
  console.log("📋 Deploying contract...");
  const nftContract = await LexipopMemoryNFT.deploy();

  // Wait for deployment
  await nftContract.waitForDeployment();

  const contractAddress = await nftContract.getAddress();
  console.log(`✅ LexipopMemoryNFT deployed to: ${contractAddress}`);

  // Verify contract on explorer (if not localhost)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await nftContract.deploymentTransaction().wait(6);

    console.log("🔍 Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Basescan");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  // Log deployment info
  console.log("\n📝 Deployment Summary:");
  console.log("Contract Name: LexipopMemoryNFT");
  console.log("Symbol: LEXMEM");
  console.log("Network:", hre.network.name);
  console.log("Contract Address:", contractAddress);
  console.log("Deployer:", await nftContract.runner.getAddress());

  // Add some sample data for testing
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    console.log("\n🧪 Minting test NFT...");
    const testWords = ["ESOTERIC", "RECALCITRANT", "PERSPICACIOUS", "DISPARATE", "CACOPHONY"];
    const mintFee = hre.ethers.parseEther("0.0001");
    const testTx = await nftContract.mintMemory(testWords, 500, 7, { value: mintFee });
    await testTx.wait();
    console.log("✅ Test NFT minted with 0.0001 ETH fee!");
  }

  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((address) => {
    console.log(`\n🎉 Deployment completed! Contract at: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });