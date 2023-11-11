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
  
      assert.equal(ownedCars.length, 1, "Owned cars count list is not correct");
      assert.equal(availableCars.length, 1, "Available cars list is not correct");
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
  
      const time = 360000;
      const cost = time / 3600;
      await geo.connect(borrower).approve(borrowYourCar.address,borrowerBalanceBefore);
      await borrowYourCar.connect(borrower).borrowCar(index, time);
  
      const borrowerBalanceAfter: BigNumber = await geo.balanceOf(borrower.address);
      const ownerBalanceAfter: BigNumber = await geo.balanceOf(owner.address);
      assert.equal(borrowerBalanceAfter.toString(), borrowerBalanceBefore.sub(cost).toString(), "Borrower balance is not correct");
      assert.equal(ownerBalanceAfter.toString(), ownerBalanceBefore.add(cost).toString(), "Owner balance is not correct");
      const availableCarsAfter: BigNumber[] = await borrowYourCar.queryAvailableCars();
      assert.equal(availableCarsAfter.length, 0, "Available cars count should be 0 after borrowing");
      assert.equal(await borrowYourCar.queryBorrower(index), borrower.address, "Borrower of the car should be the borrower address");
      await expect(borrowYourCar.connect(borrower).borrowCar(index, 1)).to.be.revertedWith("Car is not available for borrowing");
    });
    it("should return a car", async function () {
      const { borrowYourCar, geo,owner,borrower } = await loadFixture(deployFixture);
      await borrowYourCar.createCar();
      const availableCarsBefore: BigNumber[] = await borrowYourCar.queryAvailableCars();
      const index: BigNumber = availableCarsBefore[0];
  
      await geo.connect(borrower).airdrop();
      const borrowerBalanceBefore: BigNumber = await geo.balanceOf(borrower.address);
  
      const cost = 300000;
      await geo.connect(borrower).approve(borrowYourCar.address,borrowerBalanceBefore);
      await borrowYourCar.connect(borrower).borrowCar(index, cost);
      await borrowYourCar.connect(borrower).returnCar(index);
      const availableCarsAfter: BigNumber[] = await borrowYourCar.queryAvailableCars();
      assert.equal(availableCarsAfter.length, 1, "Available cars count should be 1 after returning");
    });
  });
});