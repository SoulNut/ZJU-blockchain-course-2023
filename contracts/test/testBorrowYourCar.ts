import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

describe("Test", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, borrower] = await ethers.getSigners();
    const Geo = await ethers.getContractFactory("Geo");
    const geo = await Geo.deploy();
    await geo.deployed();
    const BorrowYourCar = await ethers.getContractFactory("BorrowYourCar");
    const borrowYourCar = await BorrowYourCar.deploy(geo.address);
    await borrowYourCar.deployed();
    return { borrowYourCar, geo, owner, borrower };
  }

  describe("Deployment", function () {
    it("Should return hello world", async function () {
      const { borrowYourCar } = await loadFixture(deployFixture);
      expect(await borrowYourCar.helloworld()).to.equal("hello world");
    });
    it("should create a car", async function () {
      const {borrowYourCar, geo, owner, borrower } = await loadFixture(deployFixture);
      await borrowYourCar.createCar();
      const ownedCars: BigNumber[] = await borrowYourCar.queryOwnerCars();
      const availableCars: BigNumber[] = await borrowYourCar.queryAvailableCars();
  
      assert.equal(ownedCars.length, 1, "Owned cars count should be 1");
      assert.equal(availableCars.length, 1, "Available cars count should be 1");
      assert.equal(await borrowYourCar.queryOwner(availableCars[0]), owner.address, "Owner of the car should be the owner address");
    });
    it("should borrow a car", async function () {
      const { borrowYourCar, geo,owner,borrower } = await loadFixture(deployFixture);
      await borrowYourCar.createCar();
      const availableCarsBefore: BigNumber[] = await borrowYourCar.queryAvailableCars();
      const index: BigNumber = availableCarsBefore[0];
  
      await geo.connect(borrower).airdrop();
      const borrowerBalanceBefore: BigNumber = await geo.balanceOf(borrower.address);
      const ownerBalanceBefore: BigNumber = await geo.balanceOf(owner.address);
  
      await geo.connect(borrower).approve(borrowYourCar.address,borrowerBalanceBefore);
      await borrowYourCar.connect(borrower).borrowCar(index, 3600);
  
      const borrowerBalanceAfter: BigNumber = await geo.balanceOf(borrower.address);
      const ownerBalanceAfter: BigNumber = await geo.balanceOf(owner.address);
      assert.equal(borrowerBalanceAfter.toString(), borrowerBalanceBefore.sub(1).toString(), "Borrower balance should be decreased by 3600");
      assert.equal(ownerBalanceAfter.toString(), ownerBalanceBefore.add(1).toString(), "Owner balance should be increased by 3600");
      const availableCarsAfter: BigNumber[] = await borrowYourCar.queryAvailableCars();
      assert.equal(availableCarsAfter.length, 0, "Available cars count should be 0 after borrowing");
      assert.equal(await borrowYourCar.queryBorrower(index), borrower.address, "Borrower of the car should be the borrower address");
      await expect(borrowYourCar.connect(borrower).borrowCar(index, 1)).to.be.revertedWith("Car is not available for borrowing");
    });
  });
});