// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Deposit {

    mapping(address => uint256) public balances;

    event Deposited(
        address indexed user,
        uint256 amount
    );

    function deposit() public payable {

        require(msg.value > 0, "Send ETH");

        balances[msg.sender] += msg.value;

        emit Deposited(
            msg.sender,
            msg.value
        );
    }

    function getBalance(address user)
        public
        view
        returns(uint256)
    {
        return balances[user];
    }
}