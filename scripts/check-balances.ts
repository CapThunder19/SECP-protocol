import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  
  // Your wallet
  const wallet = "0x06cadb961ac800b4bc11f0e5e7c7634810972536";
  
  // Contract addresses
  const addresses = {
    riskyToken: "0xed079d45fbe7d2b6da6de6dbd9f3f4cecd2b774f" as const,
    safeToken: "0x6fbc4cad3cb1a7682c17b0f9ffebac63321dc2c6" as const,
    yieldToken: "0x4c1667e5c13016851bbc041ca8b9a721f60b85b9" as const,
    vault: "0xf79c766f5089117d3e3920c9020ab286cfe521b6" as const,
  };

  const Risky = await viem.getContractAt("MockERC20", addresses.riskyToken);
  const Safe = await viem.getContractAt("MockERC20", addresses.safeToken);
  const Yield = await viem.getContractAt("MockERC20", addresses.yieldToken);
  const Vault = await viem.getContractAt("SECPVault", addresses.vault);

  console.log("\n📊 Checking Balances for:", wallet);
  console.log("=".repeat(60));

  console.log("\n💰 Token Balances (in your wallet):");
  const riskyBal = await Risky.read.balanceOf([wallet]);
  const safeBal = await Safe.read.balanceOf([wallet]);
  const yieldBal = await Yield.read.balanceOf([wallet]);
  
  console.log("  💎 Risky:", Number(riskyBal / 10n ** 18n), "tokens");
  console.log("  🛡️  Safe:", Number(safeBal / 10n ** 18n), "tokens");
  console.log("  💰 Yield:", Number(yieldBal / 10n ** 18n), "tokens");

  console.log("\n🏦 Deposited in Vault:");
  const vaultRisky = await Vault.read.riskyBal();
  const vaultSafe = await Vault.read.safeBal();
  const vaultYield = await Vault.read.yieldBal();
  
  console.log("  💎 Risky:", Number(vaultRisky / 10n ** 18n), "tokens");
  console.log("  🛡️  Safe:", Number(vaultSafe / 10n ** 18n), "tokens");
  console.log("  💰 Yield:", Number(vaultYield / 10n ** 18n), "tokens");

  console.log("\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
