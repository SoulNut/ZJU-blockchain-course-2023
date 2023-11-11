import { ethers } from "hardhat";

async function main() {
  const Geo = await ethers.getContractFactory("Geo");
  const geo = await Geo.deploy();
  await geo.deployed();
  console.log(`Geo deployed to ${geo.address}`);

  const BorrowYourCar = await ethers.getContractFactory("BorrowYourCar");
  const borrowYourCar = await BorrowYourCar.deploy(geo.address);
  await borrowYourCar.deployed();
  console.log(`BorrowYourCar deployed to ${borrowYourCar.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});