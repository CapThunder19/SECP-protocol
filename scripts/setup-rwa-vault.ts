import { network } from "hardhat";

const RWA_ADDRESS = "0x9d73a7ab8b952bfb39aaef74843b01895b8e194f";
const VAULT_ADDRESS = "0xa9a96253175e35b7646affe39ea8bdd691862844";

async function main() {
  console.log("\n🔧 Setting up RWA -> Vault connection\n");
  
  const { viem } = await network.connect();
  const [wallet] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  const rwaAbi = [
    {
      inputs: [{ name: "_vault", type: "address" }],
      name: "setProtocolVault",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "protocolVault",
      outputs: [{ type: "address" }],
      stateMutability: "view",
      type: "function"
    }
  ] as const;

  const rwa = await viem.getContractAt(rwaAbi, RWA_ADDRESS);

  try {
    // Set vault
    const hash = await rwa.write.setProtocolVault([VAULT_ADDRESS as `0x${string}`]);
    console.log("Transaction hash:", hash);
    
    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    
    // Verify
    const vault = await rwa.read.protocolVault();
    console.log("\nProtocol vault set to:", vault);
    console.log("Expected:", VAULT_ADDRESS);
    console.log(vault.toLowerCase() === VAULT_ADDRESS.toLowerCase() ? "✅ Correct!" : "❌ Mismatch!");
    
  } catch (error: any) {
    console.log("⚠️  RPC error but transaction may have succeeded:", error.message);
    console.log("\nChecking if vault was set anyway...");
    
    try {
      const vault = await rwa.read.protocolVault();
      console.log("Protocol vault:", vault);
      console.log("Expected:", VAULT_ADDRESS);
      console.log(vault.toLowerCase() === VAULT_ADDRESS.toLowerCase() ? "✅ Already set correctly!" : "❌ Not set");
    } catch (e) {
      console.log("Could not verify");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
