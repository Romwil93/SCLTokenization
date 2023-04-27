import React from 'react';
import Header from '../components/Header';
import Company from '../components/Company';
import Link from 'next/link';

export default function CompanyView() {
  return (
    <>
      <Header />
      <Link href="/">
        <button>Change to user view</button>
      </Link>
      <Company />
    </>  
  )
}