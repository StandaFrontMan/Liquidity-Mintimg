// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract LiquidityStaking is ReentrancyGuard, Ownable {
    IERC20 public immutable rewardToken;

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 claimed;
    }

    mapping(address => Stake) public stakes;
    uint256 public rewardPerSecondPerEth = 1;

    uint256 public totalStaked;
    uint256 public baseRewardRatePerYear = 20;
    uint256 public targetTvl = 100 ether;
    uint256 public minRewardRate = 5;
    uint256 public maxRewardRate = 100;

    uint256 private constant PRECISION = 1e18;
    uint256 private constant SECONDS_PER_YEAR = 365 days;

    event Staked(address indexed stakerAddress, uint256 amount, uint256 stakeTime);
    event Claimed(address indexed claimedAddress, uint256 amount, uint256 claimedTime);
    event Unstaked(address indexed unstakedAddress, uint256 ethAmount, uint256 rewardAmount, uint256 unstakeTime);
    event APYUpdated(uint256 curApy, uint256 totalStaked, uint256 timeStamp);

    error ZeroAmount();
    error NoStakeFound();
    error NoRewardsToClaim();
    error TransferFailed();
    error InvalidRewardRate();
    error InvalidLimits();

    constructor(address _rewardToken) Ownable(msg.sender) {
        require(_rewardToken != address(0), ZeroAmount());
        rewardToken = IERC20(_rewardToken);
    }

    function stake() public payable {
        require(msg.value > 0, ZeroAmount());

        Stake storage userStake = stakes[msg.sender];

        if (userStake.amount > 0) {
            uint256 pending = calcReward(msg.sender);
            userStake.claimed += pending;
        }

        userStake.amount += msg.value;
        userStake.startTime = block.timestamp;

        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value, block.timestamp);
        emit APYUpdated(getCurrentAPY(), totalStaked, block.timestamp);
    }

    function unstake() public nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, NoStakeFound());

        uint256 reward = calcReward(msg.sender);
        uint256 ethAmount = userStake.amount;

        userStake.amount = 0;
        userStake.claimed = 0;
        userStake.startTime = 0;
        totalStaked -= ethAmount;

        if (reward > 0) {
            require(rewardToken.transfer(msg.sender, reward), TransferFailed());
        }

        (bool success,) = msg.sender.call{value: ethAmount}("");
        require(success, TransferFailed());

        emit Unstaked(msg.sender, ethAmount, reward, block.timestamp);
        emit APYUpdated(getCurrentAPY(), totalStaked, block.timestamp);
    }

    function claimRewards() public nonReentrant {
        uint256 reward = calcReward(msg.sender);
        require(reward > 0, NoRewardsToClaim());

        Stake storage userStake = stakes[msg.sender];
        userStake.claimed += reward;
        userStake.startTime = block.timestamp;

        require(rewardToken.transfer(msg.sender, reward), TransferFailed());

        emit Claimed(msg.sender, reward, block.timestamp);
    }

    /**
     * @notice calcs current APY by TVL
     * @dev APY = baseRate * (targetTVL / currentTVL)
     * @return Curr APY in % !!!
     */
    function getCurrentAPY() public view returns (uint256) {
        if (totalStaked == 0) {
            return maxRewardRate;
        }

        uint256 calculatedAPY = (baseRewardRatePerYear * targetTvl) / totalStaked;

        if (calculatedAPY < minRewardRate) {
            return minRewardRate;
        }

        if (calculatedAPY > maxRewardRate) {
            return maxRewardRate;
        }

        return calculatedAPY;
    }

    function previewApy(uint256 hypotheticalTVL) external view returns (uint256) {
        if (hypotheticalTVL == 0) {
            return maxRewardRate;
        }

        uint256 calculatedAPY = (baseRewardRatePerYear * targetTvl) / hypotheticalTVL;

        if (calculatedAPY < minRewardRate) return minRewardRate;
        if (calculatedAPY > maxRewardRate) return maxRewardRate;

        return calculatedAPY;
    }

    /**
     * @notice calc reward per second by curr APY
     * @dev converts APY in reward per second per ETH
     * @return Reward per second per ETH (с учетом 18 decimals)
     */
    function getRewardPerSecondPerETH() public view returns (uint256) {
        uint256 currentAPY = getCurrentAPY();
        return (PRECISION * currentAPY) / (100 * SECONDS_PER_YEAR);
    }

    function calcReward(address user) public view returns (uint256) {
        Stake storage userStake = stakes[user];

        if (userStake.amount == 0) {
            return 0;
        }

        uint256 stakeTime = block.timestamp - userStake.startTime;
        uint256 rewardRate = getRewardPerSecondPerETH();

        uint256 reward = (userStake.amount * stakeTime * rewardRate) / PRECISION;

        return reward;
    }

    /**
     * @notice returns all pool metrics
     * @return currentTVL
     * @return currentAPY
     * @return rewardRate
     * @return contractBalance
     */
    function getPoolInfo()
        public
        view
        returns (uint256 currentTVL, uint256 currentAPY, uint256 rewardRate, uint256 contractBalance)
    {
        return (totalStaked, getCurrentAPY(), getRewardPerSecondPerETH(), rewardToken.balanceOf(address(this)));
    }

    function getMyPendingRewards() public view returns (uint256) {
        return calcReward(msg.sender);
    }

    function getMyStake() public view returns (uint256 amount, uint256 startTime, uint256 pendingReward) {
        Stake memory userStake = stakes[msg.sender];
        return (userStake.amount, userStake.startTime, calcReward(msg.sender));
    }

    receive() external payable {
        stake();
    }

    fallback() external payable {
        stake();
    }

    function setTargetTvl(uint256 _targetTvl) external onlyOwner {
        require(_targetTvl > 0, ZeroAmount());
        targetTvl = _targetTvl;
        emit APYUpdated(getCurrentAPY(), totalStaked, block.timestamp);
    }

    function setBaseRewardRate(uint256 _baseRate) external onlyOwner {
        require(_baseRate > 0 && _baseRate <= 1000, InvalidRewardRate());
        baseRewardRatePerYear = _baseRate;
        emit APYUpdated(getCurrentAPY(), totalStaked, block.timestamp);
    }

    function setRateLimits(uint256 _minRate, uint256 _maxRate) external onlyOwner {
        require(_minRate > 0 && _minRate < _maxRate, InvalidLimits());
        minRewardRate = _minRate;
        maxRewardRate = _maxRate;
        emit APYUpdated(getCurrentAPY(), totalStaked, block.timestamp);
    }
}
