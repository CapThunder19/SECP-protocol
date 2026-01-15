import { network } from "hardhat";
import * as fs from 'fs';

async function main() {
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();

  // Load addresses from deployment file
  const deploymentData = JSON.parse(fs.readFileSync('deployed-addresses.json', 'utf8'));
  const addresses = deploymentData.contracts;

  console.log("\n💰 Setting up collateral and loan...\n");

  const Risky = await viem.getContractAt("MockERC20", addresses.riskyToken);
  const Safe = await viem.getContractAt("MockERC20", addresses.safeToken);
  const Yield = await viem.getContractAt("MockERC20", addresses.yieldToken);
  const Vault = await viem.getContractAt("SECPVault", addresses.vault);
  const Borrow = await viem.getContractAt("SECPBorrow", addresses.borrow);

  // 1. Approve tokens
  console.log("1️⃣ Approving tokens...");
  const maxApproval = 10n ** 30n;
  await Risky.write.approve([addresses.vault, maxApproval]);
  await Safe.write.approve([addresses.vault, maxApproval]);
  await Yield.write.approve([addresses.vault, maxApproval]);
  console.log("  ✅ Tokens approved\n");

  // 2. Deposit collateral (1000 risky, 200 safe, 100 yield)
  console.log("2️⃣ Depositing collateral...");
  const depositRisky = 1000n * 10n ** 18n;
  const depositSafe = 200n * 10n ** 18n;
  const depositYield = 100n * 10n ** 18n;
  
  await Vault.write.deposit([depositRisky, depositSafe, depositYield]);
  console.log("  ✅ Deposited:");
  console.log("     - 1000 Risky tokens");
  console.log("     - 200 Safe tokens");
  console.log("     - 100 Yield tokens");
  console.log("     - Total: 1300 tokens\n");

  // 3. Take loan (500 tokens = ~260% collateral ratio)
  console.log("3️⃣ Taking loan...");
  const loanAmount = 500n * 10n ** 18n;
  await Borrow.write.takeLoan([loanAmount]);
  console.log("  ✅ Borrowed 500 tokens\n");

  // 4. Check status
  const debt = await Borrow.read.debt();
  const health = await Borrow.read.healthFactor();
  const totalValue = await Vault.read.totalValue();

  console.log("📊 Current Status:");
  console.log("  💵 Debt:", Number(debt / 10n ** 18n), "tokens");
  console.log("  💎 Collateral:", Number(totalValue / 10n ** 18n), "tokens");
  console.log("  ❤️  Health Factor:", Number(health) + "%");
  console.log("\n✅ Setup complete! Now you can:");
  console.log("  - View your position in the UI");
  console.log("  - Borrow more (if health > 150%)");
  console.log("  - Trigger protection when needed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
