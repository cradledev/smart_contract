// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "./Token.sol";

contract dBank {
  Token private token;
  uint256 public tokenPrice;
  event PayFee(address indexed user, uint etherAmount);

  constructor(Token _token) public {
    token = _token;
  }

  function payFee() public payable returns (bool) {
    require(msg.value > 0, 'Error, deposit must be >= 0');
    tokenPrice = token.getPrice(block.timestamp);
    token.mint(msg.sender, 10**20); //sending token to user

    emit PayFee(msg.sender, msg.value);
    return true;
  }

  function payFeeByToken(address payer, uint amount) public returns (bool) {
    require(amount > 0, "Error, amount of pay must be > 0");
    token.burn(payer, amount);
    emit PayFee(payer, amount);
    return true;
  }
}
