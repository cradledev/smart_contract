
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { parseEther, formatEther } from '@ethersproject/units';
import TokenABI from '../abis/Token.json'
import dBankABI from '../abis/dBank.json'
import dbankImg from '../dbank.png';
import Web3 from 'web3';
import './App.css';

function App() {

  const [web3, setWeb3] = useState('undefined');
  const [account, setAccount] = useState('');
  const [token, setToken] = useState(null);
  const [dbank, setDbank] = useState(null);
  const [balance, setBalance] = useState(0);
  const [dbankAddress, setDbankAddress] = useState(null);
  const [payFeeAmount, setFeeAmount] = useState(0);
  useEffect(() => {
    loadBlockchainData();
  }, []);

  // Sets up a new Ethereum provider and returns an interface for interacting with the smart contract
  async function loadBlockchainData() {
    if(typeof window.ethereum!=='undefined'){
      const web3 = new Web3(window.ethereum)
      const netId = await web3.eth.net.getId()
      // const accounts = await web3.eth.getAccounts()
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      //load balance
      if(typeof accounts[0] !=='undefined'){
        const balance = await web3.eth.getBalance(accounts[0])
        setAccount(accounts[0]);
        setBalance(balance);
        setWeb3(web3);
      } else {
        window.alert('Please login with MetaMask')
      }

      //load contracts
      try {
        const _token = new web3.eth.Contract(TokenABI.abi, TokenABI.networks[netId].address)
        const _dBank = new web3.eth.Contract(dBankABI.abi, dBankABI.networks[netId].address)
        const _dBankAddress = dBankABI.networks[netId].address
        const _tokenAddress = TokenABI.networks[netId].address
        setToken(_token);
        setDbank(_dBank);
        setDbankAddress(_dBankAddress);
      } catch (e) {
        console.log('Error', e)
        window.alert('Contracts not deployed to the current network')
      }

    } else {
      window.alert('Please install MetaMask')
    }
  }

  async function submitPayFee(event) {
    event.preventDefault();
    if(dbank !== 'undefined'){
      try {
        // User inputs amount in terms of Ether, convert to Wei before sending to the contract.
        const wei = parseEther(payFeeAmount);
        await dbank.payFee({ value: wei });
        // Wait for the smart contract to emit the LogBid event then update component state
        dbank.on('PayFee', (_, __) => {
          alert(1);
        });
      } catch (e) {
        console.log('error paying fee: ', e);
      }
    }
  }
  // async deposit(amount) {
  //   if(this.state.dbank!=='undefined'){
  //     try{
  //       await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account})
  //     } catch (e) {
  //       console.log('Error, deposit: ', e)
  //     }
  //   }
  // }

  // async withdraw(e) {
  //   e.preventDefault()
  //   if(this.state.dbank!=='undefined'){
  //     try{
  //       await this.state.dbank.methods.withdraw().send({from: this.state.account})
  //     } catch(e) {
  //       console.log('Error, withdraw: ', e)
  //     }
  //   }
  // }

  // async borrow(amount) {
  //   if(this.state.dbank!=='undefined'){
  //     try{
  //       await this.state.dbank.methods.borrow().send({value: amount.toString(), from: this.state.account})
  //     } catch (e) {
  //       console.log('Error, borrow: ', e)
  //     }
  //   }
  // }

  // async payOff(e) {
  //   e.preventDefault()
  //   if(this.state.dbank!=='undefined'){
  //     try{
  //       const collateralEther = await this.state.dbank.methods.collateralEther(this.state.account).call({from: this.state.account})
  //       const tokenBorrowed = collateralEther/2
  //       await this.state.token.methods.approve(this.state.dBankAddress, tokenBorrowed.toString()).send({from: this.state.account})
  //       await this.state.dbank.methods.payOff().send({from: this.state.account})
  //     } catch(e) {
  //       console.log('Error, pay off: ', e)
  //     }
  //   }


    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          >
        <img src={dbank} className="App-logo" alt="logo" height="32"/>
          <b>d₿ank</b>
        </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>Welcome to d₿ank</h1>
          <h2>{account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <div>
                  How much do you want to pay fee?
                  <br></br>
                  (min. amount is 0.01 ETH)
                  <br></br>
                  (1 deposit is possible at the time)
                  <br></br>
                  <form onSubmit={submitPayFee}>
                    <div className='form-group mr-sm-2'>
                    <br></br>
                      <input
                        id='payFeeAmount'
                        step="0.01"
                        type='number'
                        value={payFeeAmount}
                        onChange={(event) => setFeeAmount(event.target.value)}
                        className="form-control form-control-md"
                        placeholder='amount...'
                        required />
                    </div>
                    <button type='submit' className='btn btn-primary'>Pay</button>
                  </form>

                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
}

export default App;
