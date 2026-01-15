import { network } from "hardhat";

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  console.log("Deploying with:", deployer.account.address);

  // ========== Deploy Mock Tokens ==========
  const Mock = await viem.deployContract("MockERC20", [
    "Risky Asset",
    "RISK",
    10n ** 22n, // 10,000 tokens
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
    10n ** 22n,
  ]);

  console.log("Risky:", Mock.address);
  console.log("Safe :", Safe.address);
  console.log("Yield:", Yield.address);
  console.log("RWA  :", RWA.address);

  // ========== Deploy Vault ==========
  const Vault = await viem.deployContract("SECPVault", [
    Mock.address,
    Safe.address,
    Yield.address,
    RWA.address,
  ]);

  console.log("Vault:", Vault.address);

  // ========== Deploy Borrow Engine ==========
  const Borrow = await viem.deployContract("SECPBorrow", [
    Vault.address,
  ]);

  console.log("Borrow:", Borrow.address);

  // ========== Connect vault <-> loan ==========
  console.log("\nLinking contracts...");
  await sleep(2000);
  
  const hash1 = await Vault.write.setLoanContract([Borrow.address]);
  await publicClient.waitForTransactionReceipt({ hash: hash1 });
  console.log("Vault linked to Borrow contract");
  
  await sleep(2000);
  
  const hash2 = await RWA.write.setProtocolVault([Vault.address]);
  await publicClient.waitForTransactionReceipt({ hash: hash2 });
  console.log("RWA linked to Vault");

  // Save deployment info
  const fs = await import('fs');
  const deploymentInfo = {
    network: "mantleSepolia",
    chainId: 5003,
    deployer: deployer.account.address,
    contracts: {
      riskyToken: Mock.address,
      safeToken: Safe.address,
      yieldToken: Yield.address,
      rwaToken: RWA.address,
      vault: Vault.address,
      borrow: Borrow.address,
    },
    explorer: {
      riskyToken: `https://explorer.sepolia.mantle.xyz/address/${Mock.address}`,
      safeToken: `https://explorer.sepolia.mantle.xyz/address/${Safe.address}`,
      yieldToken: `https://explorer.sepolia.mantle.xyz/address/${Yield.address}`,
      rwaToken: `https://explorer.sepolia.mantle.xyz/address/${RWA.address}`,
      vault: `https://explorer.sepolia.mantle.xyz/address/${Vault.address}`,
      borrow: `https://explorer.sepolia.mantle.xyz/address/${Borrow.address}`,
    }
  };

  fs.writeFileSync(
    'deployed-addresses.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n🎉 SECP deployed successfully!");
  console.log("\n📝 Deployment info saved to deployed-addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
