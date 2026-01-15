// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RWAToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint public totalSupply;

    struct RWAAsset {
        string assetType; // "Real Estate", "Invoice", "Gold", etc.
        string location;
        uint256 value;
        bool locked;
        uint256 lockedAt;
    }

    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;
    mapping(uint256 => RWAAsset) public assets;
    mapping(address => uint256[]) public userAssets;
    
    uint256 public nextAssetId = 1;
    address public protocolVault;

    event AssetTokenized(uint256 indexed assetId, address indexed owner, string assetType, uint256 value);
    event AssetLocked(uint256 indexed assetId, address indexed locker);
    event AssetUnlocked(uint256 indexed assetId);

    constructor(string memory _name, string memory _symbol, uint _supply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _supply;
        balanceOf[msg.sender] = _supply;
    }

    function setProtocolVault(address _vault) external {
        require(protocolVault == address(0), "Already set");
        protocolVault = _vault;
    }

    function tokenizeAsset(
        string memory assetType,
        string memory location,
        uint256 value
    ) external returns (uint256) {
        require(value > 0, "Invalid value");
        
        uint256 assetId = nextAssetId++;
        assets[assetId] = RWAAsset({
            assetType: assetType,
            location: location,
            value: value,
            locked: false,
            lockedAt: 0
        });
        
        userAssets[msg.sender].push(assetId);
        balanceOf[msg.sender] += value;
        totalSupply += value;
        
        emit AssetTokenized(assetId, msg.sender, assetType, value);
        return assetId;
    }

    function lockAsset(uint256 assetId) external {
        require(msg.sender == protocolVault, "Only vault");
        require(!assets[assetId].locked, "Already locked");
        
        assets[assetId].locked = true;
        assets[assetId].lockedAt = block.timestamp;
        
        emit AssetLocked(assetId, msg.sender);
    }

    function unlockAsset(uint256 assetId) external {
        require(msg.sender == protocolVault, "Only vault");
        require(assets[assetId].locked, "Not locked");
        
        assets[assetId].locked = false;
        
        emit AssetUnlocked(assetId);
    }

    function getAssetValue(uint256 assetId) external view returns (uint256) {
        return assets[assetId].value;
    }

    function isAssetLocked(uint256 assetId) external view returns (bool) {
        return assets[assetId].locked;
    }

    function transfer(address to, uint amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "balance low");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function approve(address spender, uint amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint amount) external returns (bool) {
        require(balanceOf[from] >= amount, "balance low");
        require(allowance[from][msg.sender] >= amount, "not allowed");

        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
