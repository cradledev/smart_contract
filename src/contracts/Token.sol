// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
  address public minter;

  uint256 private publicStartDate;
  uint256 private constant oneSecondTimeStamp = 1;
  uint256 private constant oneDayTimeStamp = 8.64 * 1e4;
  uint256 private constant oneYearTimeStamp = 3.154 * 1e7;

  uint256 public tokenPrice;
  event MinterChanged(address indexed from, address to);
  event ChangedPrice(uint256 indexed tPrice);
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

  function getPrice(uint256 _currentTimeStamp) public payable returns( bool ) {
    // require(msg.sender==minter, 'Error, msg.sender does not have minter role'); //dBank
    require(publicStartDate < _currentTimeStamp, 'Error, selected date is lower than token publish date'); //dBank
    uint256 currentTimeStamp = _currentTimeStamp;
    uint256 periodTimeStamp = currentTimeStamp - publicStartDate;
    uint256 tokenPrice = 10**12;
    uint256 usedDayCount = uint256(periodTimeStamp / oneDayTimeStamp);
    uint256 usedYearCount = uint256(periodTimeStamp / oneYearTimeStamp - 1);
    uint256 stepPrice = 100 * 1e9;
    if(usedYearCount < 1){
      stepPrice = 100 * 1e9;
    }else {
      // stepPrice = 100 * 1e9 * 1.75 * 981 ** usedYearCount / 1000 ** usedYearCount;
      stepPrice = uint256(100 * 1e9 * 1.75 * 0.981);
      // stepPrice = 100 * 1e9;
    }
    if(periodTimeStamp <= 10 * oneDayTimeStamp) {
      tokenPrice = 1000 * 1e9;
    }
    else {
      tokenPrice = uint256(1000 * 1e9 + usedDayCount * stepPrice);
    }
    //  _totalEther =  totalEther;
    emit ChangedPrice(tokenPrice);
    return true;
 }
}