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
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <p>Total Transactions: {transactionCount}</p> {/* Display transaction count */}
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
    getTransactionCount(); // Fetch transaction count after initializing wallet and account
  }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}
      </style>
    </main>
  );
}

