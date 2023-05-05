import React, { useState } from 'react';
import { ref, set, auth, database } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import styles from '../styles/Registration.module.css';

const RegistrationForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [surname, setSurname] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create a new user with the provided email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // You can add your own logic to store the user's data in your database.
      // For example, you could create a new user in the database with the email, password, and fullName.
      const newUserRef = ref(database, 'users/' + user.uid);
      await set(newUserRef, { email, password, fullName, surname });

      setEmail('');
      setPassword('');
      setFullName('');
      setSurname('');
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.container1}>
      <h1>Registration</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <p>First Name</p>
          <TextField
            required
            id="outlined-required"
            label="First Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <p>Surname</p>
          <TextField
            required
            id="outlined-required"
            label="Surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
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
          />
        </div>
        <div>
          <p>Password</p>
          <TextField
            required
            id="outlined-required"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegistrationForm;
