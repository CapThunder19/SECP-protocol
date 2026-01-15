import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const [user] = await viem.getWalletClients();

  console.log("\n🔍 SECP Protocol Health Check\n");
  console.log("=" .repeat(60));
  
  // Contract addresses
  const addresses = {
    riskyToken: "0x026b61b7795b434c97cc2c263fefc2e79fd2ef41" as const,
    safeToken: "0xe7991ddffbc49fe06eb0c307c627e1264e4b55f3" as const,
    yieldToken: "0x84b23dd15bf3e21f12ba29db635c5ce9fe81c345" as const,
    vault: "0x069f47749063d93180afb7a1e8589267a32d5a8a" as const,
    borrow: "0xcd6c4ab855512f36d5c0b0ed9b2057293fd3d438" as const,
    rwa: "0x55bdafa6b9e7762684305615828a49589f4d7ee5" as const,
  };

  console.log("\n📍 Contract Addresses:");
  console.log("   Vault:  ", addresses.vault);
  console.log("   Borrow: ", addresses.borrow);
  console.log("   User:   ", user.account.address);

  // Get contracts
  const Vault = await viem.getContractAt("SECPVault", addresses.vault);
  const Borrow = await viem.getContractAt("SECPBorrow", addresses.borrow);
  const Risky = await viem.getContractAt("MockERC20", addresses.riskyToken);
  const Safe = await viem.getContractAt("MockERC20", addresses.safeToken);
  const Yield = await viem.getContractAt("MockERC20", addresses.yieldToken);

  console.log("\n💰 Your Token Balances:");
  const riskyBal = await Risky.read.balanceOf([user.account.address]);
  const safeBal = await Safe.read.balanceOf([user.account.address]);
  const yieldBal = await Yield.read.balanceOf([user.account.address]);
  console.log("   Risky: ", Number(riskyBal / 10n ** 18n), "tokens");
  console.log("   Safe:  ", Number(safeBal / 10n ** 18n), "tokens");
  console.log("   Yield: ", Number(yieldBal / 10n ** 18n), "tokens");

  console.log("\n📊 Vault Status:");
  const vaultRisky = await Vault.read.riskyBal();
  const vaultSafe = await Vault.read.safeBal();
  const vaultYield = await Vault.read.yieldBal();
  const vaultRWA = await Vault.read.rwaLockedValue();
  const totalValue = await Vault.read.totalValue();
  const mode = await Vault.read.mode();

  console.log("   Risky Assets:  ", Number(vaultRisky / 10n ** 18n), "tokens");
  console.log("   Safe Assets:   ", Number(vaultSafe / 10n ** 18n), "tokens");
  console.log("   Yield Assets:  ", Number(vaultYield / 10n ** 18n), "tokens");
  console.log("   RWA Locked:    ", Number(vaultRWA / 10n ** 18n), "tokens");
  console.log("   Total Value:   ", Number(totalValue / 10n ** 18n), "tokens");
  console.log("   Mode:          ", mode === 0 ? "🟢 NORMAL" : "🔴 CRASH");

  console.log("\n💳 Loan Status:");
  const debt = await Borrow.read.debt();
  const protectedMode = await Borrow.read.protectedMode();
  const rwaLocked = await Borrow.read.rwaLocked();
  
  console.log("   Debt:          ", Number(debt / 10n ** 18n), "tokens");
  console.log("   Protected:     ", protectedMode ? "✅ YES" : "❌ NO");
  console.log("   RWA Locked:    ", rwaLocked ? "✅ YES" : "❌ NO");
  
  if (debt > 0n) {
    const health = await Borrow.read.healthFactor();
    console.log("   Health Factor: ", Number(health) + "%");
    
    let healthStatus = "";
    if (Number(health) >= 200) healthStatus = "🟢 EXCELLENT";
    else if (Number(health) >= 150) healthStatus = "🟡 GOOD";
    else if (Number(health) >= 120) healthStatus = "🟠 WARNING";
    else healthStatus = "🔴 CRITICAL";
    
    console.log("   Status:        ", healthStatus);
  }

  console.log("\n" + "=".repeat(60));
  
  // Determine system status
  if (totalValue === 0n && debt === 0n) {
    console.log("\n❌ SECP NOT ACTIVE");
    console.log("\n📝 To test SECP:");
    console.log("   1. Run: npx hardhat run scripts/quick-setup.ts --network mantleSepolia");
    console.log("   2. Or use the frontend UI at http://localhost:3000");
    console.log("   3. Approve tokens → Deposit collateral → Take loan");
  } else if (totalValue > 0n && debt === 0n) {
    console.log("\n✅ SECP READY - Collateral deposited!");
    console.log("\n📝 Next step: Take a loan to test the system");
    console.log("   Max safe loan: ~", Number(totalValue * 66n / 100n / 10n ** 18n), "tokens");
  } else {
    console.log("\n✅ SECP ACTIVE - System is working!");
    console.log("\n📝 To test protection:");
    console.log("   1. Your health factor is:", Number(await Borrow.read.healthFactor()) + "%");
    console.log("   2. When it drops below 120%, protection auto-triggers");
    console.log("   3. Vault will rebalance risky → safe assets");
    console.log("   4. Yield will be diverted to cover debt");
  }

  console.log("\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
