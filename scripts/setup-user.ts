import { network } from "hardhat";
import fs from "fs";

async function main() {
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();

  // Load deployed addresses
  const deployed = JSON.parse(fs.readFileSync('deployed-addresses.json', 'utf8'));
  
  const riskyToken = deployed.contracts.riskyToken;
  const safeToken = deployed.contracts.safeToken;
  const yieldToken = deployed.contracts.yieldToken;
  const vault = deployed.contracts.vault;

  console.log("\n🎁 Setting up user with tokens...\n");
  console.log("User address:", deployer.account.address);

  // Get contracts
  const Risky = await viem.getContractAt("MockERC20", riskyToken);
  const Safe = await viem.getContractAt("MockERC20", safeToken);
  const Yield = await viem.getContractAt("MockERC20", yieldToken);

  // Check balances
  const riskyBal = await Risky.read.balanceOf([deployer.account.address]);
  const safeBal = await Safe.read.balanceOf([deployer.account.address]);
  const yieldBal = await Yield.read.balanceOf([deployer.account.address]);

  console.log("Current balances:");
  console.log("  Risky:", riskyBal / 10n ** 18n, "tokens");
  console.log("  Safe:", safeBal / 10n ** 18n, "tokens");
  console.log("  Yield:", yieldBal / 10n ** 18n, "tokens");

  // Approve vault to spend tokens
  console.log("\n✅ Approving vault to spend tokens...");
  
  const maxApproval = 10n ** 30n; // Very large number
  
  await Risky.write.approve([vault, maxApproval]);
  console.log("  ✓ Risky token approved");
  
  await Safe.write.approve([vault, maxApproval]);
  console.log("  ✓ Safe token approved");
  
  await Yield.write.approve([vault, maxApproval]);
  console.log("  ✓ Yield token approved");

  console.log("\n🎉 Setup complete! You can now:");
  console.log("  1. Deposit collateral to the vault");
  console.log("  2. Take a loan (max ~" + (riskyBal * 66n / 100n / 10n ** 18n) + " tokens at 150% collateral ratio)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
