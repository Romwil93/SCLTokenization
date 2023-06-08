import React from 'react';
import Company from '../components/Company';
import AppBar from '../components/AppBar';
import Unauthorized from '@/components/Unauthorized';
import StatusBar from '../components/StatusBar';
import useWeb3 from '../hooks/useWeb3';
import Link from 'next/link';

export default function CompanyView() {
  const { web3, account, contract } = useWeb3();
  if (account == "0x5a88f1E531916b681b399C33F519b7E2E54b5213") {
    return (
      <>
        <AppBar />
        <Unauthorized />
      </>  
    )
  } else {
      return (
        <>
          <AppBar />
          <Company />
          <StatusBar />
        </>  
      )
    }
}