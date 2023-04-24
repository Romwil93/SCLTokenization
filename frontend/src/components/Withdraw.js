import React, { useState } from 'react';
import styles from '../styles/CompanyBox.module.css';

const Offering = ({ web3, account, contract }) => {
    const handleWithdraw = async () => {
        try {
            await contract.methods.withdraw().send({ from: account });
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div>
            <h1>Withdraw</h1>
            <button className={styles.burn} onClick={handleWithdraw}>
                Withdraw
            </button>
        </div>
    );
};

export default Offering;