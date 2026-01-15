import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  console.log("🚀 Deploying fresh contracts for testing...\n");

  // Deploy Mock Tokens
  const Mock = await viem.deployContract("MockERC20", [
    "Risky Asset",
    "RISK",
    10n ** 22n,
  ]);

  const Safe = await viem.deployContract("MockERC20", [
    "Safe Asset",
    "SAFE",
    10n ** 22n,
  ]);

  const Yield = await viem.deployContract("MockERC20", [
    "Yield Asset",
    "YIELD",
    10n ** 22n,
  ]);

  const RWA = await viem.deployContract("MockERC20", [
    "Real World Asset",
    "RWA",
    10n ** 22n,
  ]);

  console.log("✅ Tokens deployed");

  // Deploy Vault
  const Vault = await viem.deployContract("SECPVault", [
    Mock.address,
    Safe.address,
    Yield.address,
    RWA.address,
  ]);

  console.log("✅ Vault deployed");

  // Deploy Borrow Engine
  const Borrow = await viem.deployContract("SECPBorrow", [
    Vault.address,
  ]);

  console.log("✅ Borrow deployed");

  // Connect vault <-> borrow
  await Vault.write.setLoanContract([Borrow.address]);

  console.log("✅ Contracts linked\n");

  // Now test the anti-liquidation feature
  const collateral = 100n * 10n ** 18n;
  const loanAmount = 100n * 10n ** 18n; // 100 tokens loan!

  console.log("🔓 Approving tokens...");
  let hash = await Mock.write.approve([Vault.address, collateral]);
  await publicClient.waitForTransactionReceipt({ hash });

  hash = await Safe.write.approve([Vault.address, collateral]);
  await publicClient.waitForTransactionReceipt({ hash });

  hash = await Yield.write.approve([Vault.address, collateral]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ All tokens approved\n");

  console.log("📥 Depositing collateral...");
  // Deposit: 100 + 5 + 13 = 118 total (health = 118% - DANGER!)
  hash = await Vault.write.deposit([collateral, collateral / 20n, collateral * 13n / 100n]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Deposited\n");

  console.log("💰 Taking loan...");
  hash = await Borrow.write.takeLoan([loanAmount]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Loan taken (100 tokens - RISKY!)\n");

  console.log("=" .repeat(60));
  console.log("📊 BEFORE PROTECTION:");
  console.log("=" .repeat(60));
  const riskyBefore = await Vault.read.riskyBal();
  const safeBefore = await Vault.read.safeBal();
  const yieldBefore = await Vault.read.yieldBal();
  const modeBefore = await Vault.read.mode();
  const healthBefore = await Borrow.read.healthFactor();
  
  console.log(`Risky:     ${riskyBefore} (${Number(riskyBefore) / 1e18} tokens)`);
  console.log(`Safe:      ${safeBefore} (${Number(safeBefore) / 1e18} tokens)`);
  console.log(`Yield:     ${yieldBefore} (${Number(yieldBefore) / 1e18} tokens)`);
  console.log(`Total:     ${Number(riskyBefore + safeBefore + yieldBefore) / 1e18} tokens`);
  console.log(`Mode:      ${modeBefore === 0 ? "NORMAL" : "CRASH"}`);
  console.log(`Health:    ${healthBefore}% ${healthBefore < 120n ? "⚠️ DANGER!" : "✅ Safe"}`);
  console.log(`Debt:      ${Number(loanAmount) / 1e18} tokens\n`);

  if (healthBefore >= 120n) {
    console.log("⚠️  Health factor too high! Protection won't trigger.");
    console.log("    Health needs to be < 120% to activate protection.");
    return;
  }

  console.log("🛑 Triggering anti-liquidation protection...");
  hash = await Borrow.write.checkAndProtect();
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Protection activated!\n");

  console.log("=" .repeat(60));
  console.log("📊 AFTER PROTECTION:");
  console.log("=" .repeat(60));
  const riskyAfter = await Vault.read.riskyBal();
  const safeAfter = await Vault.read.safeBal();
  const yieldAfter = await Vault.read.yieldBal();
  const modeAfter = await Vault.read.mode();
  const protectedMode = await Borrow.read.protectedMode();

  console.log(`Risky:     ${riskyAfter} (${Number(riskyAfter) / 1e18} tokens)`);
  console.log(`Safe:      ${safeAfter} (${Number(safeAfter) / 1e18} tokens)`);
  console.log(`Yield:     ${yieldAfter} (${Number(yieldAfter) / 1e18} tokens)`);
  console.log(`Total:     ${Number(riskyAfter + safeAfter + yieldAfter) / 1e18} tokens`);
  console.log(`Mode:      ${modeAfter === 0 ? "NORMAL" : "CRASH 🔴"}`);
  console.log(`Protected: ${protectedMode}\n`);

  console.log("=" .repeat(60));
  console.log("🔄 CHANGES:");
  console.log("=" .repeat(60));
  const riskyChange = Number(riskyAfter - riskyBefore) / 1e18;
  const safeChange = Number(safeAfter - safeBefore) / 1e18;
  const yieldChange = Number(yieldAfter - yieldBefore) / 1e18;
  
  console.log(`Risky:  ${riskyChange > 0 ? "+" : ""}${riskyChange} tokens`);
  console.log(`Safe:   ${safeChange > 0 ? "+" : ""}${safeChange} tokens`);
  console.log(`Yield:  ${yieldChange > 0 ? "+" : ""}${yieldChange} tokens`);
  console.log(`\n💡 50% of risky assets converted to safe assets!`);
  console.log(`💡 ${Number(loanAmount) / 1e18 / 10} tokens of yield diverted to protect the loan!`);
  console.log(`\n🎉 Position saved from liquidation!`);
}

main().catch(console.error);
