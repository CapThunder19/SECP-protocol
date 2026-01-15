import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();

  console.log("\n🔧 Checking Vault <-> Borrow Connection\n");
  console.log("=".repeat(60));

  // Contract addresses (latest deployment)
  const addresses = {
    vault: "0x6a0b0f14a3b685bb2896d0359d4145de12fd6992" as const,
    borrow: "0xc0992c861d844db9c8f78bd5bfb45eb8228d4ae1" as const,
  };

  const Vault = await viem.getContractAt("SECPVault", addresses.vault);
  const Borrow = await viem.getContractAt("SECPBorrow", addresses.borrow);

  // Check current loan contract
  const currentLoanContract = await Vault.read.loanContract();
  console.log("Current loan contract:", currentLoanContract);
  console.log("Expected (Borrow)  :", addresses.borrow);
  
  if (currentLoanContract.toLowerCase() === addresses.borrow.toLowerCase()) {
    console.log("\n✅ Vault is correctly connected to Borrow contract!");
  } else if (currentLoanContract === "0x0000000000000000000000000000000000000000") {
    console.log("\n⚠️  Vault has NO loan contract set!");
    console.log("🔧 Setting Borrow contract now...");
    
    try {
      await Vault.write.setLoanContract([addresses.borrow]);
      console.log("✅ Loan contract set successfully!");
      
      // Verify
      const newLoanContract = await Vault.read.loanContract();
      console.log("New loan contract:", newLoanContract);
    } catch (error: any) {
      console.error("❌ Failed to set loan contract:", error.message);
    }
  } else {
    console.log("\n⚠️  Vault is connected to a DIFFERENT contract!");
    console.log("This might be from an old deployment.");
  }

  console.log("\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
