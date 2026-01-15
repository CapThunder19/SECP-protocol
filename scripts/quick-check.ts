import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();

  const addresses = {
    vault: "0xf79c766f5089117d3e3920c9020ab286cfe521b6" as const,
    borrow: "0x4151eca79712ec70f63408e0b44c8a8df0698426" as const,
  };

  const Vault = await viem.getContractAt("SECPVault", addresses.vault);
  const Borrow = await viem.getContractAt("SECPBorrow", addresses.borrow);

  console.log("\n🔍 Quick Check\n");
  console.log("=".repeat(60));

  // Check vault's loan contract
  const loanContract = await Vault.read.loanContract();
  console.log("Vault's loan contract:", loanContract);
  console.log("Expected (Borrow)   :", addresses.borrow);
  console.log("Match:", loanContract.toLowerCase() === addresses.borrow.toLowerCase() ? "✅ YES" : "❌ NO");
  
  console.log();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
