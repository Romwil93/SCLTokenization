import React, { useState } from 'react';
import styles from '../styles/CompanyBox.module.css';

const Offering = ({ web3, account, contract }) => {
    var [price, setPrice] = useState(0);

    const handleChange = (e) => {
        setPrice(e.target.value);
    };

    const handleSetPrice = async () => {
        if (price < 0) return;
        try {
            price = web3.utils.toWei(price, 'ether');
            await contract.methods.startOffering(price, amount).send({ from: account });
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div>
            <h1>Change Price</h1>
            <input
                type="number"
                className={styles.amountBox}
                value={price}
                onChange={handleChange}
            />
            <button className={styles.burn} onClick={handleSetPrice}>
                Set Price
            </button>
        </div>
    );
};

export default Offering;