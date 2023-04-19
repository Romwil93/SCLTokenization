import React from 'react';
import Header from '../components/Header';
import CompanyBox from '../components/CompanyBox';
import Link from 'next/link';

export default function Company() {
  return (
    <>
      <Header />
      <Link href="/">
        <button>Change to user view</button>
      </Link>
      <CompanyBox />
    </>  
  )
}