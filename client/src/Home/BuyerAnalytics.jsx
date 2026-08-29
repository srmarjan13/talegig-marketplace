// src/components/BuyerAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../Home/ToastContext'; // 🟢 টোস্ট ইমপোর্ট করা হলো

const BuyerAnalytics = () => {
  const navigate = useNavigate();
  const { showToast } = useToast(); // 🟢 টোস্ট হুক ইনিশিয়ালাইজ করা হলো

  const [buyerAnalytics, setBuyerAnalytics] = useState({
    totalSpent: 0,
    last30DaysSpent: 0,
    totalProjectsPosted: 0,
    activeProjectsCount: 0,
    completedProjectsCount: 0,
    totalContestsCount: 0,
    hiredFreelancersCount: 0
  });

  const [transactions, setTransactions] = useState([]);

  // 🟢 লোকালস্টোরেজ বাদ দিয়ে সরাসরি ব্যাকএন্ড ডাটাবেজ থেকে বায়ার অ্যানালিটিক্স ফেচ করার লজিক
  const fetchAnalyticsData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const buyerId = storedUser.id || 1;

      const response = await fetch(`http://localhost:3001/api/buyer/analytics/${buyerId}`);
      if (response.ok) {
        const data = await response.json();

        setBuyerAnalytics({
          totalSpent: data.totalSpent || 0,
          last30DaysSpent: data.last30DaysSpent || 0,
          totalProjectsPosted: data.totalProjectsPosted || 0,
          activeProjectsCount: data.activeProjectsCount || 0,
          completedProjectsCount: data.completedProjectsCount || 0,
          totalContestsCount: data.totalContestsCount || 0,
          hiredFreelancersCount: data.hiredFreelancersCount || 0
        });

        setTransactions(data.transactions || []);
        showToast('Buyer analytics loaded successfully!', 'success'); // 🟢 টোস্ট নোটিফিকেশন
      } else {
        showToast('Failed to fetch analytics from server.', 'error');
      }
    } catch (e) {
      console.error("Buyer analytics fetch error:", e);
      showToast('Server connection error!', 'error');
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  return (
    <div className="w-full bg-white dark:bg-[#0b0f19] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black">Buyer Analytics & Spending</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track your project spending, hired freelancers, and hiring history.</p>
        </div>
        <button 
          onClick={fetchAnalyticsData}
          className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-pink-600 to-rose-700 p-5 rounded-2xl text-white shadow-lg">
          <div className="flex justify-between items-center">
            <p className="text-xs font-extrabold uppercase tracking-wider opacity-85">Total Spending</p>
            <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black mt-2">
            ${buyerAnalytics.totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </h3>
          <p className="text-[11px] opacity-80 mt-1">Total amount spent on projects & gigs</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-5 rounded-2xl text-white shadow-lg">
          <div className="flex justify-between items-center">
            <p className="text-xs font-extrabold uppercase tracking-wider opacity-85">Spent in Past 30 Days</p>
            <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black mt-2">
            ${buyerAnalytics.last30DaysSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </h3>
          <p className="text-[11px] opacity-80 mt-1">Expenses in recent 30 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-[#16171a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div className="flex justify-center mb-2 text-pink-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
          <span className="text-xs font-extrabold text-slate-500 uppercase">Total Posted</span>
          <h4 className="text-2xl font-black text-pink-600">{buyerAnalytics.totalProjectsPosted}</h4>
          <p className="text-[11px] text-slate-500">Projects / Contests</p>
        </div>

        <div className="bg-slate-50 dark:bg-[#16171a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div className="flex justify-center mb-2 text-amber-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-xs font-extrabold text-slate-500 uppercase">Active Projects</span>
          <h4 className="text-2xl font-black text-amber-500">{buyerAnalytics.activeProjectsCount}</h4>
          <p className="text-[11px] text-slate-500">In Progress</p>
        </div>

        <div className="bg-slate-50 dark:bg-[#16171a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div className="flex justify-center mb-2 text-emerald-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="text-xs font-extrabold text-slate-500 uppercase">Completed</span>
          <h4 className="text-2xl font-black text-emerald-500">{buyerAnalytics.completedProjectsCount}</h4>
          <p className="text-[11px] text-slate-500">Successfully finished</p>
        </div>

        <div className="bg-slate-50 dark:bg-[#16171a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <div className="flex justify-center mb-2 text-indigo-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <span className="text-xs font-extrabold text-slate-500 uppercase">Hired Partners</span>
          <h4 className="text-2xl font-black text-indigo-500">{buyerAnalytics.hiredFreelancersCount}</h4>
          <p className="text-[11px] text-slate-500">Unique Freelancers</p>
        </div>
      </div>

      {/* 🟢 বাটন দুটি উপরে শিফট করা হয়েছে */}
      <div className="flex gap-4 pt-2">
        <button 
          onClick={() => navigate('/createproject')}
          className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Post a New Project
        </button>
        <button 
          onClick={() => navigate('/freelancers')}
          className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white py-3 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          Browse Freelancers
        </button>
      </div>

      {/* 🟢 ডাইনামিক ট্রানজ্যাকশন হিস্ট্রি সেকশন (এখন বাটনের নিচে শো করবে) */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">Transaction History</h3>
        
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="bg-slate-50 dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs font-bold">
              No transactions found yet. Add funds or complete projects to see history here!
            </div>
          ) : (
            transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="bg-slate-50 dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm"
              >
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">
                    {tx.type === 'add' ? `Add Via ${tx.method || 'Card'}` : `${tx.method || 'Project Payment'}`}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-black font-mono ${tx.type === 'add' ? 'text-emerald-500' : 'text-pink-600'}`}>
                    {tx.type === 'add' ? `+$${Number(tx.amount).toFixed(2)} USD` : `-$${Number(tx.amount).toFixed(2)} USD`}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{tx.status || 'Successful'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default BuyerAnalytics;