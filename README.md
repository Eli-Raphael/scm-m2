# ATM MACHINE CONTRACT


## Description

This program is a simple Solidity contract, this contract is connected to a front end where an ATM machine can be seen. A user can deposit and withdraw ETH to and from it by connecting their metamask wallets. In addition to this, it has a tracker that shows the amount of times a user has transacted with the ATM machine.

## Getting Started

### Executing program

To run this program, you can use VS code or gitpod.

For those using VS code, open 3 terminals:

Terminal 1
1. git clone https://github.com/MetacrafterChris/SCM-Starter.git
2. npm i

Terminal 2
1. npx hardhat node

Terminal 3
1. npx hardhat run --network localhost scripts/deploy.js

To compile the code, click on the "Solidity Compiler" tab in the left-hand sidebar. Make sure the "Compiler" option is set to "0.8.11" (or another compatible version), and then click on the "Compile HelloWorld.sol" button.

Once the code is compiled, click the "Deploy & Run Transactions" tab in the left-hand sidebar. Select the "AutoDoor" contract from the dropdown menu, and then click on the "Deploy" button.

Below the deploy button you will see the "Deployed contract" where you can manipulate or call on the code and its functions using the user interface. Here you can test the interactions with the different functions as the owner and as other users.

Assessment.sol

```javascript
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
    ```
    


     ```
        // index.js
        import { useState, useEffect } from "react";
        import { ethers } from "ethers";
        import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
        
        export default function HomePage() {
          const [ethWallet, setEthWallet] = useState(undefined);
          const [account, setAccount] = useState(undefined);
          const [atm, setATM] = useState(undefined);
          const [balance, setBalance] = useState(undefined);
          const [transactionCount, setTransactionCount] = useState(undefined);
        
          const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
          const atmABI = atm_abi.abi;
        
          const getWallet = async () => {
            if (window.ethereum) {
              setEthWallet(window.ethereum);
            }
        
            if (ethWallet) {
              const accounts = await ethWallet.request({ method: "eth_accounts" });
              handleAccount(accounts);
            }
          };
        
          const handleAccount = (accounts) => {
            if (accounts.length > 0) {
              console.log("Account connected: ", accounts[0]);
              setAccount(accounts[0]);
            } else {
              console.log("No account found");
            }
          };
        
          const connectAccount = async () => {
            if (!ethWallet) {
              alert('MetaMask wallet is required to connect');
              return;
            }
        
            const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
            handleAccount(accounts);
        
            getATMContract();
          };
        
          const getATMContract = () => {
            const provider = new ethers.providers.Web3Provider(ethWallet);
            const signer = provider.getSigner();
            const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
        
            setATM(atmContract);
          };
        
          const getBalance = async () => {
            try {
              if (atm && account) {
                console.log("Fetching balance for account:", account);
                const balance = await atm.getBalance(account);
                console.log("Balance fetched:", balance.toString());
                setBalance(balance.toNumber());
              } else {
                console.error("ATM contract or account is not set");
              }
            } catch (error) {
              console.error("Error fetching balance:", error);
            }
          };
        
          const deposit = async () => {
            try {
              if (atm) {
                let tx = await atm.deposit(1);
                await tx.wait();
                getBalance();
                getTransactionCount(); // Update transaction count after deposit
              }
            } catch (error) {
              console.error("Error depositing:", error);
            }
          };
        
          const withdraw = async () => {
            try {
              if (atm) {
                let tx = await atm.withdraw(1);
                await tx.wait();
                getBalance();
                getTransactionCount(); // Update transaction count after withdrawal
              }
            } catch (error) {
              console.error("Error withdrawing:", error);
            }
          };
        
          const getTransactionCount = async () => {
            if (!ethWallet || !account) return;
        
            const provider = new ethers.providers.Web3Provider(ethWallet);
            const transactionCount = await provider.getTransactionCount(account);
            setTransactionCount(transactionCount);
          };
        
          const initUser = () => {
            if (!ethWallet) {
              return <p>Please install Metamask in order to use this ATM.</p>;
            }
        
            if (!account) {
              return <button onClick={connectAccount} className="btn">Please connect your Metamask wallet</button>;
            }
        
            if (balance === undefined) {
              getBalance();
            }
        
            return (
              <div className="info">
                <p><strong>Your Account:</strong> {account}</p>
                <p><strong>Your Balance:</strong> {balance} ETH</p>
                <p><strong>Total Transactions:</strong> {transactionCount}</p> {/* Display transaction count */}
                <div className="actions">
                  <button onClick={deposit} className="btn">Deposit 1 ETH</button>
                  <button onClick={withdraw} className="btn">Withdraw 1 ETH</button>
                </div>
              </div>
            );
          };
        
          useEffect(() => {
            getWallet();
            getTransactionCount(); // Fetch transaction count after initializing wallet and account
          }, []);
        
          return (
            <main className="page">
              <div className="container">
                <header>
                  <h1>Welcome to the Metacrafters ATM!</h1>
                </header>
                {initUser()}
              </div>
              <style jsx>{`
                .page {
                  background-color: #333;
                  min-height: 100vh;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }
                .container {
                  text-align: center;
                  padding: 20px;
                  background-color: #f0f4f8;
                  border-radius: 10px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  max-width: 600px;
                  margin: 40px auto;
                  font-family: Arial, sans-serif;
                }
                header {
                  margin-bottom: 20px;
                }
                h1 {
                  color: #333;
                }
                .info {
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  margin-bottom: 20px;
                }
                .info p {
                  margin: 10px 0;
                  font-size: 16px;
                }
                .actions {
                  margin-top: 20px;
                }
                .btn {
                  background-color: #007bff;
                  color: white;
                  padding: 10px 20px;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 16px;
                  margin: 5px;
                }
                .btn:hover {
                  background-color: #0056b3;
                }
              `}</style>
            </main>
          );
        }
        ```
        
After following the instructions, you have the front end already, through **npm run dev** in the first terminal. Now that you have the front end you are free to interact with the buttons and see the interactions with the metamask wallet.

```
## Authors

Elijah Raphael A. Gaylan
