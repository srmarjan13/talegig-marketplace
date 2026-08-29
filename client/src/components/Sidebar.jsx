// client/src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiSettings, FiMessageSquare, FiTrendingUp, FiLock, FiMoreHorizontal } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center py-3 px-4 rounded-xl transition-all duration-300 font-medium text-xs sm:text-sm ${
      isActive 
        ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30' 
        : 'hover:bg-gray-200/50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
    }`;

  return (
    <>
      {/* 🟢 ১. বড় স্ক্রিনের জন্য লেফট সাইডবার (Desktop Sidebar) */}
      <div className="hidden md:flex w-64 h-screen bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-r border-gray-200 dark:border-white/10 p-5 flex-col justify-between transition-colors duration-300 shrink-0 sticky top-0">
        <div>
          <h1 className="text-2xl font-bold mb-10 px-4 text-gray-900 dark:text-white">TaleGig Admin</h1>
          <nav className="space-y-2">
            <NavLink to="/superadmin" end className={navLinkClass}>Dashboard</NavLink> 
            <NavLink to="/superadmin/users" className={navLinkClass}>User Management</NavLink>
            <NavLink to="/superadmin/settings" className={navLinkClass}>Marketplace Settings</NavLink>
            
            <NavLink to="/superadmin/inbox" className={navLinkClass}>
              <div className="flex items-center"><FiMessageSquare className="mr-3" /> Inbox & Live Chat</div>
            </NavLink>
            
            <div className="pt-6 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
              Finance Management
            </div>
            
            <NavLink to="/superadmin/finance" className={({isActive}) => navLinkClass({isActive: window.location.pathname === '/superadmin/finance'})}>
               <div className="flex items-center"><FiTrendingUp className="mr-3" /> Finance Overview</div>
            </NavLink>
            <NavLink to="/superadmin/finance/control" className={({isActive}) => navLinkClass({isActive: window.location.pathname === '/superadmin/finance/control'})}>
               <div className="flex items-center"><FiLock className="mr-3" /> Control Center</div>
            </NavLink>
          </nav>
        </div>
        <ThemeToggle />
      </div>

      {/* 🟢 ২. ছোট স্ক্রিনের জন্য প্রফেশনাল মোবাইল বটম নেভবার (Dashboard, Users, Inbox, Finance, More) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-gray-800 px-2 py-2 flex items-center justify-around z-50 shadow-2xl">
        
        {/* Dashboard */}
        <NavLink 
          to="/superadmin" 
          end 
          className={({isActive}) => `flex flex-col items-center py-1 px-3 rounded-xl transition ${isActive ? 'text-pink-600 dark:text-pink-500 font-bold' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
        >
          <FiHome className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Dashboard</span>
        </NavLink>

        {/* User Management */}
        <NavLink 
          to="/superadmin/users" 
          className={({isActive}) => `flex flex-col items-center py-1 px-3 rounded-xl transition ${isActive ? 'text-pink-600 dark:text-pink-500 font-bold' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
        >
          <FiUsers className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Users</span>
        </NavLink>

        {/* Inbox & Live Chat */}
        <NavLink 
          to="/superadmin/inbox" 
          className={({isActive}) => `flex flex-col items-center py-1 px-3 rounded-xl transition ${isActive ? 'text-pink-600 dark:text-pink-500 font-bold' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
        >
          <FiMessageSquare className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Inbox</span>
        </NavLink>

        {/* Finance Overview */}
        <NavLink 
          to="/superadmin/finance" 
          className={({isActive}) => `flex flex-col items-center py-1 px-3 rounded-xl transition ${isActive ? 'text-pink-600 dark:text-pink-500 font-bold' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
        >
          <FiTrendingUp className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Finance</span>
        </NavLink>

        {/* More (থ্রি-ডট বাটন - বাকি অপশনগুলোর পপআপ মেনু) */}
        <div className="relative">
          <button 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition cursor-pointer ${showMoreMenu ? 'text-pink-600 dark:text-pink-500 font-bold' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
          >
            <FiMoreHorizontal className="w-5 h-5 mb-1" />
            <span className="text-[10px]">More</span>
          </button>

          {/* মোর আইকনে ক্লিক করলে ওপরের দিকে প্রিমিয়াম পপআপ মেনু শো করবে */}
          {showMoreMenu && (
            <div className="absolute bottom-14 right-0 w-52 bg-white dark:bg-[#16171a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2 space-y-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">Admin Options</div>
              
              <NavLink 
                to="/superadmin/settings" 
                onClick={() => setShowMoreMenu(false)}
                className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition font-medium text-gray-700 dark:text-gray-200"
              >
                Marketplace Settings
              </NavLink>

              <NavLink 
                to="/superadmin/finance/control" 
                onClick={() => setShowMoreMenu(false)}
                className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition font-medium text-gray-700 dark:text-gray-200"
              >
                Control Center
              </NavLink>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center px-3 py-1">
                <span className="text-gray-500 font-medium">Theme Mode</span>
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}