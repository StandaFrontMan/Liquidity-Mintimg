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

    event Staked(address indexed staker, uint256 amount, uint256 timestamp);
    event Claimed(address indexed user, uint256 rewardAmount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 ethAmount, uint256 rewardAmount, uint256 timestamp);

    function setUp() public {
        vm.startPrank(owner);
        token = new RewardToken();
        staking = new LiquidityStaking(address(token));

        token.transfer(address(staking), 100_000 * 10 ** 18);
        vm.stopPrank();

        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
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
        vm.stopPrank();
    }

    function test_Stake_PreservesRewardsOnReStake() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();
        vm.warp(block.timestamp + 100);

        staking.stake{value: 1 ether}();

        (, uint256 startTime, uint256 pendingReward) = staking.getMyStake();

        assertEq(startTime, block.timestamp);
        assertEq(pendingReward, 0);
        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════════════════
    // UNSTAKE TESTS
    // ═══════════════════════════════════════════════════════════

    function test_Unstake_Success() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();
        vm.warp(block.timestamp + 100);

        uint256 balanceBefore = user1.balance;
        uint256 expectedReward = 100;

        vm.expectEmit(true, false, false, true);
        emit Unstaked(user1, 1 ether, expectedReward, block.timestamp);

        staking.unstake();

        uint256 balanceAfter = user1.balance;

        assertEq(balanceAfter - balanceBefore, 1 ether);
        assertEq(token.balanceOf(user1), expectedReward);

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

    // ═══════════════════════════════════════════════════════════
    // CLAIM REWARDS TESTS
    // ═══════════════════════════════════════════════════════════

    function test_ClaimRewards_Success() public {
        vm.startPrank(user1);

        staking.stake{value: 1 ether}();
        vm.warp(block.timestamp + 50);

        uint256 expectedReward = 50;

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

        vm.warp(block.timestamp + 50);
        staking.claimRewards();
        assertEq(token.balanceOf(user1), 50);

        vm.warp(block.timestamp + 50);
        staking.claimRewards();
        assertEq(token.balanceOf(user1), 100);

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
        vm.stopPrank();
    }

    function test_Receive_RevertsOnZeroAmount() public {
        vm.startPrank(user1);

        vm.expectRevert(LiquidityStaking.ZeroAmount.selector);
        address(staking).call{value: 0}("");

        vm.stopPrank();
    }
}
