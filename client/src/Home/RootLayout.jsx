import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PrivateNavbar from './PrivateNavbar'; 

const RootLayout = () => {
  const isAuthenticated = localStorage.getItem('user') || localStorage.getItem('token');

  return (
    // 🟢 এখানে ব্যাকগ্রাউন্ড ও টেক্সট কালার ডাইনামিক করা হলো
    <div className="w-full min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}
      <Outlet />
    </div>
  );
};

export default RootLayout;