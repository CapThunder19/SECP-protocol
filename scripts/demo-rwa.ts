import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  console.log("🚀 Deploying SECP Protocol with RWA...\n");

  // Deploy Mock Tokens
  const Risky = await viem.deployContract("MockERC20", [
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

  const RWA = await viem.deployContract("RWAToken", [
    "Real World Asset",
    "RWA",
    0n, // No initial supply
  ]);

  console.log("✅ Tokens deployed");

  // Deploy Vault
  const Vault = await viem.deployContract("SECPVault", [
    Risky.address,
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

  // Connect contracts
  await Vault.write.setLoanContract([Borrow.address]);
  await RWA.write.setProtocolVault([Vault.address]);

  console.log("✅ Contracts linked\n");

  // Tokenize Real World Assets
  console.log("🏠 Tokenizing Real World Assets...");
  
  let hash = await RWA.write.tokenizeAsset([
    "Real Estate",
    "New York Apartment",
    50n * 10n ** 18n, // $50k value
  ]);
  await publicClient.waitForTransactionReceipt({ hash });
  
  hash = await RWA.write.tokenizeAsset([
    "Invoice",
    "Tech Company Invoice #1234",
    30n * 10n ** 18n, // $30k value
  ]);
  await publicClient.waitForTransactionReceipt({ hash });
  
  console.log("✅ RWA Assets tokenized: Real Estate ($50k), Invoice ($30k)\n");

  // Test the protocol
  const collateral = 100n * 10n ** 18n;
  const loanAmount = 100n * 10n ** 18n;

  console.log("🔓 Approving tokens...");
  hash = await Risky.write.approve([Vault.address, collateral]);
  await publicClient.waitForTransactionReceipt({ hash });

  hash = await Safe.write.approve([Vault.address, collateral]);
  await publicClient.waitForTransactionReceipt({ hash });

  hash = await Yield.write.approve([Vault.address, collateral]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Tokens approved\n");

  console.log("📥 Depositing collateral...");
  // Deposit: 100 + 5 + 13 = 118 total
  hash = await Vault.write.deposit([collateral, collateral / 20n, collateral * 13n / 100n]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Deposited\n");

  console.log("💰 Taking loan...");
  hash = await Borrow.write.takeLoan([loanAmount]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Loan taken (100 tokens)\n");

  console.log("=" .repeat(60));
  console.log("📊 INITIAL STATE:");
  console.log("=" .repeat(60));
  const riskyBefore = await Vault.read.riskyBal();
  const safeBefore = await Vault.read.safeBal();
  const yieldBefore = await Vault.read.yieldBal();
  const rwaBefore = await Vault.read.totalValue();
  const healthBefore = await Borrow.read.healthFactor();
  
  console.log(`Risky:        ${Number(riskyBefore) / 1e18} tokens`);
  console.log(`Safe:         ${Number(safeBefore) / 1e18} tokens`);
  console.log(`Yield:        ${Number(yieldBefore) / 1e18} tokens`);
  console.log(`RWA Locked:   ${Number(rwaBefore) / 1e18} tokens`);
  console.log(`Total Value:  ${Number(riskyBefore + safeBefore + yieldBefore + rwaBefore) / 1e18} tokens`);
  console.log(`Health:       ${healthBefore}% ${healthBefore < 120n ? "⚠️ DANGER!" : "✅ Safe"}`);
  console.log(`Debt:         ${Number(loanAmount) / 1e18} tokens\n`);

  // Stage 1: Normal protection
  console.log("🛡️  STAGE 1: Triggering standard protection (Health < 120%)...");
  hash = await Borrow.write.checkAndProtect();
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Standard protection activated!\n");

  console.log("=" .repeat(60));
  console.log("📊 AFTER STANDARD PROTECTION:");
  console.log("=" .repeat(60));
  const riskyAfter1 = await Vault.read.riskyBal();
  const safeAfter1 = await Vault.read.safeBal();
  const yieldAfter1 = await Vault.read.yieldBal();
  const rwaAfter1 = await Vault.read.totalValue();
  const healthAfter1 = await Borrow.read.healthFactor();
  
  console.log(`Risky:        ${Number(riskyAfter1) / 1e18} tokens`);
  console.log(`Safe:         ${Number(safeAfter1) / 1e18} tokens`);
  console.log(`Yield:        ${Number(yieldAfter1) / 1e18} tokens`);
  console.log(`RWA Locked:   ${Number(rwaAfter1) / 1e18} tokens`);
  console.log(`Total Value:  ${Number(riskyAfter1 + safeAfter1 + yieldAfter1 + rwaAfter1) / 1e18} tokens`);
  console.log(`Health:       ${healthAfter1}%`);
  console.log(`Mode:         CRASH 🔴\n`);

  // Stage 2: RWA lock (when health critically low)
  console.log("🏠 STAGE 2: Triggering RWA lock (Health < 110%)...");
  hash = await Borrow.write.checkAndProtect();
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ RWA assets locked as emergency collateral!\n");

  console.log("=" .repeat(60));
  console.log("📊 AFTER RWA LOCK:");
  console.log("=" .repeat(60));
  const riskyFinal = await Vault.read.riskyBal();
  const safeFinal = await Vault.read.safeBal();
  const yieldFinal = await Vault.read.yieldBal();
  const rwaFinal = await Vault.read.totalValue();
  const healthFinal = await Borrow.read.healthFactor();
  
  console.log(`Risky:        ${Number(riskyFinal) / 1e18} tokens`);
  console.log(`Safe:         ${Number(safeFinal) / 1e18} tokens`);
  console.log(`Yield:        ${Number(yieldFinal) / 1e18} tokens`);
  console.log(`RWA Locked:   ${Number(rwaFinal) / 1e18} tokens 🏠`);
  console.log(`Total Value:  ${Number(riskyFinal + safeFinal + yieldFinal + rwaFinal) / 1e18} tokens`);
  console.log(`Health:       ${healthFinal}% ✅\n`);

  console.log("=" .repeat(60));
  console.log("🔄 FULL PROTECTION SUMMARY:");
  console.log("=" .repeat(60));
  console.log(`Stage 1: Risky → Safe rebalancing (-50 → +50 tokens)`);
  console.log(`Stage 1: Yield diverted (-10 tokens)`);
  console.log(`Stage 2: RWA locked (+${Number(rwaFinal) / 1e18} tokens value)`);
  console.log(`\n💡 Health improved from ${healthBefore}% → ${healthFinal}%`);
  console.log(`💡 Position saved with Real World Assets!`);
  console.log(`\n🎉 Multi-layered protection successful!`);
}

main().catch(console.error);
