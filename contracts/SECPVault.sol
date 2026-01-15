// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address, address, uint) external returns (bool);
    function transfer(address, uint) external returns (bool);
    function balanceOf(address) external view returns (uint);
}

interface IRWA {
    function lockAsset(uint256 assetId) external;
    function unlockAsset(uint256 assetId) external;
    function getAssetValue(uint256 assetId) external view returns (uint256);
    function isAssetLocked(uint256 assetId) external view returns (bool);
}

contract SECPVault {

    enum Mode { NORMAL, CRASH }
    Mode public mode;

    address public riskyToken;
    address public safeToken;
    address public yieldToken;
    address public rwaToken;

    uint public riskyBal;
    uint public safeBal;
    uint public yieldBal;
    uint public rwaLockedValue;

    uint256[] public lockedRWAAssets;

    address public loanContract;
    address public owner;

    modifier onlyLoan() {
        require(msg.sender == loanContract, "Not loan contract");
        _;
    }

    constructor(address _risky, address _safe, address _yield, address _rwa) {
        riskyToken = _risky;
        safeToken = _safe;
        yieldToken = _yield;
        rwaToken = _rwa;
        owner = msg.sender;
        mode = Mode.NORMAL;
    }

    function setLoanContract(address _loan) external {
        require(msg.sender == owner, "only owner");
        require(loanContract == address(0), "already set");
        loanContract = _loan;
    }

    function deposit(uint r, uint s, uint y) external {
        if (r > 0) IERC20(riskyToken).transferFrom(msg.sender, address(this), r);
        if (s > 0) IERC20(safeToken).transferFrom(msg.sender, address(this), s);
        if (y > 0) IERC20(yieldToken).transferFrom(msg.sender, address(this), y);

        riskyBal += r;
        safeBal += s;
        yieldBal += y;
    }

    // 🔥 Core Innovation
    function triggerCrashMode() external onlyLoan {
        require(mode == Mode.NORMAL, "Already protected");
        mode = Mode.CRASH;

        // symbolic reshaping: risky → safe
        uint shift = riskyBal / 2;
        riskyBal -= shift;
        safeBal += shift;
    }

    // 🔥 Anti-liquidation: yield used to protect loan
    function divertYield(uint amount) external onlyLoan {
        require(yieldBal >= amount, "Not enough yield");
        yieldBal -= amount;
    }
// 🏠 RWA Integration: Lock real-world assets as emergency collateral
    function lockRWA(uint256[] memory assetIds) external onlyLoan {
        require(mode == Mode.CRASH, "Only in crash mode");
        
        for (uint i = 0; i < assetIds.length; i++) {
            uint256 assetId = assetIds[i];
            require(!IRWA(rwaToken).isAssetLocked(assetId), "Asset already locked");
            
            IRWA(rwaToken).lockAsset(assetId);
            uint256 value = IRWA(rwaToken).getAssetValue(assetId);
            rwaLockedValue += value;
            lockedRWAAssets.push(assetId);
        }
    }

    function unlockRWA(uint256 assetId) external onlyLoan {
        IRWA(rwaToken).unlockAsset(assetId);
        uint256 value = IRWA(rwaToken).getAssetValue(assetId);
        rwaLockedValue -= value;
    }

    function totalValue() public view returns (uint) {
        return riskyBal + safeBal + yieldBal + rwaLockedValue;
    }

    function getLockedRWAAssets() external view returns (uint256[] memory) {
        return lockedRWAAssets;
    }

    // 🔄 Reset vault mode for testing
    function resetMode() external onlyLoan {
        mode = Mode.NORMAL;
        rwaLockedValue = 0;
        delete lockedRWAAssets;
    }
}
