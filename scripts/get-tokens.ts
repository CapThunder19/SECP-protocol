import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();

  console.log("\n💰 Transferring Test Tokens to Your Wallet\n");
  
  // Your wallet address (change this to your actual address)
  const YOUR_WALLET = "0x06cadb961ac800b4bc11f0e5e7c7634810972536";
  
  console.log("From:", deployer.account.address);
  console.log("To  :", YOUR_WALLET);
  console.log("=".repeat(60));

  // Contract addresses (latest deployment)
  const addresses = {
    riskyToken: "0xf670e53e9b05057914054a7e1d058b1b45d6480e" as const,
    safeToken: "0x1924777d6eff2ba2c09049b5d5ebf492d77a9295" as const,
    yieldToken: "0x95b83f921e0b90f19e616ad7d66265e427d3697b" as const,
  };

  // Get contracts
  const Risky = await viem.getContractAt("MockERC20", addresses.riskyToken);
  const Safe = await viem.getContractAt("MockERC20", addresses.safeToken);
  const Yield = await viem.getContractAt("MockERC20", addresses.yieldToken);

  console.log("\n🪙 Transferring tokens...");
  
  // Transfer 5,000 of each token
  const amount = 5000n * 10n ** 18n;
  
  await Risky.write.transfer([YOUR_WALLET, amount]);
  console.log("  ✅ Transferred 5,000 Risky tokens");
  
  await Safe.write.transfer([YOUR_WALLET, amount]);
  console.log("  ✅ Transferred 5,000 Safe tokens");
  
  await Yield.write.transfer([YOUR_WALLET, amount]);
  console.log("  ✅ Transferred 5,000 Yield tokens");

  console.log("\n📊 Your Token Balances:");
  
  const riskyBal = await Risky.read.balanceOf([YOUR_WALLET]);
  const safeBal = await Safe.read.balanceOf([YOUR_WALLET]);
  const yieldBal = await Yield.read.balanceOf([YOUR_WALLET]);
  
  console.log("  💎 Risky:", Number(riskyBal / 10n ** 18n), "tokens");
  console.log("  🛡️  Safe:", Number(safeBal / 10n ** 18n), "tokens");
  console.log("  💰 Yield:", Number(yieldBal / 10n ** 18n), "tokens");

  console.log("\n✅ Done! Refresh your frontend and you should see these tokens.\n");
  console.log("🎯 Now you can deposit them using the UI!\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
