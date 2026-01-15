import { network } from "hardhat";

const VAULT = "0xa0fa71cba7361205b0e0db428ec0c51f8d9937cd";
const BORROW = "0xbed7cf7901215030751c4e5c3ac36e6acc33d51e";
const RISKY = "0x2910009bb55f0f1efc4408f1b794600ac529bcc3";
const SAFE  = "0x90c5f5af3086655d10e3daa70c97e8f605a333c8";
const YIELD = "0xc500240db43ef946eb0fed6c2f3c80a2d5195a8e";

async function main() {
  const { viem } = await network.connect();
  const [wallet] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  const vault = await viem.getContractAt("SECPVault", VAULT);
  const borrow = await viem.getContractAt("SECPBorrow", BORROW);

  const risky = await viem.getContractAt("MockERC20", RISKY);
  const safe = await viem.getContractAt("MockERC20", SAFE);
  const yieldT = await viem.getContractAt("MockERC20", YIELD);

  // Check if there's an existing loan and repay it first
  const existingDebt = await borrow.read.debt();
  if (existingDebt > 0n) {
    console.log(`\n💳 Repaying existing loan of ${Number(existingDebt) / 1e18} tokens...`);
    let hash = await borrow.write.repay([existingDebt]);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log("✅ Previous loan cleared");
  }

  // Smaller collateral, bigger loan to create risky position
  const collateral = 100n * 10n ** 18n;
  const loanAmount = 100n * 10n ** 18n; // 100 tokens loan!

  console.log("\n🔓 Approving tokens...");
  let hash = await risky.write.approve([VAULT, collateral]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Risky approved");

  hash = await safe.write.approve([VAULT, collateral]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Safe approved");

  hash = await yieldT.write.approve([VAULT, collateral]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Yield approved");

  console.log("\n📥 Depositing collateral...");
  // Less total value: 100 + 10 + 5 = 115 total (barely covers 100 loan!)
  hash = await vault.write.deposit([collateral, collateral / 10n, collateral / 20n]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Deposited");

  console.log("\n💰 Taking loan...");
  hash = await borrow.write.takeLoan([loanAmount]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Loan taken (100 tokens - RISKY!)");

  console.log("\n" + "=".repeat(60));
  console.log("📊 BEFORE PROTECTION:");
  console.log("=".repeat(60));
  const riskyBefore = await vault.read.riskyBal();
  const safeBefore = await vault.read.safeBal();
  const yieldBefore = await vault.read.yieldBal();
  const modeBefore = await vault.read.mode();
  const healthBefore = await borrow.read.healthFactor();
  
  console.log(`Risky:     ${riskyBefore} (${Number(riskyBefore) / 1e18} tokens)`);
  console.log(`Safe:      ${safeBefore} (${Number(safeBefore) / 1e18} tokens)`);
  console.log(`Yield:     ${yieldBefore} (${Number(yieldBefore) / 1e18} tokens)`);
  console.log(`Total:     ${Number(riskyBefore + safeBefore + yieldBefore) / 1e18} tokens`);
  console.log(`Mode:      ${modeBefore === 0 ? "NORMAL" : "CRASH"}`);
  console.log(`Health:    ${healthBefore}% ${healthBefore < 120n ? "⚠️ DANGER!" : "✅ Safe"}`);
  console.log(`Debt:      ${Number(loanAmount) / 1e18} tokens`);

  if (healthBefore >= 120n) {
    console.log("\n⚠️  Health factor too high! Protection won't trigger.");
    console.log("    Health needs to be < 120% to activate protection.");
    return;
  }

  console.log("\n🛑 Triggering anti-liquidation protection...");
  hash = await borrow.write.checkAndProtect();
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Protection activated!");

  console.log("\n" + "=".repeat(60));
  console.log("📊 AFTER PROTECTION:");
  console.log("=".repeat(60));
  const riskyAfter = await vault.read.riskyBal();
  const safeAfter = await vault.read.safeBal();
  const yieldAfter = await vault.read.yieldBal();
  const modeAfter = await vault.read.mode();
  const protectedMode = await borrow.read.protectedMode();

  console.log(`Risky:     ${riskyAfter} (${Number(riskyAfter) / 1e18} tokens)`);
  console.log(`Safe:      ${safeAfter} (${Number(safeAfter) / 1e18} tokens)`);
  console.log(`Yield:     ${yieldAfter} (${Number(yieldAfter) / 1e18} tokens)`);
  console.log(`Total:     ${Number(riskyAfter + safeAfter + yieldAfter) / 1e18} tokens`);
  console.log(`Mode:      ${modeAfter === 0 ? "NORMAL" : "CRASH"}`);
  console.log(`Protected: ${protectedMode}`);

  console.log("\n" + "=".repeat(60));
  console.log("🔄 CHANGES:");
  console.log("=".repeat(60));
  const riskyChange = Number(riskyAfter - riskyBefore) / 1e18;
  const safeChange = Number(safeAfter - safeBefore) / 1e18;
  const yieldChange = Number(yieldAfter - yieldBefore) / 1e18;
  
  console.log(`Risky:  ${riskyChange > 0 ? "+" : ""}${riskyChange} tokens`);
  console.log(`Safe:   ${safeChange > 0 ? "+" : ""}${safeChange} tokens`);
  console.log(`Yield:  ${yieldChange > 0 ? "+" : ""}${yieldChange} tokens`);
  console.log(`\n💡 50% of risky assets converted to safe assets!`);
  console.log(`💡 Yield diverted to protect the loan!`);
}

main().catch(console.error);
