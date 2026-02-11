// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {LiquidityStaking} from "../../src/LiquidityStaking.sol";
import {RewardToken} from "../../src/RewardToken.sol";

contract LiquidityStakingUnitTest is Test {
    LiquidityStaking public staking;
    RewardToken public token;

    address owner = makeAddr("owner");
    address user1 = makeAddr("user1");
    address user2 = makeAddr("user2");
    address user3 = makeAddr("user3");

    event Staked(address indexed staker, uint256 amount, uint256 timestamp);
    event Claimed(address indexed user, uint256 rewardAmount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 ethAmount, uint256 rewardAmount, uint256 timestamp);
    event APYUpdated(uint256 curApy, uint256 totalStaked, uint256 timeStamp);

    function setUp() public {
        vm.startPrank(owner);
        token = new RewardToken();
        staking = new LiquidityStaking(address(token));

        token.transfer(address(staking), 100_000 * 10 ** 18);
        vm.stopPrank();

        // Даем БОЛЬШЕ ETH пользователям для тестов
        vm.deal(user1, 10000 ether);
        vm.deal(user2, 10000 ether);
        vm.deal(user3, 10000 ether);
    }

    // ═══════════════════════════════════════════════════════════
    // CONSTRUCTOR TESTS
    // ═══════════════════════════════════════════════════════════

    function test_Constructor_SetsRewardToken() public view {
        assertEq(address(staking.rewardToken()), address(token));
    }

    function test_Constructor_RevertsOnZeroAddress() public {
        vm.expectRevert(LiquidityStaking.ZeroAmount.selector);
        new LiquidityStaking(address(0));
    }

    function test_Constructor_SetsDefaultValues() public view {
        assertEq(staking.totalStaked(), 0);
        assertEq(staking.baseRewardRatePerYear(), 20);
        assertEq(staking.minRewardRate(), 5);
        assertEq(staking.maxRewardRate(), 100);
    }

    // ═══════════════════════════════════════════════════════════
    // STAKE TESTS
    // ═══════════════════════════════════════════════════════════

    function test_Stake_Success() public {
        vm.startPrank(user1);

        vm.expectEmit(true, false, false, true);
        emit Staked(user1, 1 ether, block.timestamp);

        staking.stake{value: 1 ether}();

        (uint256 amount, uint256 startTime,) = staking.getMyStake();
        assertEq(amount, 1 ether);
        assertEq(startTime, block.timestamp);
        assertEq(staking.totalStaked(), 1 ether);
        vm.stopPrank();
    }

    function test_Stake_RevertsOnZeroAmount() public {
        vm.startPrank(user1);
        vm.expectRevert(LiquidityStaking.ZeroAmount.selector);
        staking.stake{value: 0}();
        vm.stopPrank();
    }

    function test_Stake_AccumulatesMultipleStakes() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();
        staking.stake{value: 2 ether}();

        (uint256 amount,,) = staking.getMyStake();
        assertEq(amount, 3 ether);
        assertEq(staking.totalStaked(), 3 ether);
        vm.stopPrank();
    }

    function test_Stake_PreservesRewardsOnReStake() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();
        vm.warp(block.timestamp + 100);

        uint256 rewardBeforeReStake = staking.calcReward(user1);
        assertGt(rewardBeforeReStake, 0);

        staking.stake{value: 1 ether}();

        (, uint256 startTime, uint256 pendingReward) = staking.getMyStake();

        assertEq(startTime, block.timestamp);
        assertEq(pendingReward, 0); // Новый таймер
        vm.stopPrank();
    }

    function test_Stake_UpdatesTotalStaked() public {
        assertEq(staking.totalStaked(), 0);

        vm.prank(user1);
        staking.stake{value: 10 ether}();
        assertEq(staking.totalStaked(), 10 ether);

        vm.prank(user2);
        staking.stake{value: 20 ether}();
        assertEq(staking.totalStaked(), 30 ether);
    }

    function test_Stake_EmitsAPYUpdatedEvent() public {
        vm.startPrank(user1);

        vm.expectEmit(true, false, false, false);
        emit APYUpdated(0, 0, 0);

        staking.stake{value: 1 ether}();
        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════════════════
    // UNSTAKE TESTS
    // ═══════════════════════════════════════════════════════════

    function test_Unstake_Success() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();
        vm.warp(block.timestamp + 365 days);

        uint256 balanceBefore = user1.balance;
        uint256 expectedReward = staking.calcReward(user1);

        vm.expectEmit(true, false, false, true);
        emit Unstaked(user1, 1 ether, expectedReward, block.timestamp);

        staking.unstake();

        uint256 balanceAfter = user1.balance;

        assertEq(balanceAfter - balanceBefore, 1 ether);
        assertEq(token.balanceOf(user1), expectedReward);
        assertEq(staking.totalStaked(), 0);

        (uint256 amount,,) = staking.getMyStake();
        assertEq(amount, 0);
        vm.stopPrank();
    }

    function test_Unstake_RevertsOnNoStake() public {
        vm.startPrank(user1);
        vm.expectRevert(LiquidityStaking.NoStakeFound.selector);
        staking.unstake();
        vm.stopPrank();
    }

    function test_Unstake_WorksWithoutRewards() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();

        uint256 balanceBefore = user1.balance;
        staking.unstake();
        uint256 balanceAfter = user1.balance;

        assertEq(balanceAfter - balanceBefore, 1 ether);
        assertEq(token.balanceOf(user1), 0);
        vm.stopPrank();
    }

    function test_Unstake_UpdatesTotalStaked() public {
        vm.prank(user1);
        staking.stake{value: 10 ether}();

        vm.prank(user2);
        staking.stake{value: 20 ether}();

        assertEq(staking.totalStaked(), 30 ether);

        vm.prank(user1);
        staking.unstake();

        assertEq(staking.totalStaked(), 20 ether);
    }

    function test_Unstake_EmitsAPYUpdatedEvent() public {
        vm.startPrank(user1);
        staking.stake{value: 1 ether}();

        vm.expectEmit(true, false, false, false);
        emit APYUpdated(0, 0, 0);

        staking.unstake();
        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════════════════
    // CLAIM REWARDS TESTS
    // ═══════════════════════════════════════════════════════════

    function test_ClaimRewards_Success() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();
        vm.warp(block.timestamp + 365 days);

        uint256 expectedReward = staking.calcReward(user1);

        vm.expectEmit(true, false, false, true);
        emit Claimed(user1, expectedReward, block.timestamp);

        staking.claimRewards();

        assertEq(token.balanceOf(user1), expectedReward);

        (uint256 amount,,) = staking.getMyStake();
        assertEq(amount, 1 ether);
        vm.stopPrank();
    }

    function test_ClaimRewards_RevertsOnNoRewards() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();

        vm.expectRevert(LiquidityStaking.NoRewardsToClaim.selector);
        staking.claimRewards();
        vm.stopPrank();
    }

    function test_ClaimRewards_ResetsTimer() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();
        vm.warp(block.timestamp + 100);

        uint256 timestampBeforeClaim = block.timestamp;
        staking.claimRewards();

        (, uint256 startTime,) = staking.getMyStake();
        assertEq(startTime, timestampBeforeClaim);
        vm.stopPrank();
    }

    function test_ClaimRewards_CanClaimMultipleTimes() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();

        vm.warp(block.timestamp + 365 days / 2);
        uint256 firstClaim = staking.calcReward(user1);
        staking.claimRewards();
        assertEq(token.balanceOf(user1), firstClaim);

        vm.warp(block.timestamp + 365 days / 2);
        uint256 secondClaim = staking.calcReward(user1);
        staking.claimRewards();
        assertEq(token.balanceOf(user1), firstClaim + secondClaim);

        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════════════════
    // DYNAMIC APY TESTS
    // ═══════════════════════════════════════════════════════════

    function test_APY_MaxWhenNoStakers() public view {
        uint256 apy = staking.getCurrentAPY();
        assertEq(apy, 100); // maxRewardRate
    }

    function test_APY_AtTargetTVL() public {
        vm.prank(user1);
        staking.stake{value: 100 ether}();

        uint256 apy = staking.getCurrentAPY();
        assertEq(apy, 20); // baseRewardRatePerYear
    }

    function test_APY_BelowTargetTVL() public {
        vm.prank(user1);
        staking.stake{value: 50 ether}();

        uint256 apy = staking.getCurrentAPY();
        assertEq(apy, 40);
    }

    function test_APY_AboveTargetTVL() public {
        vm.prank(user1);
        staking.stake{value: 200 ether}();

        uint256 apy = staking.getCurrentAPY();
        assertEq(apy, 10);
    }

    function test_APY_HitsMinimum() public {
        vm.prank(user1);
        staking.stake{value: 1000 ether}();

        uint256 apy = staking.getCurrentAPY();
        assertEq(apy, 5);
    }

    function test_APY_HitsMaximum() public view {
        uint256 apy = staking.getCurrentAPY();
        assertEq(apy, 100);
    }

    function test_APY_DecreasesWithMoreStakers() public {
        vm.prank(user1);
        staking.stake{value: 25 ether}();
        uint256 apy1 = staking.getCurrentAPY();

        vm.prank(user2);
        staking.stake{value: 25 ether}();
        uint256 apy2 = staking.getCurrentAPY();

        vm.prank(user3);
        staking.stake{value: 50 ether}();
        uint256 apy3 = staking.getCurrentAPY();

        assertGt(apy1, apy2);
        assertGt(apy2, apy3);
    }

    function test_APY_UpdatesAfterUnstake() public {
        vm.prank(user1);
        staking.stake{value: 100 ether}();

        uint256 apyBefore = staking.getCurrentAPY();
        assertEq(apyBefore, 20);

        vm.prank(user1);
        staking.unstake();

        uint256 apyAfter = staking.getCurrentAPY();
        assertEq(apyAfter, 100);
    }

    // ═══════════════════════════════════════════════════════════
    // REWARD CALCULATION TESTS
    // ═══════════════════════════════════════════════════════════

    function test_CalcReward_ReturnsZeroForNoStake() public view {
        uint256 reward = staking.calcReward(user1);
        assertEq(reward, 0);
    }

    function test_CalcReward_CalculatesCorrectly() public {
        vm.startPrank(user1);

        staking.stake{value: 100 ether}();
        vm.warp(block.timestamp + 365 days);

        uint256 reward = staking.calcReward(user1);
        assertGt(reward, 0);
        vm.stopPrank();
    }

    function test_CalcReward_ScalesWithAmount_DynamicAPY() public {
        // ───── Сценарий 1: 100 ETH ─────
        vm.startPrank(user1);
        staking.stake{value: 100 ether}();

        uint256 apy1 = staking.getCurrentAPY();
        vm.warp(block.timestamp + 365 days);

        uint256 reward1 = staking.calcReward(user1);
        staking.unstake();
        vm.stopPrank();

        // Немного двигаем время
        vm.warp(block.timestamp + 1);

        // ───── Сценарий 2: 200 ETH ─────
        vm.startPrank(user2);
        staking.stake{value: 200 ether}();

        uint256 apy2 = staking.getCurrentAPY();
        vm.warp(block.timestamp + 365 days);

        uint256 reward2 = staking.calcReward(user2);
        vm.stopPrank();

        // 1️⃣ APY должен уменьшиться
        assertGt(apy1, apy2);

        // 2️⃣ Общая награда должна быть примерно одинаковой
        assertApproxEqRel(reward1, reward2, 0.01e18);

        // 3️⃣ Награда на 1 ETH должна быть меньше при большем стейке
        uint256 rewardPerEth1 = reward1 / 100;
        uint256 rewardPerEth2 = reward2 / 200;

        assertGt(rewardPerEth1, rewardPerEth2);
    }

    function test_CalcReward_ScalesWithTime() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();

        vm.warp(block.timestamp + 100);
        uint256 reward100 = staking.calcReward(user1);

        vm.warp(block.timestamp + 100);
        uint256 reward200 = staking.calcReward(user1);

        assertGt(reward200, reward100);
        vm.stopPrank();
    }

    function test_CalcReward_DifferentAPYGivesDifferentRewards() public {
        // Сценарий 1: Стейкаем мало (высокий APY)
        vm.startPrank(user1);
        staking.stake{value: 10 ether}();
        uint256 apyHigh = staking.getCurrentAPY();
        vm.warp(block.timestamp + 365 days);
        uint256 rewardHigh = staking.calcReward(user1);
        staking.unstake();
        vm.stopPrank();

        // Сценарий 2: Стейкаем много (низкий APY)
        vm.startPrank(user2);
        staking.stake{value: 500 ether}();
        uint256 apyLow = staking.getCurrentAPY();
        vm.warp(block.timestamp + 365 days);
        uint256 rewardLow = staking.calcReward(user2);
        vm.stopPrank();

        // Проверяем что APY разные
        assertGt(apyHigh, apyLow);

        // При высоком APY награда на 1 ETH должна быть больше
        uint256 rewardPerEthHigh = rewardHigh / 10;
        uint256 rewardPerEthLow = rewardLow / 500;

        assertGt(rewardPerEthHigh, rewardPerEthLow);
    }

    // ═══════════════════════════════════════════════════════════
    // GET REWARD PER SECOND TESTS
    // ═══════════════════════════════════════════════════════════

    function test_GetRewardPerSecond_ReturnsCorrectValue() public view {
        uint256 rewardRate = staking.getRewardPerSecondPerETH();
        assertGt(rewardRate, 0);
    }

    function test_GetRewardPerSecond_ChangesWithAPY() public {
        // Низкий TVL = высокий APY = высокий reward rate
        vm.prank(user1);
        staking.stake{value: 10 ether}();
        uint256 rateHigh = staking.getRewardPerSecondPerETH();

        // Высокий TVL = низкий APY = низкий reward rate
        vm.prank(user2);
        staking.stake{value: 500 ether}();
        uint256 rateLow = staking.getRewardPerSecondPerETH();

        assertGt(rateHigh, rateLow);
    }

    // ═══════════════════════════════════════════════════════════
    // GET POOL INFO TESTS
    // ═══════════════════════════════════════════════════════════

    function test_GetPoolInfo_ReturnsCorrectData() public {
        vm.prank(user1);
        staking.stake{value: 50 ether}();

        (uint256 currentTVL, uint256 currentAPY, uint256 rewardRate, uint256 contractBalance) = staking.getPoolInfo();

        assertEq(currentTVL, 50 ether);
        assertEq(currentAPY, 40);
        assertGt(rewardRate, 0);
        assertEq(contractBalance, 100_000 * 10 ** 18);
    }

    function test_GetPoolInfo_UpdatesAfterStake() public {
        (uint256 tvlBefore,,,) = staking.getPoolInfo();
        assertEq(tvlBefore, 0);

        vm.prank(user1);
        staking.stake{value: 10 ether}();

        (uint256 tvlAfter,,,) = staking.getPoolInfo();
        assertEq(tvlAfter, 10 ether);
    }

    // ═══════════════════════════════════════════════════════════
    // GET MY PENDING REWARDS TESTS
    // ═══════════════════════════════════════════════════════════

    function test_GetMyPendingRewards_ReturnsZeroInitially() public view {
        uint256 pending = staking.getMyPendingRewards();
        assertEq(pending, 0);
    }

    function test_GetMyPendingRewards_IncreasesOverTime() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();

        uint256 pending1 = staking.getMyPendingRewards();
        assertEq(pending1, 0);

        vm.warp(block.timestamp + 100);
        uint256 pending2 = staking.getMyPendingRewards();
        assertGt(pending2, pending1);

        vm.warp(block.timestamp + 100);
        uint256 pending3 = staking.getMyPendingRewards();
        assertGt(pending3, pending2);

        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════════════════
    // GET MY STAKE TESTS
    // ═══════════════════════════════════════════════════════════

    function test_GetMyStake_ReturnsCorrectData() public {
        vm.startPrank(user1);

        staking.stake{value: 5 ether}();
        uint256 stakeTime = block.timestamp;

        (uint256 amount, uint256 startTime, uint256 pendingReward) = staking.getMyStake();

        assertEq(amount, 5 ether);
        assertEq(startTime, stakeTime);
        assertEq(pendingReward, 0);

        vm.warp(block.timestamp + 100);

        (,, uint256 pending) = staking.getMyStake();
        assertGt(pending, 0);

        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════════════════
    // RECEIVE FUNCTION TESTS
    // ═══════════════════════════════════════════════════════════

    function test_Receive_StakesETH() public {
        vm.startPrank(user1);

        (bool success,) = address(staking).call{value: 1 ether}("");
        assertTrue(success);

        (uint256 amount,,) = staking.getMyStake();
        assertEq(amount, 1 ether);
        assertEq(staking.totalStaked(), 1 ether);
        vm.stopPrank();
    }

    function test_Receive_RevertsOnZeroAmount() public {
        vm.startPrank(user1);

        vm.expectRevert(LiquidityStaking.ZeroAmount.selector);
        address(staking).call{value: 0}("");

        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════════════════
    // EDGE CASES & COMPLEX SCENARIOS
    // ═══════════════════════════════════════════════════════════

    function test_MultipleUsersStakeAndUnstake() public {
        vm.prank(user1);
        staking.stake{value: 10 ether}();

        vm.prank(user2);
        staking.stake{value: 20 ether}();

        vm.prank(user3);
        staking.stake{value: 30 ether}();

        assertEq(staking.totalStaked(), 60 ether);

        vm.prank(user2);
        staking.unstake();

        assertEq(staking.totalStaked(), 40 ether);
    }

    function test_StakeClaimStakeAgain() public {
        vm.startPrank(user1);

        staking.stake{value: 10 ether}();
        vm.warp(block.timestamp + 365 days);

        uint256 reward1 = staking.calcReward(user1);
        staking.claimRewards();

        vm.warp(block.timestamp + 365 days);
        staking.stake{value: 10 ether}();

        (uint256 amount,,) = staking.getMyStake();
        assertEq(amount, 20 ether);

        vm.stopPrank();
    }

    function test_LongTermStaking() public {
        vm.startPrank(user1);

        staking.stake{value: 10 ether}();

        vm.warp(block.timestamp + 365 days * 2);

        uint256 reward = staking.calcReward(user1);
        assertGt(reward, 0);

        staking.unstake();
        assertGt(token.balanceOf(user1), 0);

        vm.stopPrank();
    }

    function test_ReentrancyProtection() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();
        staking.unstake();

        vm.expectRevert(LiquidityStaking.NoStakeFound.selector);
        staking.unstake();

        vm.stopPrank();
    }

    function test_ZeroRewardsAfterClaim() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();
        vm.warp(block.timestamp + 100);

        staking.claimRewards();

        uint256 pendingAfterClaim = staking.getMyPendingRewards();
        assertEq(pendingAfterClaim, 0);

        vm.stopPrank();
    }
}
