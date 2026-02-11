// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {LiquidityStaking} from "../../src/LiquidityStaking.sol";
import {RewardToken} from "../../src/RewardToken.sol";

contract RewardTokenUnitTest is Test {
    RewardToken public token;

    address owner = makeAddr("owner");
    address user1 = makeAddr("user1");
    address user2 = makeAddr("user2");
    address user3 = makeAddr("user3");

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function setUp() public {
        vm.prank(owner);
        token = new RewardToken();
    }

    // ═══════════════════════════════════════════════════════════
    // CONSTRUCTOR TESTS
    // ═══════════════════════════════════════════════════════════

    function test_Constructor_SetsNameAndSymbol() public view {
        assertEq(token.name(), "Reward Token");
        assertEq(token.symbol(), "REW");
    }

    function test_Constructor_SetsDecimals() public view {
        assertEq(token.decimals(), 18);
    }

    function test_Constructor_MintsInitialSupplyToDeployer() public view {
        uint256 expectedSupply = 1_000_000 * 10 ** 18;
        assertEq(token.balanceOf(owner), expectedSupply);
        assertEq(token.totalSupply(), expectedSupply);
    }

    function test_Constructor_EmitsTransferEvent() public {
        vm.expectEmit(true, true, false, true);
        emit Transfer(address(0), owner, 1_000_000 * 10 ** 18);

        vm.prank(owner);
        new RewardToken();
    }

    // ═══════════════════════════════════════════════════════════
    // TRANSFER TESTS
    // ═══════════════════════════════════════════════════════════

    function test_Transfer_Success() public {
        uint256 amount = 1000 * 10 ** 18;

        vm.startPrank(owner);

        vm.expectEmit(true, true, false, true);
        emit Transfer(owner, user1, amount);

        bool success = token.transfer(user1, amount);

        assertTrue(success);
        assertEq(token.balanceOf(user1), amount);
        assertEq(token.balanceOf(owner), 1_000_000 * 10 ** 18 - amount);
        vm.stopPrank();
    }

    function test_Transfer_ZeroAmount() public {
        vm.startPrank(owner);

        vm.expectEmit(true, true, false, true);
        emit Transfer(owner, user1, 0);

        bool success = token.transfer(user1, 0);

        assertTrue(success);
        assertEq(token.balanceOf(user1), 0);
        vm.stopPrank();
    }

    function test_Transfer_ToZeroAddress() public {
        vm.startPrank(owner);

        vm.expectRevert();
        token.transfer(address(0), 1000);

        vm.stopPrank();
    }

    function test_Transfer_InsufficientBalance() public {
        vm.startPrank(user1);

        vm.expectRevert();
        token.transfer(user2, 1000);

        vm.stopPrank();
    }

    function test_Transfer_EntireBalance() public {
        uint256 balance = token.balanceOf(owner);

        vm.prank(owner);
        token.transfer(user1, balance);

        assertEq(token.balanceOf(owner), 0);
        assertEq(token.balanceOf(user1), balance);
    }

    function test_Transfer_MultipleTransfers() public {
        vm.startPrank(owner);

        token.transfer(user1, 1000 * 10 ** 18);
        token.transfer(user2, 2000 * 10 ** 18);
        token.transfer(user3, 3000 * 10 ** 18);

        assertEq(token.balanceOf(user1), 1000 * 10 ** 18);
        assertEq(token.balanceOf(user2), 2000 * 10 ** 18);
        assertEq(token.balanceOf(user3), 3000 * 10 ** 18);

        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════════════════
    // APPROVE TESTS
    // ═══════════════════════════════════════════════════════════

    function test_Approve_Success() public {
        uint256 amount = 5000 * 10 ** 18;

        vm.startPrank(owner);

        vm.expectEmit(true, true, false, true);
        emit Approval(owner, user1, amount);

        bool success = token.approve(user1, amount);

        assertTrue(success);
        assertEq(token.allowance(owner, user1), amount);
        vm.stopPrank();
    }

    function test_Approve_ZeroAmount() public {
        vm.prank(owner);

        token.approve(user1, 0);
        assertEq(token.allowance(owner, user1), 0);
    }

    function test_Approve_OverwriteExistingApproval() public {
        vm.startPrank(owner);

        token.approve(user1, 1000);
        assertEq(token.allowance(owner, user1), 1000);

        token.approve(user1, 5000);
        assertEq(token.allowance(owner, user1), 5000);

        vm.stopPrank();
    }

    function test_Approve_MaxUint256() public {
        vm.prank(owner);

        token.approve(user1, type(uint256).max);
        assertEq(token.allowance(owner, user1), type(uint256).max);
    }

    // ═══════════════════════════════════════════════════════════
    // TRANSFER FROM TESTS
    // ═══════════════════════════════════════════════════════════

    function test_TransferFrom_Success() public {
        uint256 approvalAmount = 10000 * 10 ** 18;
        uint256 transferAmount = 5000 * 10 ** 18;

        vm.prank(owner);
        token.approve(user1, approvalAmount);

        vm.startPrank(user1);

        vm.expectEmit(true, true, false, true);
        emit Transfer(owner, user2, transferAmount);

        bool success = token.transferFrom(owner, user2, transferAmount);

        assertTrue(success);
        assertEq(token.balanceOf(user2), transferAmount);
        assertEq(token.allowance(owner, user1), approvalAmount - transferAmount);
        vm.stopPrank();
    }

    function test_TransferFrom_InsufficientAllowance() public {
        vm.prank(owner);
        token.approve(user1, 1000);

        vm.startPrank(user1);

        vm.expectRevert();
        token.transferFrom(owner, user2, 5000);

        vm.stopPrank();
    }

    function test_TransferFrom_WithMaxAllowance() public {
        vm.prank(owner);
        token.approve(user1, type(uint256).max);

        vm.prank(user1);
        token.transferFrom(owner, user2, 1000 * 10 ** 18);

        assertEq(token.allowance(owner, user1), type(uint256).max);
    }

    function test_TransferFrom_ZeroAmount() public {
        vm.prank(owner);
        token.approve(user1, 1000);

        vm.prank(user1);
        bool success = token.transferFrom(owner, user2, 0);

        assertTrue(success);
        assertEq(token.balanceOf(user2), 0);
    }

    function test_TransferFrom_MultipleSpenders() public {
        vm.startPrank(owner);
        token.approve(user1, 1000 * 10 ** 18);
        token.approve(user2, 2000 * 10 ** 18);
        vm.stopPrank();

        vm.prank(user1);
        token.transferFrom(owner, user3, 500 * 10 ** 18);

        vm.prank(user2);
        token.transferFrom(owner, user3, 1000 * 10 ** 18);

        assertEq(token.balanceOf(user3), 1500 * 10 ** 18);
        assertEq(token.allowance(owner, user1), 500 * 10 ** 18);
        assertEq(token.allowance(owner, user2), 1000 * 10 ** 18);
    }

    // ═══════════════════════════════════════════════════════════
    // MINT TESTS
    // ═══════════════════════════════════════════════════════════

    function test_Mint_Success() public {
        uint256 mintAmount = 50000 * 10 ** 18;
        uint256 initialSupply = token.totalSupply();

        vm.expectEmit(true, true, false, true);
        emit Transfer(address(0), user1, mintAmount);

        token.mint(user1, mintAmount);

        assertEq(token.balanceOf(user1), mintAmount);
        assertEq(token.totalSupply(), initialSupply + mintAmount);
    }

    function test_Mint_ToZeroAddress() public {
        vm.expectRevert();
        token.mint(address(0), 1000);
    }

    function test_Mint_ZeroAmount() public {
        uint256 initialSupply = token.totalSupply();

        token.mint(user1, 0);

        assertEq(token.balanceOf(user1), 0);
        assertEq(token.totalSupply(), initialSupply);
    }

    function test_Mint_MultipleTimes() public {
        token.mint(user1, 1000 * 10 ** 18);
        token.mint(user1, 2000 * 10 ** 18);
        token.mint(user1, 3000 * 10 ** 18);

        assertEq(token.balanceOf(user1), 6000 * 10 ** 18);
    }

    function test_Mint_ToMultipleAddresses() public {
        token.mint(user1, 1000 * 10 ** 18);
        token.mint(user2, 2000 * 10 ** 18);
        token.mint(user3, 3000 * 10 ** 18);

        assertEq(token.balanceOf(user1), 1000 * 10 ** 18);
        assertEq(token.balanceOf(user2), 2000 * 10 ** 18);
        assertEq(token.balanceOf(user3), 3000 * 10 ** 18);
        assertEq(token.totalSupply(), 1_006_000 * 10 ** 18);
    }

    function test_Mint_AnyoneCanMint() public {
        vm.prank(user1);
        token.mint(user1, 1_000_000 * 10 ** 18);

        assertEq(token.balanceOf(user1), 1_000_000 * 10 ** 18);
    }

    function test_Mint_LargeAmount() public {
        uint256 largeAmount = 1_000_000_000 * 10 ** 18;

        token.mint(user1, largeAmount);

        assertEq(token.balanceOf(user1), largeAmount);
    }

    // ═══════════════════════════════════════════════════════════
    // BALANCE OF TESTS
    // ═══════════════════════════════════════════════════════════

    function test_BalanceOf_ZeroForNewAddress() public view {
        assertEq(token.balanceOf(user1), 0);
    }

    function test_BalanceOf_UpdatesAfterTransfer() public {
        vm.prank(owner);
        token.transfer(user1, 1000 * 10 ** 18);

        assertEq(token.balanceOf(user1), 1000 * 10 ** 18);
    }

    function test_BalanceOf_ZeroAddress() public view {
        assertEq(token.balanceOf(address(0)), 0);
    }

    // ═══════════════════════════════════════════════════════════
    // ALLOWANCE TESTS
    // ═══════════════════════════════════════════════════════════

    function test_Allowance_DefaultIsZero() public view {
        assertEq(token.allowance(owner, user1), 0);
    }

    function test_Allowance_UpdatesAfterApprove() public {
        vm.prank(owner);
        token.approve(user1, 5000);

        assertEq(token.allowance(owner, user1), 5000);
    }

    function test_Allowance_DecreasesAfterTransferFrom() public {
        vm.prank(owner);
        token.approve(user1, 10000);

        vm.prank(user1);
        token.transferFrom(owner, user2, 3000);

        assertEq(token.allowance(owner, user1), 7000);
    }

    // ═══════════════════════════════════════════════════════════
    // TOTAL SUPPLY TESTS
    // ═══════════════════════════════════════════════════════════

    function test_TotalSupply_InitialValue() public view {
        assertEq(token.totalSupply(), 1_000_000 * 10 ** 18);
    }

    function test_TotalSupply_IncreasesAfterMint() public {
        uint256 initialSupply = token.totalSupply();

        token.mint(user1, 50000 * 10 ** 18);

        assertEq(token.totalSupply(), initialSupply + 50000 * 10 ** 18);
    }

    function test_TotalSupply_DoesNotChangeOnTransfer() public {
        uint256 initialSupply = token.totalSupply();

        vm.prank(owner);
        token.transfer(user1, 1000 * 10 ** 18);

        assertEq(token.totalSupply(), initialSupply);
    }

    // ═══════════════════════════════════════════════════════════
    // EDGE CASES
    // ═══════════════════════════════════════════════════════════

    function test_EdgeCase_TransferToSelf() public {
        uint256 amount = 1000 * 10 ** 18;
        uint256 initialBalance = token.balanceOf(owner);

        vm.prank(owner);
        token.transfer(owner, amount);

        assertEq(token.balanceOf(owner), initialBalance);
    }

    function test_EdgeCase_ApproveToSelf() public {
        vm.prank(owner);
        token.approve(owner, 1000);

        assertEq(token.allowance(owner, owner), 1000);
    }

    function test_EdgeCase_TransferFromToSelf() public {
        vm.startPrank(owner);

        token.approve(owner, 1000);
        uint256 initialBalance = token.balanceOf(owner);

        token.transferFrom(owner, owner, 500);

        assertEq(token.balanceOf(owner), initialBalance);
        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════════════════
    // COMPLEX SCENARIOS
    // ═══════════════════════════════════════════════════════════

    function test_ComplexScenario_ApproveTransferFromApprove() public {
        vm.startPrank(owner);

        token.approve(user1, 10000);
        assertEq(token.allowance(owner, user1), 10000);

        vm.stopPrank();

        vm.prank(user1);
        token.transferFrom(owner, user2, 3000);
        assertEq(token.allowance(owner, user1), 7000);

        vm.prank(owner);
        token.approve(user1, 15000);
        assertEq(token.allowance(owner, user1), 15000);
    }

    function test_ComplexScenario_CircularTransfers() public {
        vm.prank(owner);
        token.transfer(user1, 10000);

        vm.prank(user1);
        token.transfer(user2, 10000);

        vm.prank(user2);
        token.transfer(user3, 10000);

        vm.prank(user3);
        token.transfer(owner, 10000);

        assertEq(token.balanceOf(owner), 1_000_000 * 10 ** 18);
        assertEq(token.balanceOf(user1), 0);
        assertEq(token.balanceOf(user2), 0);
        assertEq(token.balanceOf(user3), 0);
    }
}
