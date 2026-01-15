import { network } from "hardhat";

const VAULT = "0xa0fa71cba7361205b0e0db428ec0c51f8d9937cd";
const BORROW = "0xbed7cf7901215030751c4e5c3ac36e6acc33d51e";
const RISKY = "0x2910009bb55f0f1efc4408f1b794600ac529bcc3";
const SAFE  = "0x90c5f5af3086655d10e3daa70c97e8f605a333c8";
const YIELD = "0xc500240db43ef946eb0fed6c2f3c80a2d5195a8e";

async function main() {
  const { viem } = await network.connect();
  const [wallet] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  const vault = await viem.getContractAt("SECPVault", VAULT);
  const borrow = await viem.getContractAt("SECPBorrow", BORROW);

  const risky = await viem.getContractAt("MockERC20", RISKY);
  const safe = await viem.getContractAt("MockERC20", SAFE);
  const yieldT = await viem.getContractAt("MockERC20", YIELD);

  const amount = 100n * 10n ** 18n;

  console.log("\n🔓 Approving tokens...");
  let hash = await risky.write.approve([VAULT, amount]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Risky approved");

  hash = await safe.write.approve([VAULT, amount]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Safe approved");

  hash = await yieldT.write.approve([VAULT, amount]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Yield approved");

  console.log("\n📥 Depositing collateral...");
  hash = await vault.write.deposit([amount, amount / 2n, amount / 4n]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Deposited");

  console.log("\n💰 Taking loan...");
  hash = await borrow.write.takeLoan([amount / 2n]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Loan taken");

  console.log("\n📊 BEFORE protection:");
  console.log("Risky:", await vault.read.riskyBal());
  console.log("Safe :", await vault.read.safeBal());
  console.log("Yield:", await vault.read.yieldBal());
  console.log("Mode :", await vault.read.mode());
  console.log("Health:", await borrow.read.healthFactor());

  console.log("\n🛑 Triggering protection...");
  hash = await borrow.write.checkAndProtect();
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ Protection triggered");

  console.log("\n📊 AFTER protection:");
  console.log("Risky:", await vault.read.riskyBal());
  console.log("Safe :", await vault.read.safeBal());
  console.log("Yield:", await vault.read.yieldBal());
  console.log("Mode :", await vault.read.mode());
  console.log("Protected:", await borrow.read.protectedMode());
}

main().catch(console.error);
