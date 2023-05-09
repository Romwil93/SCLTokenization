import React, { useState } from 'react';
import { ref, set, auth, database } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import styles from '../styles/Registration.module.css';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';


const RegistrationForm = () => {
  const [type, setType] = useState(''); // ['natural Person', 'legal entity']
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [surname, setSurname] = useState('');
  const [error, setError] = useState(null);
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [postCode, setPostcode] = useState('');
  const [city, setCity] = useState('');



  const typeOptions = ['Natural Person', 'Legal Entity'];
  const countries = ['Switzerland', 'United States', 'Canada', 'United Kingdom', 'Australia']; // Add more countries as needed



  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create a new user with the provided email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // You can add your own logic to store the user's data in your database.
      // For example, you could create a new user in the database with the email, password, and fullName.
      const newUserRef = ref(database, 'users/' + user.uid);
      await set(newUserRef, { email, fullName, type, country, address, postCode });

      setEmail('');
      setPassword('');
      setFullName('');
      setCountry('');
      setAddress('');
      setPostcode('');
      setCity('')
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.container1}>
      <div className={styles.rectangle}>
        <h1>Registration</h1>
        {error && <p>{error}</p>}
        <form onSubmit={handleSubmit} >
        <div>
            <p>Type</p>
            <FormControl fullWidth>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
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
          <Button className={styles.button} type="submit" variant="contained" sx={{ width: '100%', mt: 2, mb: 2 }}>
            Register
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
