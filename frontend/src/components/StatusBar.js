import React, { useState, useEffect } from 'react';
import useWeb3 from '../hooks/useWeb3';  // adjust the path as necessary

const StatusBar = () => {
    const { web3, account, contract } = useWeb3();
    const [contractPaused, setContractPaused] = useState(false);
    const [tokenPrice, setTokenPrice] = useState(0);
    const [currentOffer, setCurrentOffer] = useState(0);

    const fetchTokenPrice = async () => {
        if (contract) {
          const price = await contract.methods.offeringPrice().call();
          const priceInMatic = web3.utils.fromWei(price.toString(), 'ether');
          setTokenPrice(parseFloat(priceInMatic));
        }
    }; 

    const fetchCurrentOffer = async () => {
        if (contract) {
            const offer = await contract.methods.offeringAmount().call();
            const offerInTokens = web3.utils.fromWei(offer.toString(), 'ether');
            setCurrentOffer(parseFloat(offerInTokens));
        }
    };

    useEffect(() => {
        fetchTokenPrice();
        fetchCurrentOffer();
    }, [contract]);

    return (
    <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#333',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-around',
    }}>
        <p>{`Current Price: ${tokenPrice}`}</p>
        <p>{`Current Offer: ${currentOffer}`}</p>
    </div>
    );
    };

export default StatusBar;
