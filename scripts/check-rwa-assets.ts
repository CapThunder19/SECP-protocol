import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();

  const addresses = {
    borrow: "0x4151eca79712ec70f63408e0b44c8a8df0698426" as const,
  };

  const Borrow = await viem.getContractAt("SECPBorrow", addresses.borrow);

  try {
    const assetId0 = await Borrow.read.rwaAssetIds([0n]);
    console.log("✅ RWA Asset ID 0:", assetId0.toString());
    
    const assetId1 = await Borrow.read.rwaAssetIds([1n]);
    console.log("✅ RWA Asset ID 1:", assetId1.toString());
  } catch (error) {
    console.log("❌ No RWA assets registered yet!");
    console.log("   Click 'Register for Protection' button first!");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
