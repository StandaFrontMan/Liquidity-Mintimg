// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { IERC20 } from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { ReentrancyGuard } from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract LiquidityStaking is ReentrancyGuard {
    IERC20 public rewardToken;

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 claimed;
    }

    mapping(address => Stake) public stakes;
    uint256 public rewardPerSecondPerEth = 1;

    event Staked(address indexed stakerAddress, uint256 amount, uint256 stakeTime);
    event Claimed(address indexed claimedAddress, uint256 amount, uint256 claimedTime);

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





    function unstake() public nonReentrant {
        Stake storage userStake = stakes[msg.sender];

        require(userStake.amount > 0, "Nothing to unstake");

        uint256 reward = calcReward(msg.sender);
        uint256 ethAmount = userStake.amount;
        userStake.amount = 0;
        userStake.claimed = 0;
        userStake.startTime = 0;

        if (reward > 0) {
            require(
                rewardToken.transfer(msg.sender, reward),
                "Transaction error"
            );
        }

        (bool success, )= msg.sender.call{value: ethAmount}("");
        require(success, "Transaction failed");
    }





    function claimRewards() public nonReentrant{
        uint256 reward = calcReward(msg.sender);
        require(reward > 0, "No rewards to claim");

        Stake storage userStake = stakes[msg.sender];
        userStake.claimed += reward;
        userStake.startTime = block.timestamp;

        require(
            rewardToken.transfer(msg.sender, reward),
            "Claim error"
        );

        emit Claimed(msg.sender, reward, block.timestamp);
    }





    function calcReward(address user) public view returns(uint256) {
        Stake storage userStake = stakes[user];

        if (userStake.amount == 0) {
            return 0;
        }

        uint256 stakeTime = block.timestamp - userStake.startTime;
        uint256 reward = (userStake.amount * stakeTime * rewardPerSecondPerEth) / 1 ether;

        return reward;
    }
}