// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Deposit {

    mapping(address => uint256) public balances;

    event Deposited(
        address indexed user,
        uint256 amount
    );

    event Withdrawn(
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

      function withdraw(uint256 amount) public {
        uint256 userBalance = balances[msg.sender];
        require(userBalance >= amount, "Insufficient balance");

        // Update balance first to prevent reentrancy
        balances[msg.sender] -= amount;

        // Send ETH
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function getBalance(address user)
        public
        view
        returns(uint256)
    {
        return balances[user];
    }


}