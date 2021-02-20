const {
  constants,
  expectEvent,
  balance,
} = require("@openzeppelin/test-helpers");
const { assert, expect } = require("chai");
const { ethers } = require("hardhat");
const { provider, BigNumber } = ethers;
const { parseEther, formatEther } = ethers.utils;
const time = require("../helpers/time");
const { parseLog } = require("../utils");

const HEGIC_ETH_OPTIONS = "0xEfC0eEAdC1132A12c9487d800112693bf49EcfA2";
const HEGIC_WBTC_OPTIONS = "0x3961245DB602eD7c03eECcda33eA3846bD8723BD";
const WBTC_ADDRESS = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const ETH_ADDRESS = constants.ZERO_ADDRESS;
let admin, owner, user, recipient;

const PUT_OPTION_TYPE = 1;
const CALL_OPTION_TYPE = 2;

describe("HegicAdapter", () => {
  let initSnapshotId, snapshotId;
  const gasPrice = ethers.utils.parseUnits("10", "gwei");

  before(async function () {
    const [
      adminSigner,
      ownerSigner,
      userSigner,
      recipientSigner,
    ] = await ethers.getSigners();
    admin = adminSigner.address;
    owner = ownerSigner.address;
    user = userSigner.address;
    recipient = recipientSigner.address;

    this.protocolName = "HEGIC";
    this.nonFungible = true;

    const HegicAdapter = await ethers.getContractFactory("HegicAdapter");

    this.adapter = await HegicAdapter.deploy(
      HEGIC_ETH_OPTIONS,
      HEGIC_WBTC_OPTIONS,
      ETH_ADDRESS,
      WBTC_ADDRESS
    );
    this.adapter = this.adapter.connect(userSigner);

    initSnapshotId = await time.takeSnapshot();
  });

  after(async () => {
    await time.revertToSnapShot(initSnapshotId);
  });

  describe("#protocolName", () => {
    it("matches the protocol name", async function () {
      assert.equal(await this.adapter.protocolName(), this.protocolName);
    });
  });

  describe("#nonFungible", () => {
    it("matches the nonFungible bool", async function () {
      assert.equal(await this.adapter.nonFungible(), this.nonFungible);
    });
  });

  /**
   * Current price for ETH-USD = ~$1100
   * Current price for BTC-USD = ~$38000
   */

  // ETH Options
  behavesLikeHegicOptions({
    optionName: "ETH CALL ITM",
    underlying: ETH_ADDRESS,
    strikeAsset: ETH_ADDRESS,
    strikePrice: parseEther("900"),
    premium: BigNumber.from("285817414096087812"),
    purchaseAmount: parseEther("1"),
    optionType: CALL_OPTION_TYPE,
    expectedOptionID: "2353",
    exerciseProfit: BigNumber.from("200547181040532257"),
  });

  // behavesLikeHegicOptions({
  //   optionName: "ETH CALL OTM",
  //   underlying: ETH_ADDRESS,
  //   strikeAsset: ETH_ADDRESS,
  //   strikePrice: ether("1200"),
  //   premium: BigNumber.from("66452674791666666"),
  //   purchaseAmount: ether("1"),
  //   optionType: CALL_OPTION_TYPE,
  //   expectedOptionID: "2353",
  //   exerciseProfit: BigNumber.from("0"),
  // });

  // behavesLikeHegicOptions({
  //   optionName: "ETH PUT ITM",
  //   underlying: ETH_ADDRESS,
  //   strikeAsset: ETH_ADDRESS,
  //   strikePrice: ether("1200"),
  //   premium: BigNumber.from("140079856453804950"),
  //   purchaseAmount: ether("1"),
  //   optionType: PUT_OPTION_TYPE,
  //   expectedOptionID: "2353",
  //   exerciseProfit: BigNumber.from("65937091945956989"),
  // });

  // behavesLikeHegicOptions({
  //   optionName: "ETH PUT OTM",
  //   underlying: ETH_ADDRESS,
  //   strikeAsset: ETH_ADDRESS,
  //   strikePrice: ether("900"),
  //   premium: BigNumber.from("58107073380885971"),
  //   purchaseAmount: ether("1"),
  //   optionType: PUT_OPTION_TYPE,
  //   expectedOptionID: "2353",
  //   exerciseProfit: BigNumber.from("0"),
  // });

  // // WBTC Options
  // behavesLikeHegicOptions({
  //   optionName: "WBTC CALL ITM",
  //   underlying: WBTC_ADDRESS,
  //   strikeAsset: WBTC_ADDRESS,
  //   strikePrice: ether("34000"),
  //   premium: BigNumber.from("5028351441863137425"),
  //   purchaseAmount: BigNumber.from("100000000"),
  //   optionType: CALL_OPTION_TYPE,
  //   expectedOptionID: "1119",
  //   exerciseProfit: BigNumber.from("9897877"),
  // });

  // behavesLikeHegicOptions({
  //   optionName: "WBTC CALL OTM",
  //   underlying: WBTC_ADDRESS,
  //   strikeAsset: WBTC_ADDRESS,
  //   strikePrice: ether("41000"),
  //   premium: BigNumber.from("1483260273030990622"),
  //   purchaseAmount: BigNumber.from("100000000"),
  //   optionType: CALL_OPTION_TYPE,
  //   expectedOptionID: "1119",
  //   exerciseProfit: BigNumber.from("0"),
  // });

  // behavesLikeHegicOptions({
  //   optionName: "WBTC PUT ITM",
  //   underlying: WBTC_ADDRESS,
  //   strikeAsset: WBTC_ADDRESS,
  //   strikePrice: ether("41000"),
  //   premium: BigNumber.from("4582950345865552024"),
  //   purchaseAmount: BigNumber.from("100000000"),
  //   optionType: PUT_OPTION_TYPE,
  //   expectedOptionID: "1119",
  //   exerciseProfit: BigNumber.from("8652559"),
  // });

  // behavesLikeHegicOptions({
  //   optionName: "WBTC PUT OTM",
  //   underlying: WBTC_ADDRESS,
  //   strikeAsset: WBTC_ADDRESS,
  //   strikePrice: ether("34000"),
  //   premium: BigNumber.from("1459110991698151816"),
  //   purchaseAmount: BigNumber.from("100000000"),
  //   optionType: PUT_OPTION_TYPE,
  //   expectedOptionID: "1119",
  //   exerciseProfit: BigNumber.from("0"),
  // });

  function behavesLikeHegicOptions(params) {
    describe(`${params.optionName}`, () => {
      before(async function () {
        const {
          underlying,
          strikeAsset,
          expiry,
          strikePrice,
          premium,
          purchaseAmount,
          optionType,
          expectedOptionID,
          exerciseProfit,
        } = params;
        this.underlying = underlying;
        this.strikeAsset = strikeAsset;
        this.collateralAsset = underlying;
        this.startTime = (await provider.getBlock()).timestamp;
        this.expiry = expiry || this.startTime + 60 * 60 * 24 * 2; // 2 days from now
        this.strikePrice = strikePrice;
        this.premium = premium;
        this.purchaseAmount = purchaseAmount;
        this.optionType = optionType;
        this.expectedOptionID = expectedOptionID;
        this.exerciseProfit = exerciseProfit;
        this.hegicOptions = await getOptionsContract(this.underlying);
      });

      describe("#premium", () => {
        it("gets premium of option", async function () {
          const premium = await this.adapter.premium(
            [
              this.underlying,
              this.strikeAsset,
              this.collateralAsset,
              this.expiry,
              this.strikePrice,
              this.optionType,
            ],
            this.purchaseAmount
          );
          assert.equal(premium.toString(), this.premium.toString());
        });
      });

      describe("#purchase", () => {
        beforeEach(async () => {
          snapshotId = await time.takeSnapshot();
        });

        afterEach(async () => {
          await time.revertToSnapShot(snapshotId);
        });

        it("reverts when not enough value is passed", async function () {
          await expect(
            this.adapter.purchase(
              [
                this.underlying,
                this.strikeAsset,
                this.collateralAsset,
                this.expiry,
                this.strikePrice,
                this.optionType,
              ],
              this.purchaseAmount,
              {
                from: user,
                value: this.premium.sub(BigNumber.from("1")),
              }
            )
          ).to.be.revertedWith("Value does not cover cost");
        });

        it("reverts when buying after expiry", async function () {
          await time.increaseTo(this.expiry + 1);

          await expect(
            this.adapter.purchase(
              [
                this.underlying,
                this.strikeAsset,
                this.collateralAsset,
                this.expiry,
                this.strikePrice,
                this.optionType,
              ],
              this.purchaseAmount,
              {
                from: user,
                value: this.premium,
              }
            )
          ).to.be.revertedWith("Cannot purchase after expiry");
        });

        it("reverts when passing unknown underlying", async function () {
          await expect(
            this.adapter.purchase(
              [
                "0x0000000000000000000000000000000000000001",
                this.strikeAsset,
                this.collateralAsset,
                this.expiry,
                this.strikePrice,
                this.optionType,
              ],
              this.purchaseAmount,
              {
                from: user,
                value: this.purchaseAmount,
              }
            )
          ).to.be.revertedWith("No matching underlying");
        });

        it("creates options on hegic", async function () {
          const res = await this.adapter.purchase(
            [
              this.underlying,
              this.strikeAsset,
              this.collateralAsset,
              this.expiry,
              this.strikePrice,
              this.optionType,
            ],
            this.purchaseAmount,
            {
              from: user,
              value: this.premium,
            }
          );

          expect(res)
            .to.emit(this.adapter, "Purchased")
            .withArgs(
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("HEGIC")),
              this.underlying,
              this.strikeAsset,
              this.expiry.toString(),
              this.strikePrice,
              this.optionType.toString(),
              this.purchaseAmount,
              this.premium,
              this.expectedOptionID
            );

          const {
            holder,
            strike,
            amount,
            lockedAmount,
            premium,
            expiration,
            optionType,
          } = await this.hegicOptions.options(this.expectedOptionID);

          // strike price is scaled down to 10**8 from 10**18
          const scaledStrikePrice = this.strikePrice.div(
            BigNumber.from("10000000000")
          );

          const { settlementFee } = await this.hegicOptions.fees(
            this.expiry - this.startTime,
            this.purchaseAmount,
            scaledStrikePrice,
            this.optionType
          );
          assert.equal(holder, this.adapter.address);
          assert.equal(strike.toString(), scaledStrikePrice);
          assert.equal(amount.toString(), this.purchaseAmount);
          assert.equal(lockedAmount.toString(), this.purchaseAmount);
          assert.equal(expiration, this.expiry);
          assert.equal(optionType, this.optionType);

          // premiums for token options are denominated in the underlying token
          // we only check for this case when underlying is ETH
          if (this.underlying == ETH_ADDRESS) {
            assert.equal(
              premium.toString(),
              this.premium.sub(settlementFee).toString()
            );
          }
        });
      });

      describe("#exerciseProfit", () => {
        beforeEach(async function () {
          snapshotId = await time.takeSnapshot();
        });

        afterEach(async () => {
          await time.revertToSnapShot(snapshotId);
        });

        it("reverts when unknown options address passed", async function () {
          await expect(
            this.adapter.exerciseProfit(constants.ZERO_ADDRESS, 0, 0)
          ).to.be.revertedWith(
            "optionsAddress must match either ETH or WBTC options"
          );
        });

        it("gets correct exercise profit for an option", async function () {
          const purchaseRes = await this.adapter.purchase(
            [
              this.underlying,
              this.strikeAsset,
              this.collateralAsset,
              this.expiry,
              this.strikePrice,
              this.optionType,
            ],
            this.purchaseAmount,
            {
              from: user,
              value: this.premium,
            }
          );
          const receipt = await provider.waitForTransaction(purchaseRes.hash);
          const optionID = (await parseLog("HegicAdapter", receipt.logs[2]))
            .args[9];

          assert.equal(
            (
              await this.adapter.exerciseProfit(
                this.hegicOptions.address,
                optionID,
                0
              )
            ).toString(),
            this.exerciseProfit
          );
        });
      });

      describe("#exercise", () => {
        beforeEach(async function () {
          snapshotId = await time.takeSnapshot();
          const purchaseRes = await this.adapter.purchase(
            [
              this.underlying,
              this.strikeAsset,
              this.collateralAsset,
              this.expiry,
              this.strikePrice,
              this.optionType,
            ],
            this.purchaseAmount,
            {
              from: user,
              value: this.premium,
            }
          );
          const receipt = await provider.waitForTransaction(purchaseRes.hash);
          this.optionID = (
            await parseLog("HegicAdapter", receipt.logs[2])
          ).args[9];
        });

        afterEach(async () => {
          await time.revertToSnapShot(snapshotId);
        });

        if (params.exerciseProfit.isZero()) {
          it("reverts when not ITM", async function () {
            await expect(
              this.adapter.exercise(
                this.hegicOptions.address,
                this.optionID,
                0,
                user,
                { from: user, gasPrice }
              )
            ).to.be.revertedWith(
              `Current price is too ${this.optionType === 1 ? "high" : "low"}`
            );
          });
        } else {
          it("exercises options with profit", async function () {
            const startETHBalance = await provider.getBalance(user);
            let token, startUserBalance;
            if (this.underlying !== ETH_ADDRESS) {
              token = await ethers.getContractAt("IERC20", this.underlying);
              startUserBalance = await token.balanceOf(user);
            }
            const res = await this.adapter.exercise(
              this.hegicOptions.address,
              this.optionID,
              0,
              user,
              { from: user, gasPrice }
            );

            const receipt = await provider.waitForTransaction(res.hash);

            expect(res)
              .to.emit(this.adapter, "Exercised")
              .withArgs(user, this.expectedOptionID, "0", this.exerciseProfit);

            if (this.underlying === ETH_ADDRESS) {
              const gasFee = BigNumber.from(gasPrice).mul(
                BigNumber.from(receipt.gasUsed)
              );
              const profit = this.exerciseProfit.sub(gasFee);
              assert.equal(
                (await provider.getBalance(user))
                  .sub(startETHBalance)
                  .toString(),
                profit.toString()
              );
              // make sure the adapter doesn't accidentally retain any ether
              assert.equal(
                (await provider.getBalance(this.adapter.address)).toString(),
                "0"
              );
            } else {
              assert.equal(
                (await token.balanceOf(user)).sub(startUserBalance).toString(),
                this.exerciseProfit
              );
              assert.equal(
                (await token.balanceOf(this.adapter.address)).toString(),
                "0"
              );
            }
          });

          it("redirects exercise profit to recipient", async function () {
            const recipientStartETHBalance = await provider.getBalance(
              recipient
            );
            let token, startRecipientBalance;
            if (this.underlying !== ETH_ADDRESS) {
              token = await ethers.getContractAt("IERC20", this.underlying);
              startRecipientBalance = await token.balanceOf(recipient);
            }

            await this.adapter.exercise(
              this.hegicOptions.address,
              this.optionID,
              0,
              recipient,
              { from: user, gasPrice }
            );

            if (this.underlying === ETH_ADDRESS) {
              assert.equal(
                (await provider.getBalance(recipient))
                  .sub(recipientStartETHBalance)
                  .toString(),
                this.exerciseProfit.toString() // gas fee not subtracted from recipient
              );

              // make sure the adapter doesn't accidentally retain any ether
              assert.equal(
                (await provider.getBalance(this.adapter.address)).toString(),
                "0"
              );
            } else {
              assert.equal(
                (await token.balanceOf(recipient))
                  .sub(startRecipientBalance)
                  .toString(),
                this.exerciseProfit
              );
              assert.equal(
                (await token.balanceOf(this.adapter.address)).toString(),
                "0"
              );
            }
          });
        }

        it("reverts when past expiry", async function () {
          await time.increaseTo(this.expiry + 1);

          await expect(
            this.adapter.exercise(
              this.hegicOptions.address,
              this.optionID,
              0,
              user,
              {
                from: user,
              }
            )
          ).to.be.revertedWith("Option has expired");
        });
      });

      describe("#canExercise", () => {
        beforeEach(async function () {
          snapshotId = await time.takeSnapshot();

          const purchaseRes = await this.adapter.purchase(
            [
              this.underlying,
              this.strikeAsset,
              this.collateralAsset,
              this.expiry,
              this.strikePrice,
              this.optionType,
            ],
            this.purchaseAmount,
            {
              from: user,
              value: this.premium,
            }
          );
          const receipt = await provider.waitForTransaction(purchaseRes.hash);
          this.optionID = (
            await parseLog("HegicAdapter", receipt.logs[2])
          ).args[9];
        });

        afterEach(async () => {
          await time.revertToSnapShot(snapshotId);
        });

        it("can exercise", async function () {
          const result = await this.adapter.canExercise(
            this.hegicOptions.address,
            this.optionID,
            0,
            { from: user }
          );
          if (this.exerciseProfit.isZero()) {
            assert.isFalse(result);
          } else {
            assert.isTrue(result);
          }
        });

        it("cannot exercise twice", async function () {
          if (!this.exerciseProfit.isZero()) {
            await this.adapter.exercise(
              this.hegicOptions.address,
              this.optionID,
              0,
              recipient,
              { from: user, gasPrice }
            );

            const result = await this.adapter.canExercise(
              this.hegicOptions.address,
              this.optionID,
              0,
              { from: user }
            );

            assert.isFalse(result);
          }
        });

        it("cannot exercise after epxiry", async function () {
          await time.increaseTo(this.expiry + 1);

          const result = await this.adapter.canExercise(
            this.hegicOptions.address,
            this.optionID,
            0,
            { from: user }
          );
          assert.isFalse(result);
        });
      });
    });
  }

  async function getOptionsContract(underlying) {
    if (underlying === ETH_ADDRESS) {
      return await ethers.getContractAt("IHegicETHOptions", HEGIC_ETH_OPTIONS);
    } else if (underlying === WBTC_ADDRESS) {
      return await ethers.getContractAt("IHegicBTCOptions", HEGIC_WBTC_OPTIONS);
    }
    throw new Error(`No underlying found ${underlying}`);
  }
});
