import React, { useState } from 'react';
import styles from '../styles/CompanyBox.module.css';

const Offering = ({ web3, account, contract }) => {
    const [msg, setMsg] = useState("Enter your announcement here");

    
    const handleChange = (e) => {
        setMsg(e.target.value);
    };
    
    const handleAnnouncement = async () => {
        try {
            await contract.methods.announcement(msg).send({ from: account });
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div>
            <h1>Announcement</h1>
            <input
                type="string"
                className={styles.amountBox}
                value={msg}
                onChange={handleChange}
            />
            <button className={styles.burn} onClick={handleAnnouncement}>
                Send Announcement
            </button>
        </div>
    );
};

export default Offering;