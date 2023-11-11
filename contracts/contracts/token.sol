// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Geo is ERC20 {
    mapping(address => bool) claimedAirdropPlayerList;
    constructor() ERC20("Geo", "Geo") {
    }
    function airdrop() external {
        require(claimedAirdropPlayerList[msg.sender] == false, "Geo: This user has claimed airdrop already");
        _mint(msg.sender, 100000);
        claimedAirdropPlayerList[msg.sender] = true;
    }
    function create(address target) external {
        require(claimedAirdropPlayerList[target] == false, "Geo: This user has claimed airdrop already");
        _mint(target, 100000);
        claimedAirdropPlayerList[target] = true;
    }
}