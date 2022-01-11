
import React, { useEffect, useState, useRef } from 'react';
import { ethers } from 'ethers';
import { parseEther, formatEther } from '@ethersproject/units';
import TokenABI from '../abis/Token.json'
import dBankABI from '../abis/dBank.json'
import dbankImg from '../dbank.png';
import Web3 from 'web3';
import BigNumber from "bignumber.js";
import './App.css';

import { Form, Container, Row, Col } from 'react-bootstrap'

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    let id = setInterval(() => {
      savedCallback.current();
    }, delay);
    return () => clearInterval(id);
  }, [delay]);
}
function App() {

  const [web3, setWeb3] = useState('undefined');
  const [account, setAccount] = useState('');
  const [token, setToken] = useState(null);
  const [dbank, setDbank] = useState(null);
  const [balance, setBalance] = useState(0);
  const [dbankAddress, setDbankAddress] = useState(null);
  const [payFeeAmount, setFeeAmount] = useState(0);
  const [balanceOfCimple, setBalanceOfCimple] = useState(0);
  const [payType, setPayType] = useState('ETH');
  const [processing, setProcessing] = useState(false);
  const [periodTime, setPeriodTIme] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [indicatorDate, setIndicatorDate] = useState(new Date());
  useEffect(() => {
    loadBlockchainData();
  }, []);
  
  // useInterval(() => {
  //   setPeriodTIme(periodTime + 1);
  // }, 1000)
  // Sets up a new Ethereum provider and returns an interface for interacting with the smart contract
  async function loadBlockchainData() {
    if(typeof window.ethereum!=='undefined'){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

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
        
        const _token = new ethers.Contract(TokenABI.networks[netId].address, TokenABI.abi, signer)
        const _dBank = new ethers.Contract(dBankABI.networks[netId].address, dBankABI.abi, signer)
        const _dBankAddress = dBankABI.networks[netId].address
        const _tokenAddress = TokenABI.networks[netId].address
        const _balanceOfToken = await _token.balanceOf(accounts[0]);
        setToken(_token);
        setDbank(_dBank);
        setDbankAddress(_dBankAddress);
        setBalanceOfCimple(_balanceOfToken);
      } catch (e) {
        console.log('Error', e)
        window.alert('Contracts not deployed to the current network')
      }

    } else {
      window.alert('Please install MetaMask')
    }
  }
  async function getBalanceOfToken(){
    if(web3 !== "undefined" || token !== "undefined") {
      try {
        // console.log(token);
        const balance = await token.balanceOf(account)
        setBalanceOfCimple(balance);
        balance = await web3.eth.getBalance(account)
        setBalance(balance);
        const tPrice = await token.getPriceOfToken();
        setTokenPrice(ethers.utils.formatUnits(tPrice, 9));
      } catch (error) {
        console.log("error get balance of Cimple token", error);
      }
    }
    
    
  }
  async function submitPayFee(event) {
    event.preventDefault();
    setProcessing(true);
    if(dbank !== 'undefined'){
      if(payType === "ETH"){
        try {
          // User inputs amount in terms of Ether, convert to Wei before sending to the contract.
          const wei = parseEther(payFeeAmount);
          await dbank.payFee({value: wei});
          // Wait for the smart contract to emit the LogBid event then update component state
          setProcessing(true);
          dbank.on('PayFee', (_, __) => {
            getBalanceOfToken();
            setProcessing(false);
          });
          
        } catch (e) {
          console.log('error paying fee: ', e);
          setProcessing(false);
        }
      }
      if(payType === "Cimple"){
        try {
          const wei = payFeeAmount;
          // console.log(wei);
          await dbank.payFeeByToken(account, wei);
          setProcessing(true);
          dbank.on('PayFee', (_, __) => {
            getBalanceOfToken();
            setProcessing(false);
          });
        } catch (error) {
          console.log('error paying fee: ', error);
          setProcessing(false);
        }
      }
    }
  }

  async function getTokenPriceByDate(selectedDate) {
    setIndicatorDate(selectedDate);
    let sTimeStamp = new Date(selectedDate)
    sTimeStamp = sTimeStamp / 1000;
    console.log(sTimeStamp)
    if(web3 !== "undefined" || token !== "undefined") {
      try {
        // const amount = parseEther(sTimeStamp.toString());
        // console.log(amount);
        await token.getPrice(sTimeStamp);
        token.on('ChangedPrice', (_, __) => {
          console.log(1);
          getBalanceOfToken();
          setProcessing(false);
        });
      } catch (error) {
        console.log("error token price of Cimple token", error);
      }
    }
  }
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          >
        <img src={dbankImg} className="App-logo" alt="logo" height="32"/>
          <b>d₿ank</b>
        </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>Welcome to WOLF d₿ank</h1>
          <h2>{account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-6 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <div>
                  How much do you want to pay fee?
                  <br></br>
                  (min. amount is 0.01 ETH)
                  <br></br>
                  Your Balance: ETH: {ethers.utils.formatUnits(balance, 18)} CimpleToken: {ethers.utils.formatUnits(balanceOfCimple, 0)}
                  <br></br>
                  
                  <form onSubmit={submitPayFee}>
                    <Form.Group controlId="formBasicSelect">
                      <Form.Label>Select Pay Type</Form.Label>
                      <Form.Control
                        as="select"
                        value={payType}
                        onChange={e => {
                          setPayType(e.target.value);
                        }}
                      >
                        <option value="ETH">ETH</option>
                        <option value="Cimple">Cimple</option>
                      </Form.Control>
                    </Form.Group>
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
                    <button type='submit' disabled={processing} className='btn btn-primary'>Pay</button>
                  </form>

                </div>
              </div>
            </main>
            <main role="main" className="col-lg-6 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <div>Period Time: {periodTime}    Token Price: {tokenPrice} GWEI</div>
                <Form>
                  <Form.Group controlId="duedate">
                    <Form.Control
                      type="date"
                      name="duedate"
                      placeholder="Due date"
                      value={indicatorDate}
                      onChange={(e) => getTokenPriceByDate(e.target.value)}
                    />
                  </Form.Group>
                </Form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
}

export default App;
