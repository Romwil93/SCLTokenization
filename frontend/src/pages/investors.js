import React from 'react';
import Header from '../components/Header';
import UserPurchaseBox from '../components/UserPurchaseBox';
import AppBar from '../components/AppBar';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <AppBar />
      <UserPurchaseBox />
    </>  
  )
}