// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract LiquidityStaking {
    IERC20 public rewardToken;

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 claimed;
    }

    mapping(address => Stake) public stakes;
    uint256 public rewardPerSecondPerETH = 1;

    event Staked(address indexed stakerAddress, uint256 amount, uint256 stakeTime);

    constructor(address _rewardToken) {
        rewardToken = IERC20(_rewardToken);
    }





    function stake() public payable {
        require(msg.value > 0, "Cant stake 0 ETH");

        Stake storage userStake = stakes[msg.sender];

        if (userStake.amount > 0) {
            uint256 pending = calcReward(msg.sender);
            userStake.claimed += pending;
        }

        userStake.amount += msg.value;
        userStake.startTime = block.timestamp;

        emit Staked(msg.sender, msg.value, block.timestamp);
    }





    function calcReward(address user) public view returns(uint256) {
        Stake storage userStake = stakes[user];

        if (userStake.amount == 0) {
            return 0;
        }

        uint256 stakeTime = block.timestamp - userStake.startTime;
        uint256 reward = (userStake.amount * stakeTime * rewardPerSecondPerETH) / 1 ether;

        return reward;
    }
}