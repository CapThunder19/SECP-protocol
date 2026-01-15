import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  const addresses = {
    borrow: "0xcbd1fad1307d2fa836860e2f90160f18ce7bd4c2" as const,
  };

  const Borrow = await viem.getContractAt("SECPBorrow", addresses.borrow);

  console.log("\n🧪 Simulating checkAndProtect call...\n");

  try {
    // Try to simulate the call
    const result = await publicClient.simulateContract({
      address: addresses.borrow,
      abi: Borrow.abi,
      functionName: 'checkAndProtect',
      account: '0x06cadb961ac800b4bc11f0e5e7c7634810972536',
    });
    
    console.log("✅ Simulation successful!");
    console.log("Result:", result);
  } catch (error: any) {
    console.log("❌ Simulation failed!\n");
    
    if (error.message) {
      console.log("Error message:", error.message);
    }
    
    // Extract revert reason
    if (error.cause?.reason) {
      console.log("\n🔴 Revert reason:", error.cause.reason);
    }
    
    if (error.shortMessage) {
      console.log("\nShort message:", error.shortMessage);
    }
    
    // Full error for debugging
    console.log("\nFull error:");
    console.log(JSON.stringify(error, null, 2));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
