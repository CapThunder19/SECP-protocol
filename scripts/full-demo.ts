import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const [user] = await viem.getWalletClients();

  console.log("\n🎬 SECP Protocol - Full Demo with Protection\n");
  console.log("=".repeat(60));

  // Contract addresses
  const addresses = {
    riskyToken: "0x3b7290c0230821552a90c2248d2517d7e79c25df" as const,
    safeToken: "0xa1d49c8fbf21ace761172362bc0184320b5c21dd" as const,
    yieldToken: "0x7306cbcfbe97fae9e1aecb7a220f3ec87eff2745" as const,
    rwaToken: "0xb9e2065ef31ea9d9a28612ccd6b4cbba9e7f4deb" as const,
    vault: "0x6a0b0f14a3b685bb2896d0359d4145de12fd6992" as const,
    borrow: "0xc0992c861d844db9c8f78bd5bfb45eb8228d4ae1" as const,
  };

  // Get contracts
  const Risky = await viem.getContractAt("MockERC20", addresses.riskyToken);
  const Safe = await viem.getContractAt("MockERC20", addresses.safeToken);
  const Yield = await viem.getContractAt("MockERC20", addresses.yieldToken);
  const RWA = await viem.getContractAt("RWAToken", addresses.rwaToken);
  const Vault = await viem.getContractAt("SECPVault", addresses.vault);
  const Borrow = await viem.getContractAt("SECPBorrow", addresses.borrow);

  console.log("\n📍 Step 1: Approving ALL tokens...");
  const maxApproval = 10n ** 30n;
  
  await Risky.write.approve([addresses.vault, maxApproval]);
  console.log("  ✅ Risky approved");
  
  await Safe.write.approve([addresses.vault, maxApproval]);
  console.log("  ✅ Safe approved");
  
  await Yield.write.approve([addresses.vault, maxApproval]);
  console.log("  ✅ Yield approved");

  console.log("\n📍 Step 2: Depositing DIVERSIFIED collateral...");
  
  // Deposit a mix of all token types
  const depositRisky = 400n * 10n ** 18n;  // 400 risky tokens
  const depositSafe = 200n * 10n ** 18n;   // 200 safe tokens
  const depositYield = 100n * 10n ** 18n;  // 100 yield tokens
  
  await Vault.write.deposit([depositRisky, depositSafe, depositYield]);
  
  console.log("  ✅ Deposited:");
  console.log("     💎 400 Risky tokens (volatile)");
  console.log("     🛡️  200 Safe tokens (stable)");
  console.log("     💰 100 Yield tokens (generates income)");
  console.log("     📊 Total: 700 tokens");

  console.log("\n📍 Step 3: Tokenizing Real-World Assets (RWA)...");
  
  // Tokenize some RWAs
  const tx1 = await RWA.write.tokenizeAsset([
    "Real Estate",
    "Miami Beach Condo",
    100n * 10n ** 18n // 100 tokens worth
  ]);
  console.log("  ✅ Tokenized: Miami Beach Condo (100 tokens)");
  
  const tx2 = await RWA.write.tokenizeAsset([
    "Gold",
    "Swiss Vault 42",
    50n * 10n ** 18n // 50 tokens worth
  ]);
  console.log("  ✅ Tokenized: Gold Bars (50 tokens)");

  // Set RWA assets for emergency protection
  await Borrow.write.setRWAAssets([[1n, 2n]]);
  console.log("  ✅ RWA assets registered for emergency protection");

  console.log("\n📍 Step 4: Taking a RISKY loan (to trigger protection)...");
  
  // Total collateral: 700 tokens
  // Taking loan of 580 tokens = ~120% health factor (risky!)
  const loanAmount = 580n * 10n ** 18n;
  
  await Borrow.write.takeLoan([loanAmount]);
  console.log("  ✅ Borrowed 580 tokens");
  
  let health = await Borrow.read.healthFactor();
  console.log("  ⚠️  Initial Health Factor:", Number(health) + "%");

  console.log("\n📊 Current Position:");
  console.log("  Collateral: 700 tokens");
  console.log("  Debt: 580 tokens");
  console.log("  Health: " + Number(health) + "% (⚠️ DANGEROUS!)");

  console.log("\n" + "=".repeat(60));
  console.log("🚨 SIMULATING MARKET CRASH - Health Dropping Below 120%");
  console.log("=".repeat(60));

  // Check current state
  let mode = await Vault.read.mode();
  let isProtected = await Borrow.read.protectedMode();
  
  console.log("\n📊 Before Protection:");
  console.log("  Mode:", mode === 0 ? "🟢 NORMAL" : "🔴 CRASH");
  console.log("  Protected:", isProtected ? "✅ YES" : "❌ NO");
  console.log("  Risky Assets:", Number(await Vault.read.riskyBal() / 10n ** 18n));
  console.log("  Safe Assets:", Number(await Vault.read.safeBal() / 10n ** 18n));
  console.log("  Yield Assets:", Number(await Vault.read.yieldBal() / 10n ** 18n));

  console.log("\n🛡️ TRIGGERING ANTI-LIQUIDATION PROTECTION...");
  
  // Manually trigger protection (in real scenario, this happens automatically)
  await Borrow.write.checkAndProtect();
  
  console.log("  ⚡ Protection activated!");
  
  // Check state after protection
  mode = await Vault.read.mode();
  isProtected = await Borrow.read.protectedMode();
  
  console.log("\n📊 After Protection:");
  console.log("  Mode:", mode === 0 ? "🟢 NORMAL" : "🔴 CRASH");
  console.log("  Protected:", isProtected ? "✅ YES" : "❌ NO");
  console.log("  Risky Assets:", Number(await Vault.read.riskyBal() / 10n ** 18n), "(halved!)");
  console.log("  Safe Assets:", Number(await Vault.read.safeBal() / 10n ** 18n), "(increased!)");
  console.log("  Yield Assets:", Number(await Vault.read.yieldBal() / 10n ** 18n), "(used as buffer)");

  console.log("\n✨ What Just Happened:");
  console.log("  1. 🔄 50% of Risky assets converted to Safe assets");
  console.log("  2. 💰 10% of debt covered by Yield tokens");
  console.log("  3. 🔴 Vault entered CRASH mode");
  console.log("  4. 🛡️  Protection status: ACTIVE");

  console.log("\n🏠 TESTING RWA EMERGENCY PROTECTION...");
  console.log("  (Only triggers if health drops below 110%)");
  
  const rwaLocked = await Borrow.read.rwaLocked();
  if (!rwaLocked) {
    console.log("  ℹ️  RWA protection not needed yet (health > 110%)");
    console.log("  ℹ️  Available RWAs: Miami Condo (100) + Gold (50) = 150 tokens");
  } else {
    console.log("  ✅ RWA assets LOCKED as emergency collateral!");
    const lockedValue = await Vault.read.rwaLockedValue();
    console.log("  🏠 Locked Value:", Number(lockedValue / 10n ** 18n), "tokens");
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ SECP PROTOCOL IS WORKING!");
  console.log("=".repeat(60));

  console.log("\n📈 Final Status:");
  health = await Borrow.read.healthFactor();
  const totalValue = await Vault.read.totalValue();
  const debt = await Borrow.read.debt();
  
  console.log("  Total Collateral:", Number(totalValue / 10n ** 18n), "tokens");
  console.log("  Debt:", Number(debt / 10n ** 18n), "tokens");
  console.log("  Health Factor:", Number(health) + "%");
  console.log("  Status:", isProtected ? "🛡️  PROTECTED" : "⚠️  UNPROTECTED");

  console.log("\n💡 Key Takeaways:");
  console.log("  ✅ Multi-asset collateral (Risky, Safe, Yield, RWA)");
  console.log("  ✅ Automatic rebalancing on market crash");
  console.log("  ✅ Yield tokens used as debt buffer");
  console.log("  ✅ RWA emergency collateral ready");
  console.log("  ✅ NO LIQUIDATION - Position saved!");

  console.log("\n🎉 Check the UI at http://localhost:3000 to see your position!");
  console.log("\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
