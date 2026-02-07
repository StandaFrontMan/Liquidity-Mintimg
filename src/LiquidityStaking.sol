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

    constructor(address _rewardToken) {
        rewardToken = IERC20(_rewardToken);
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