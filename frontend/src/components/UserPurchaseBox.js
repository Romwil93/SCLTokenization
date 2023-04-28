import React, { useState, useEffect } from 'react';
import styles from '../styles/UserPurchaseBox.module.css';
import styless from '../styles/CompanyBox.module.css';
import Web3 from 'web3';
import abi from '../contracts/abi.json';
import Button from '@mui/material/Button';
import { styled } from '@mui/system';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import useWeb3 from '../hooks/useWeb3';


const UserPurchaseBox = () => {
  const { web3, account, contract } = useWeb3();

  const [tokenPrice, setTokenPrice] = useState(0);
  const [amountInMatic, setamountInMatic] = useState('');
  const [amountInTokens, setAmountInTokens] = useState('');

  useEffect(() => {
    if (amountInMatic !== '') {
      setAmountInTokens(amountInMatic / tokenPrice);
    }
  }, [amountInMatic, tokenPrice]);

  useEffect(() => {
    if (amountInTokens !== '') {
      setamountInMatic(amountInTokens * tokenPrice);
    }
  }, [amountInTokens, tokenPrice]);

  const fetchTokenPrice = async () => {
    if (contract) {
      const price = await contract.methods.offeringPrice().call();
      const priceInMatic = web3.utils.fromWei(price.toString(), 'ether');
      setTokenPrice(parseFloat(priceInMatic));
    }
  };  

  useEffect(() => {
    fetchTokenPrice();
  }, [contract]);

  const buyTokens = async (amountInMatic) => {
    if (web3 && account && contract) {
      // Call the buyTokens function from your smart contract
      console.log('Buying tokens...');
      await contract.methods.buyTokens().send({ from: account, value: web3.utils.toWei(amountInMatic.toString(), 'ether') });
    } else {
      window.alert('Please connect to MetaMask and load the smart contract.');
    }
  };

  const CustomButton = styled(Button)({
    backgroundColor: '#D9D9D9;',
    color: '#000000',
    '&:hover': {
      backgroundColor: '#D9D9D8',
    },
    // Add any other custom styles here
  });

  const currencies = [
    {
      value: 'MATIC',
      label: '$',
    },
    {
      value: 'SCL',
      label: '€',
    },
  ];
  
  return (
    <div className={styles.container1}>
        <div className={styles.name}>
          <h1>Company Name AG</h1>
        </div>
        <div>
          <input
            type="number"
            value={amountInMatic}
            onChange={(e) => setamountInMatic(e.target.value)}
            className={styles.box0}
          />
          <img src="/CurSelector.svg" alt="Logo" className={styles.CurSelector0} />
        </div>
        <div>
          <input
            type="number"
            value={amountInTokens}
            onChange={(e) => setAmountInTokens(e.target.value)}
            className={styles.box1}
          />
          <img src="/CurSelector1.svg" alt="Logo" className={styles.CurSelector1} />
        </div>
        <button onClick={() => buyTokens(amountInMatic)} className={styles.buy}>Buy</button>
    </div>
  );
};

export default UserPurchaseBox;
