import React from 'react';
import Header from '../components/Header';
import Company from '../components/Company';
import AppBar from '../components/AppBar';
import Link from 'next/link';

export default function CompanyView() {
  return (
    <>
      <AppBar />
      <Company />
    </>  
  )
}