// client/src/pages/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('userRole') || 'seller'; 
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const [walletBalance, setWalletBalance] = useState(() => {
    try {
      const savedWallet = JSON.parse(localStorage.getItem('user_wallet') || '{}');
      if (savedWallet.balance !== undefined && !isNaN(savedWallet.balance)) return Number(savedWallet.balance);
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.balance !== undefined && !isNaN(storedUser.balance)) return Number(storedUser.balance);
      
      const dashBalance = localStorage.getItem('talegig_balance');
      if (dashBalance !== null && !isNaN(dashBalance)) return Number(dashBalance);
    } catch (e) {}
    return 0; // 🟢 হার্ডকোড ৪৫০/৪০০ বাদ দিয়ে এখানেও ০ করে দেওয়া হলো
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return {
          ...parsed,
          role: currentRole,
          email: parsed.email || '', 
          balance: parsed.balance !== undefined ? parsed.balance : walletBalance,
          isLoggedIn: true,
          theme: theme
        };
      }
    } catch (e) {}
    
    return {
      name: '',
      email: '',
      username: '',
      role: currentRole,
      avatar: '',
      balance: walletBalance,
      isLoggedIn: false,
      theme: theme
    };
  });

  // গ্লোবাল থিম রুট লেভেলে হ্যান্ডেল করার ইফেক্ট
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', nextTheme);
      return nextTheme;
    });
  };

  const toggleRole = () => {
    setCurrentRole(prevRole => {
      const newRole = prevRole === 'seller' ? 'buyer' : 'seller';
      localStorage.setItem('userRole', newRole);
      
      try {
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        savedUser.role = newRole;
        localStorage.setItem('user', JSON.stringify(savedUser));
      } catch(e) {}

      return newRole;
    });
  };

  return (
    <AuthContext.Provider value={{ user, toggleRole, toggleTheme, setCurrentRole, theme, walletBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);