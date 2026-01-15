import { network } from "hardhat";
import { parseEther } from "viem";

async function main() {
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();

  console.log("\n💸 Transferring Test Tokens\n");
  console.log("=".repeat(60));

  const userWallet = "0x06cadb961ac800b4bc11f0e5e7c7634810972536";
  const amount = parseEther("10000");

  const addresses = {
    riskyToken: "0x3b7290c0230821552a90c2248d2517d7e79c25df" as const,
    safeToken: "0xa1d49c8fbf21ace761172362bc0184320b5c21dd" as const,
    yieldToken: "0x7306cbcfbe97fae9e1aecb7a220f3ec87eff2745" as const,
  };

  const Risky = await viem.getContractAt("MockERC20", addresses.riskyToken);
  const Safe = await viem.getContractAt("MockERC20", addresses.safeToken);
  const Yield = await viem.getContractAt("MockERC20", addresses.yieldToken);

  console.log(`Transferring 10,000 of each token to ${userWallet}...\n`);

  await Risky.write.transfer([userWallet, amount]);
  console.log("✅ Transferred 10,000 Risky tokens");

  await Safe.write.transfer([userWallet, amount]);
  console.log("✅ Transferred 10,000 Safe tokens");

  await Yield.write.transfer([userWallet, amount]);
  console.log("✅ Transferred 10,000 Yield tokens");

  console.log("\n🎉 All tokens transferred successfully!");
  console.log("\nCheck balances:");
  
  const riskyBal = await Risky.read.balanceOf([userWallet]);
  const safeBal = await Safe.read.balanceOf([userWallet]);
  const yieldBal = await Yield.read.balanceOf([userWallet]);
  
  console.log(`  Risky: ${Number(riskyBal) / 1e18}`);
  console.log(`  Safe : ${Number(safeBal) / 1e18}`);
  console.log(`  Yield: ${Number(yieldBal) / 1e18}`);
  console.log();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
