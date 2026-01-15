import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();

  // Contract addresses from recent deployment
  const riskyAddr = "0x026b61b7795b434c97cc2c263fefc2e79fd2ef41";
  const safeAddr = "0xe7991ddffbc49fe06eb0c307c627e1264e4b55f3";
  const yieldAddr = "0x84b23dd15bf3e21f12ba29db635c5ce9fe81c345";
  const vaultAddr = "0x069f47749063d93180afb7a1e8589267a32d5a8a";
  const borrowAddr = "0xcd6c4ab855512f36d5c0b0ed9b2057293fd3d438";

  console.log("\n💰 Setting up collateral and loan...\n");

  const Risky = await viem.getContractAt("MockERC20", riskyAddr);
  const Safe = await viem.getContractAt("MockERC20", safeAddr);
  const Yield = await viem.getContractAt("MockERC20", yieldAddr);
  const Vault = await viem.getContractAt("SECPVault", vaultAddr);
  const Borrow = await viem.getContractAt("SECPBorrow", borrowAddr);

  // 1. Approve tokens
  console.log("1️⃣ Approving tokens...");
  const maxApproval = 10n ** 30n;
  await Risky.write.approve([vaultAddr, maxApproval]);
  await Safe.write.approve([vaultAddr, maxApproval]);
  await Yield.write.approve([vaultAddr, maxApproval]);
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
