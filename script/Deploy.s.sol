// pragma solidity ^0.8.30;

// import { Script } from "forge-std/Script.sol";
// import { RewardToken } from "../src/RewardToken.sol";
// import { LiquidityStaking } from "../src/LiquidityStaking.sol";

// contract Deploy is Script {
//     function run() external {
//         vm.startBroadcast();

//         RewardToken token = new RewardToken();
//         new LiquidityStaking(address(token));

//         vm.stopBroadcast();
//     }
// }

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {RewardToken} from "../src/RewardToken.sol";
import {LiquidityStaking} from "../src/LiquidityStaking.sol";

contract Deploy is Script {
    uint256 constant REWARD_SUPPLY = 1_000_000 * 10 ** 18;

    function run() external {
        vm.startBroadcast();

        RewardToken token = new RewardToken();
        console.log("RewardToken:     ", address(token));

        LiquidityStaking staking = new LiquidityStaking(address(token));
        console.log("LiquidityStaking:", address(staking));

        // ✅ Переводим токены в контракт
        token.transfer(address(staking), REWARD_SUPPLY);
        console.log("Transferred 1M REW to staking");

        vm.stopBroadcast();

        // Проверяем
        uint256 balance = token.balanceOf(address(staking));
        console.log("Staking balance:", balance / 10 ** 18, "REW");

        (uint256 tvl, uint256 apy, uint256 rate, uint256 contractBalance) = staking.getPoolInfo();
        console.log("\n=== Pool Info ===");
        console.log("TVL:     ", tvl);
        console.log("APY:     ", apy, "%");
        console.log("Rate:    ", rate);
        console.log("Balance: ", contractBalance / 10 ** 18, "REW");
    }
}
