// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVault {
    function totalValue() external view returns(uint);
    function yieldBal() external view returns(uint);
    function triggerCrashMode() external;
    function divertYield(uint) external;
    function lockRWA(uint256[] memory assetIds) external;
    function resetMode() external;
}

contract SECPBorrow {

    IVault public vault;
    uint public debt;
    bool public protectedMode;
    bool public rwaLocked;
    uint256[] public rwaAssetIds;

    constructor(address _vault) {
        vault = IVault(_vault);
    }

    function takeLoan(uint amount) external {
        require(debt == 0, "Loan exists");
        require(amount > 0, "Amount must be > 0");
        require(vault.totalValue() > 0, "No collateral deposited");
        
        // Check health factor would be safe after loan
        uint futureHealth = vault.totalValue() * 100 / amount;
        require(futureHealth >= 150, "Insufficient collateral - need 150% min");
        
        debt = amount;
    }

    function repay(uint amount) external {
        require(debt >= amount, "too much");
        debt -= amount;
    }

    // simplified health factor
    function healthFactor() public view returns(uint) {
        if (debt == 0) return 0;
        return vault.totalValue() * 100 / debt;
    }

    function setRWAAssets(uint256[] memory assetIds) external {
        require(rwaAssetIds.length == 0, "Already set");
        rwaAssetIds = assetIds;
    }

    // 🔥 Anti-liquidation logic with automatic crash simulation
    function checkAndProtect() external {
        require(!protectedMode, "Already protected");
        require(debt > 0, "No debt");
        
        // Increase debt by 100% to simulate severe market crash
        debt = debt * 200 / 100;
        
        // Always trigger protection when this is called
        protectedMode = true;
        vault.triggerCrashMode();
        
        // Use yield to reduce the increased debt (use whatever is available)
        uint yieldNeeded = debt / 10;
        uint yieldAvailable = vault.yieldBal();
        uint yieldToUse = yieldAvailable < yieldNeeded ? yieldAvailable : yieldNeeded;
        
        if (yieldToUse > 0) {
            vault.divertYield(yieldToUse);
            debt -= yieldToUse;
        }
        
        // Also lock RWA assets automatically
        if (!rwaLocked && rwaAssetIds.length > 0) {
            rwaLocked = true;
            vault.lockRWA(rwaAssetIds);
        }
    }

    // 🏠 Advanced protection: Lock RWA when health critically low
    function checkAndLockRWA() external {
        if (healthFactor() < 110 && !rwaLocked && rwaAssetIds.length > 0) {
            rwaLocked = true;
            vault.lockRWA(rwaAssetIds);
        }
    }

    // 🔄 Reset protection for testing (only for demo purposes)
    function resetProtection() external {
        protectedMode = false;
        rwaLocked = false;
        vault.resetMode();
    }
}
