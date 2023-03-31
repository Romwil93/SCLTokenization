// SearchBar.js
import React from 'react';
import styles from '@/styles/SearchBar.module.css';

const SearchBar = () => {
  return (
    <div className={styles.searchBar}>
      {/* <img
        src="/SearchCompany.svg"
        alt="Search"
        className={styles.searchIcon}
      /> */}
      <input
        className={styles.searchInput}
        type="search"
        placeholder="Search"
      />
    </div>
  );
};

export default SearchBar;
