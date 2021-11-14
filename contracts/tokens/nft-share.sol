// // SPDX-License-Identifier: GPL-3.0
// pragma solidity ^0.8.4;

// import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; //modifier for non-reentrance 
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// import "hardhat/console.sol";

// contract dNFT {
    
//     // ------------------------------ Variables ------------------------------
//     

//     // Percentage of ownership over a token  
//     mapping(address => mapping(uint => uint)) ownerToTokenShare;

//     // How much owners have of a token
//     mapping(uint => mapping(address => uint)) tokenToOwnersHoldings;
//     
//     //who owns the token (could be more than one)
//     mapping(uint => address[]) tokenOwners;

//     // If a token has been created
//     mapping(uint => bool) mintedToken;

//     // Number of equal(fungible) units that constitute a token (that a token can be divised to)
//     uint public divisibility = 1000; // All tokens have the same divisibility in our example

//     // total of managed/tracked tokens by this smart contract
//     uint public totalSupply;
//     
//     event Minted (address owner, uint tokenId);
//     event Transfer(address from, address to, uint tokenId, uint units);
//     
//     


//     // ------------------------------ Modifiers ------------------------------

//     modifier onlyNonExistentToken(uint _tokenId) {
//         require(mintedToken[_tokenId] == false);
//         _;
//     }

//     modifier onlyExistentToken(uint _tokenId) {
//         require(mintedToken[_tokenId] == true);
//         _;
//     }
//     

//     // ------------------------------ View functions ------------------------------

//     /// @dev The balance an owner have of a token
//     function unitsOwnedOfAToken(address _owner, uint _tokenId) public view returns (uint _balance)
//     {
//         uint balanceOfAToken = ownerToTokenShare[_owner][_tokenId];
//         return balanceOfAToken;
//     }
//     
//     function listOfTokenOwners(uint _tokenId) public view returns(address [] memory) {
//         return tokenOwners[_tokenId];
//     }
//     
//     function ownersWithZeroShare (uint _tokenId) public view returns(uint _index){
//         address [] memory owners = tokenOwners[_tokenId];
//         for(uint32 i = 0; i < owners.length; i++) {
//             if(unitsOwnedOfAToken(owners[i], _tokenId) == 0) {
//                 return uint(i+1);
//             }
//         }
//     }
//     
//     function isUserAlreadyExist (address _user, uint _tokenId) public view returns (bool mayOrMayNot) {
//         address [] memory owners = tokenOwners[_tokenId];
//         for(uint32 i = 0; i < owners.length; i++) {
//             if(owners[i] == _user) {
//                 return true;
//             }
//         }
//         return false;
//     }



//     
//     // ------------------------------ Core public functions ------------------------------

//     /// @dev Anybody can create a token in our example
//     /// @notice Minting grants 100% of the token to a new owner in our example
//     function mint(address _owner, uint _tokenId) public onlyNonExistentToken (_tokenId)
//     {    
//         mintedToken[_tokenId] = true;

//         _addShareToNewOwner(_owner, _tokenId, divisibility); 
//         _addNewOwnerHoldingsToToken(_owner, _tokenId, divisibility);

//         totalSupply = totalSupply + 1;

//         emit Minted(_owner, _tokenId); // emit event
//     }

//     /// @dev transfer parts of a token to another user
//     function transfer(address _to, uint _tokenId, uint _units) public onlyExistentToken (_tokenId)
//     {
//         require(ownerToTokenShare[msg.sender][_tokenId] >= _units);
//         // TODO should check _to address to avoid losing tokens units
//         // will check _to address on frontend using "web3.utils.toChecksumAddress(rawInput)" 

//         _removeShareFromLastOwner(msg.sender, _tokenId, _units);
//         _removeLastOwnerHoldingsFromToken(msg.sender, _tokenId, _units);

//         _addShareToNewOwner(_to, _tokenId, _units);
//         _addNewOwnerHoldingsToToken(_to, _tokenId, _units);
//         
//         //this will pop out the owners with zero holding over a token
//         uint res = ownersWithZeroShare(_tokenId);
//         if(res != 0) {
//             address [] storage owners = tokenOwners[_tokenId];
//             owners[res-1] = owners[owners.length - 1];
//             owners.pop();
//             tokenOwners[_tokenId] = owners;
//         }

//         emit Transfer(msg.sender, _to, _tokenId, _units); // emit event
//     }
//     

//     // ------------------------------ Helper functions (internal functions) ------------------------------

//     // Remove token units from last owner
//     function _removeShareFromLastOwner(address _owner, uint _tokenId, uint _units) internal
//     {
//         ownerToTokenShare[_owner][_tokenId] -= _units;
//     }

//     // Add token units to new owner
//     function _addShareToNewOwner(address _owner, uint _tokenId, uint _units) internal
//     {
//         ownerToTokenShare[_owner][_tokenId] += _units;
//     }

//     // Remove units from last owner 
//     function _removeLastOwnerHoldingsFromToken(address _owner, uint _tokenId, uint _units) internal
//     {
//         tokenToOwnersHoldings[_tokenId][_owner] -= _units;
//     }

//     // Add the units to new owner
//     function _addNewOwnerHoldingsToToken(address _owner, uint _tokenId, uint _units) internal
//     {
//         tokenToOwnersHoldings[_tokenId][_owner] += _units;
//         
//         // avoid reEntrance of a user for the same token.
//         if(!isUserAlreadyExist(_owner, _tokenId)){
//             tokenOwners[_tokenId].push(_owner);
//         }
//     }
// }