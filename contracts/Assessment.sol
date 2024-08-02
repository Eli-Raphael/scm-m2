// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    mapping(address => uint256) public balances;

    event Deposit(address indexed account, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);

    constructor() {
        owner = payable(msg.sender);
    }

    function getBalance(address account) public view returns(uint256){
        return balances[account];
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balances[msg.sender];

        // perform transaction
        balances[msg.sender] += _amount;

        // assert transaction completed successfully
        assert(balances[msg.sender] == _previousBalance + _amount);

        // emit the event
        emit Deposit(msg.sender, _amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        uint _previousBalance = balances[msg.sender];
        if (balances[msg.sender] < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balances[msg.sender],
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balances[msg.sender] -= _withdrawAmount;

        // assert the balance is correct
        assert(balances[msg.sender] == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(msg.sender, _withdrawAmount);
    }
}
