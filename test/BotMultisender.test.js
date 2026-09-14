const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BotMultisender", function () {
  let multisender, mockToken;
  let owner, user1, user2, user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const BotMultisender = await ethers.getContractFactory("BotMultisender");
    multisender = await BotMultisender.deploy();
    await multisender.waitForDeployment();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy("Test Token", "TTK", ethers.parseEther("1000000"));
    await mockToken.waitForDeployment();
  });

  describe("Native BOT Multisend", function () {
    it("should send different native amounts to multiple recipients", async function () {
      const recipients = [user1.address, user2.address, user3.address];
      const amounts = [
        ethers.parseEther("1.5"),
        ethers.parseEther("2.0"),
        ethers.parseEther("0.5"),
      ];
      const totalAmount = ethers.parseEther("4.0");

      const u1Initial = await ethers.provider.getBalance(user1.address);
      const u2Initial = await ethers.provider.getBalance(user2.address);
      const u3Initial = await ethers.provider.getBalance(user3.address);

      await expect(
        multisender.multisendNative(recipients, amounts, { value: totalAmount })
      )
        .to.emit(multisender, "NativeMultisend")
        .withArgs(owner.address, totalAmount, 3);

      expect(await ethers.provider.getBalance(user1.address)).to.equal(u1Initial + amounts[0]);
      expect(await ethers.provider.getBalance(user2.address)).to.equal(u2Initial + amounts[1]);
      expect(await ethers.provider.getBalance(user3.address)).to.equal(u3Initial + amounts[2]);
    });

    it("should refund excess native value", async function () {
      const recipients = [user1.address];
      const amounts = [ethers.parseEther("1.0")];
      const sentValue = ethers.parseEther("3.0"); // 2.0 excess

      const ownerInitial = await ethers.provider.getBalance(owner.address);

      const tx = await multisender.multisendNative(recipients, amounts, { value: sentValue });
      const receipt = await tx.wait();
      const gasSpent = receipt.gasUsed * receipt.gasPrice;

      const ownerFinal = await ethers.provider.getBalance(owner.address);
      // Owner balance should be initial - 1.0 - gasSpent (2.0 excess refunded)
      expect(ownerFinal).to.equal(ownerInitial - ethers.parseEther("1.0") - gasSpent);
    });

    it("should send same native amount to all recipients", async function () {
      const recipients = [user1.address, user2.address];
      const amount = ethers.parseEther("2.0");
      const total = ethers.parseEther("4.0");

      const u1Initial = await ethers.provider.getBalance(user1.address);
      const u2Initial = await ethers.provider.getBalance(user2.address);

      await multisender.multisendNativeSameValue(recipients, amount, { value: total });

      expect(await ethers.provider.getBalance(user1.address)).to.equal(u1Initial + amount);
      expect(await ethers.provider.getBalance(user2.address)).to.equal(u2Initial + amount);
    });
  });

  describe("ERC-20 Token Multisend", function () {
    beforeEach(async function () {
      // Approve multisender contract to spend tokens
      await mockToken.approve(await multisender.getAddress(), ethers.parseEther("10000"));
    });

    it("should send different token amounts to multiple recipients", async function () {
      const recipients = [user1.address, user2.address, user3.address];
      const amounts = [
        ethers.parseEther("100"),
        ethers.parseEther("250"),
        ethers.parseEther("50"),
      ];
      const tokenAddress = await mockToken.getAddress();

      await expect(
        multisender.multisendToken(tokenAddress, recipients, amounts)
      )
        .to.emit(multisender, "TokenMultisend")
        .withArgs(tokenAddress, owner.address, ethers.parseEther("400"), 3);

      expect(await mockToken.balanceOf(user1.address)).to.equal(amounts[0]);
      expect(await mockToken.balanceOf(user2.address)).to.equal(amounts[1]);
      expect(await mockToken.balanceOf(user3.address)).to.equal(amounts[2]);
    });

    it("should send same token amount to multiple recipients", async function () {
      const recipients = [user1.address, user2.address];
      const amount = ethers.parseEther("300");
      const tokenAddress = await mockToken.getAddress();

      await multisender.multisendTokenSameValue(tokenAddress, recipients, amount);

      expect(await mockToken.balanceOf(user1.address)).to.equal(amount);
      expect(await mockToken.balanceOf(user2.address)).to.equal(amount);
    });
  });
});
