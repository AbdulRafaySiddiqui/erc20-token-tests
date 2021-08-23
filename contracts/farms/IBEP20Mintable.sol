// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.6.0;

import "./IBEP20.sol";

interface IBEP20Mintable is IBEP20 {
    function mint(address to, uint256 amount) external;
    function transferOwnership(address newOwner) external;
}