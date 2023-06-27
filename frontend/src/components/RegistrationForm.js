import React, { useState, useEffect } from 'react';
import { ref, set, database, push } from '../firebase';
import { getDatabase, get } from 'firebase/database';
import levenshtein from 'fast-levenshtein';
import useWeb3 from '../hooks/useWeb3';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import styles from '../styles/Registration.module.css';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';


const RegistrationForm = () => {
  const { web3, account, contract } = useWeb3();
  const [type, setType] = useState(''); 
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  var [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [postCode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [differentAccount, setDifferentAccount] = useState('');
  const [nameError, setNameError] = useState(null);

  useEffect(() => {
    setDifferentAccount(account || '');
  }, [account]);

  const checkName = async (name) => {
    const axios = require('axios');
    let data = JSON.stringify({
      "model": "gpt-3.5-turbo",
      "messages": [
        {
          "role": "user",
          "content": "Return a number in the range of 0 and 1, based on the likely hood that below name is fictional or real - 1 being fictional, 0 being real. It doesn't matter if you are uncertain, just give me a number, and only a number! \n" + name
        }
      ],
      "max_tokens": 3,
      "temperature": 0.5,
    });
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.openai.com/v1/chat/completions',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${apiKey}`
      },
      data : data
    };

    try {
      const response = await axios.request(config);
      const prob = JSON.stringify(response.data['choices'][0]['message']['content']);
      // console.log(prob);
      return JSON.stringify(prob);
    } catch (error) {
      console.log(error);
    }
  };

  const handleNameBlur = async (e) => {
    const name = e.target.value;
  
    var result = await checkName(name);
    result = result.replace(/"/g, ''); // Remove extra quotes
    result = result.replace(/\\/g, '').replace(/"/g, ''); // Remove backslashes and quotes
    var floatResult = parseFloat(result); // Convert to float
    console.log(floatResult);

    if (result > 0.91) {
      setNameError("This name appears to be fictional. Please use your real name.");
    } else {
      setNameError(null);
    }
  };

  const typeOptions = ['Natural Person', 'Legal Entity'];
  const countries = ['Switzerland', 'United States', 'Canada', 'United Kingdom', 'Australia']; // Add more countries as needed

  const checkSanctionsList = async (name) => {
    const db = getDatabase();
    const sanctionsListRef = ref(db, 'sanctions/');
    const snapshot = await get(sanctionsListRef);
    const sanctionsList = snapshot.val();
    const sanctionedNames = Object.values(sanctionsList).map(item => item.name);
    let isSanctioned = false;
    const maxAllowedDistance = 2; // Define your own value for the maximum allowed distance
  
    const lowerCaseName = name.toLowerCase(); // Convert user's name to lower case

    sanctionedNames.forEach(sanctionedName => {
      const lowerCaseSanctionedName = sanctionedName.toLowerCase(); // Convert sanctioned name to lower case
      const distance = levenshtein.get(lowerCaseName, lowerCaseSanctionedName);
      if (distance <= maxAllowedDistance) {
        isSanctioned = true;
      }
    });

    return isSanctioned;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent form submission if nameError is not null
    if (nameError) {
      setError('Name seems to be fictional, please use your real name.');
      return;
    }

    // Check sanctions list
    const isSanctioned = await checkSanctionsList(fullName);
    if (isSanctioned) {
      setError('This name is on the sanctions list and cannot register.');
      return;
    }
  
    try {
      // Create a new user in the database with a unique ID
      const newUserRef = ref(database, 'users/');
      const newUser = push(newUserRef);
      await set(newUser, { type, fullName, email, address, postCode, city, country, differentAccount });
  
      setType('');
      setFullName('');
      setEmail('');
      setCountry('');
      setAddress('');
      setPostcode('');
      setCity('');
      setCountry('');
      setError(null);
      setNameError(null);
      setSuccess('Registration successful!');
    } catch (error) {
        setError(error.message);
    }
  };
  
  return (
    <div className={styles.container1}>
      <div className={styles.rectangle}>
        <h1>Registration</h1>
        <form onSubmit={handleSubmit} >
        <div>
            <p>Type</p>
            <FormControl fullWidth>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                required
                labelId="type-label"
                id="type-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                sx={{ width: '100%' }}
                className={styles.customTextField}
              >
                {typeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div>
            <p>Name</p>
            <TextField
              required
              id="outlined-required"
              label="Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={handleNameBlur}
              error={!!nameError}
              helperText={nameError}
              className={styles.customTextField}
              sx={{ width: '100%' }}
            />
          </div>
          <div>
            <p>Email</p>
            <TextField
              required
              id="outlined-required"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.customTextField}
              sx={{ width: '100%' }}
            />
          </div>
          <div>
            <p>Address</p>
            <TextField
              required
              id="outlined-required"
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={styles.customTextField}
              sx={{ width: '100%' }}
            />
          </div>
          <div>
            <p>Post Code</p>
            <TextField
              required
              id="outlined-required"
              label="Post Code"
              value={postCode}
              onChange={(e) => setPostcode(e.target.value)}
              className={styles.customTextField}
              sx={{ width: '100%' }}
            />
          </div>
          <div>
            <p>City</p>
            <TextField
              required
              id="outlined-required"
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={styles.customTextField}
              sx={{ width: '100%' }}
            />
          </div>
          <div>
            <p>Country</p>
            <FormControl fullWidth>
              <InputLabel id="country-label">Country</InputLabel>
              <Select
                labelId="country-label"
                id="country-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                sx={{ width: '100%' }}
                className={styles.customTextField}
              >
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div>
            <p>Ethereum Address</p>
            <TextField
              required
              id="outlined-required"
              label=""
              value={differentAccount}
              onChange={(e) => setDifferentAccount(e.target.value)}
              className={styles.customTextField}
              sx={{ width: '100%' }}
            />
          </div>
          <div>
            <FormControlLabel 
              required control={<Checkbox sx={{ color: 'white' }}/>} 
              label="Switzerland is my only tax country" 
              sx={{ color: 'white' }}
            />
          </div>
          <Button className={styles.button} type="submit" variant="contained" sx={{ width: '100%', mt: 2, mb: 2 }}>
            Register
          </Button>
          {error && 
            <Stack sx={{ width: '100%', mb: '15px' }} spacing={2}>
              <Alert severity="error">{ error }</Alert>
            </Stack>
          }
          {success &&
            <Stack sx={{ width: '100%', mb: '15px' }} spacing={2}>
                <Alert severity="success">{ success }</Alert>
            </Stack>
          }        
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
