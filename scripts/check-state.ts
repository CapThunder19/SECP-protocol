import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();

  console.log("\n📊 Checking Contract State\n");
  console.log("=".repeat(60));

  const addresses = {
    vault: "0xf79c766f5089117d3e3920c9020ab286cfe521b6" as const,
    borrow: "0x4151eca79712ec70f63408e0b44c8a8df0698426" as const,
  };

  const Vault = await viem.getContractAt("SECPVault", addresses.vault);
  const Borrow = await viem.getContractAt("SECPBorrow", addresses.borrow);

  // Check debt
  const debt = await Borrow.read.debt();
  console.log("Debt:", Number(debt) / 1e18, "tokens");

  // Check protected mode
  const protectedMode = await Borrow.read.protectedMode();
  console.log("Protected Mode:", protectedMode ? "YES ✅" : "NO ❌");

  // Check RWA locked
  const rwaLocked = await Borrow.read.rwaLocked();
  console.log("RWA Locked:", rwaLocked ? "YES ✅" : "NO ❌");

  // Check health factor
  const health = await Borrow.read.healthFactor();
  console.log("Health Factor:", Number(health) + "%");

  // Check vault mode
  const mode = await Vault.read.mode();
  console.log("Vault Mode:", mode === 0 ? "NORMAL 🟢" : "CRASH 🔴");

  // Check collateral
  const totalValue = await Vault.read.totalValue();
  console.log("Total Collateral:", Number(totalValue) / 1e18, "tokens");

  console.log("\n" + "=".repeat(60));

  if (debt === 0n) {
    console.log("\n⚠️  NO DEBT - You need to take a loan first!");
  }

  if (protectedMode) {
    console.log("\n⚠️  ALREADY PROTECTED - Use Reset button to test again!");
  }

  console.log();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
