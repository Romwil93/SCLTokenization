// Header.js
import React from 'react';
import styles from '@/styles/header.module.css';
import SearchBar from './SearchBar';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';


const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src="/SCLLogo.svg" alt="Logo" />
      </div>
        <TextField 
            id="outlined-search" 
            label="Search company" 
            type="search"
            sx={{
                // Set the text color
                color: 'white',
                '& .MuiOutlinedInput-root': {
                // Set the border color
                '& fieldset': {
                    borderColor: 'white',
                },
                '&:hover fieldset': {
                    borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                    borderColor: 'white',
                },
                },
                // Set the placeholder text color
                '& .MuiInputLabel-outlined': {
                color: 'white',
                },
                '& .MuiInputLabel-outlined.Mui-focused': {
                color: 'white',
                },
                '& .MuiOutlinedInput-input': {
                // Set the input text color
                color: 'white',
                },
            }}
            InputProps={{
            startAdornment: (
                <InputAdornment position="start" sx={{ color: 'white' }}>
                    <SearchIcon color="inherit" />
                </InputAdornment>
                ),
            }}
        />
      <div className={styles.connectWallet}>
        <button><img src="/ConnectWallet.svg" alt="connect wallet" /></button>
      </div>
    </header>
  );
};

export default Header;
