import { tokens, ether, ETHER_ADDRESS, EVM_REVERT, wait } from './helpers'

const Token = artifacts.require('./Token')
const DecentralizedBank = artifacts.require('./dBank')

require('chai')
  .use(require('chai-as-promised'))
  .should()

//h0m3w0rk - check values from events.

contract('dBank', ([deployer, user]) => {
  let dbank, token
  const interestPerSecond = 31668017 //(10% APY) for min. deposit (0.01 ETH)

  beforeEach(async () => {
    token = await Token.new()
    dbank = await DecentralizedBank.new(token.address)
    await token.passMinterRole(dbank.address, {from: deployer})
  })

  describe('testing token contract...', () => {
    describe('success', () => {
      it('checking token name', async () => {
        expect(await token.name()).to.be.eq('CiMPLE Coupons')
      })

      it('checking token symbol', async () => {
        expect(await token.symbol()).to.be.eq('CiMPLE')
      })

      it('checking token initial total supply', async () => {
        expect(Number(await token.totalSupply())).to.eq(0)
      })

      it('dBank should have Token minter role', async () => {
        expect(await token.minter()).to.eq(dbank.address)
      })
      it('token price is here', async () => {

        console.log("asdasdasd", Number(await token.getPrice(1646928802)));
        expect(await token.minter()).to.eq(dbank.address)
      })
    })

    describe('failure', () => {
      it('passing minter role should be rejected', async () => {
        await token.passMinterRole(user, {from: deployer}).should.be.rejectedWith(EVM_REVERT)
      })

      it('tokens minting should be rejected', async () => {
        await token.mint(user, '1', {from: deployer}).should.be.rejectedWith(EVM_REVERT) //unauthorized minter
      })
    })
  })

  // describe('testing payFee...', () => {
  //   let balance

  //   describe('success', () => {
  //     beforeEach(async () => {
  //       await dbank.payFee({value: 10**17, from: user}) //0.01 ETH
  //     })

  //     it('balance of token should increase', async () => {
  //       expect(Number(await token.balanceOf(user))).to.eq(100)
  //     })
  //   })

  //   describe('failure', () => {
  //     it('test paying fee should be rejected', async () => {
  //       await dbank.payFee({value: 10**15, from: user}).should.be.rejectedWith(EVM_REVERT) //to small amount
  //     })
  //   })
  // })
})