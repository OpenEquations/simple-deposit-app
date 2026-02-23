async function main() {

  const Deposit = await ethers.getContractFactory("Deposit");

  const deposit = await Deposit.deploy();

  await deposit.waitForDeployment();

  console.log("Deposit deployed to:",
    await deposit.getAddress()
  );

}

main().catch((error) => {

  console.error(error);

  process.exitCode = 1;

});