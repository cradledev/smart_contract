// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
  address public minter;

  uint256 private publicStartDate;
  uint256 private constant oneSecondTimeStamp = 1;
  uint256 private constant oneDayTimeStamp = 8.64 * 1e4;
  uint256 private constant oneYearTimeStamp = 3.154 * 1e7;
  
  event MinterChanged(address indexed from, address to);

  constructor() public payable ERC20("CiMPLE Coupons", "CiMPLE") {
    minter = msg.sender; //only initially
    publicStartDate = block.timestamp;
  }

  function passMinterRole(address dBank) public returns (bool) {
  	require(msg.sender==minter, 'Error, only owner can change pass minter role');
  	minter = dBank;

    emit MinterChanged(msg.sender, dBank);
    return true;
  }

  function mint(address account, uint256 amount) public {
		require(msg.sender==minter, 'Error, msg.sender does not have minter role'); //dBank
		_mint(account, amount);
	}

  function burn(address account, uint256 amount) public {
		require(msg.sender==minter, 'Error, msg.sender does not have minter role'); //dBank
		_burn(account, amount);
	}

  function getPrice(uint256 _currentTimeStamp) public returns(uint256) {
    // require(msg.sender==minter, 'Error, msg.sender does not have minter role'); //dBank
    uint256 currentTimeStamp = _currentTimeStamp;
    uint256 periodTimeStamp = currentTimeStamp - publicStartDate;
    uint256 tokenPrice = 1000 * 1e9;
    if(periodTimeStamp <= 10 * oneSecondTimeStamp) {
      tokenPrice = 1000 * 1e9;
    }
    else if(periodTimeStamp > 10 * oneSecondTimeStamp && periodTimeStamp <= 20 * oneSecondTimeStamp) {
      tokenPrice = 2000 * 1e9;
    }
    else if(periodTimeStamp > 20 * oneSecondTimeStamp && periodTimeStamp <= 30 * oneSecondTimeStamp) {
      tokenPrice = 3000 * 1e9;
    }
    else if(periodTimeStamp > 30 * oneSecondTimeStamp && periodTimeStamp <= 40 * oneSecondTimeStamp) {
      tokenPrice = 4000 * 1e9;
    }
    else {
      tokenPrice = 5000 * 1e9;
    }
    //  _totalEther =  totalEther;
     return tokenPrice;
 }
}