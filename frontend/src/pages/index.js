import React from 'react';
import Header from '../components/Header';
import UserPurchaseBox from '../components/UserPurchaseBox';
import Link from 'next/link';


export default function Home() {
  return (
    <>
      <Header />
      <Link href="/company">
        <button>Change to cyompany view</button>
      </Link>

      <UserPurchaseBox />
    </>  
  )
}