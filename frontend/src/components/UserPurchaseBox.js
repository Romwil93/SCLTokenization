import React from 'react';
import styles from '@/styles/UserPurchaseBox.module.css';

const UserPurchaseBox = () => {
  return (
    <div>
        <div className={styles.rectangle}>
            <h1>Company Name AG</h1>
            <input type="number" className={styles.box0} />
            <input type="number" className={styles.box1} />
            <button className={styles.buy}>Buy</button>
        </div>
    </div>
  );
};

export default UserPurchaseBox;
