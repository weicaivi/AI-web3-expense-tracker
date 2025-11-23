// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FirstExpenseNFT is ERC721, Ownable {
    uint256 public tokenCounter;
    mapping(address => bool) public hasMinted;
    
    event FirstExpenseMinted(address indexed user, uint256 tokenId);
    
    constructor() ERC721("First Expense NFT", "FENFT") Ownable(msg.sender) {
        tokenCounter = 0;
    }
    
    function mintFirstExpense() external {
        require(!hasMinted[msg.sender], "User has already minted first expense NFT");
        
        uint256 newTokenId = tokenCounter;
        _safeMint(msg.sender, newTokenId);
        
        hasMinted[msg.sender] = true;
        tokenCounter++;
        
        emit FirstExpenseMinted(msg.sender, newTokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "ERC721: URI query for nonexistent token");
        
        // Simple JSON metadata
        return string(abi.encodePacked(
            'data:application/json;base64,',
            'eyJuYW1lIjoiRmlyc3QgRXhwZW5zZSBORlQiLCJkZXNjcmlwdGlvbiI6IkNvbmdyYXR1bGF0aW9ucyBvbiB5b3VyIGZpcnN0IGV4cGVuc2UgcmVjb3JkISIsImltYWdlIjoiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCM2FXUjBhRDBpTWpBd0lpQm9aV2xuYUhROUlqSXdNQ0lpSUhacFpYZENiM2c5SWpBZ01DQXLNVEF3SUNJZ2VHMXNibk05SW1oMGRIQTZMeTkzZDNjdWR6TXViM0puTHpJd01EQXZjM1puSWo0OGNtVmpkQ0IzYVdSMGFEMGlNVEE9In0='
        ));
    }
}
