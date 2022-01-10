// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "./Token.sol";

contract dBank {

  Token private token;

  event PayFee(address indexed user, uint etherAmount);

  constructor(Token _token) public {
    token = _token;
  }

  function payFee() payable public returns (bool) {
    require(msg.value > 1e16, 'Error, deposit must be >= 0.01 ETH');

    token.mint(msg.sender, 100); //sending token to user

    emit PayFee(msg.sender, msg.value);
    return true;
  }
}
