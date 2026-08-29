import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../Home/ToastContext';

// 📊 সেলার অ্যাকাউন্ট অ্যানালিটিক্স কম্পোনেন্ট (৫টি সুনির্দিষ্ট ক্যাটাগরি ও ফুল ডাইনামিক সিস্টেম সহ)
const AccountAnalytics = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState({
    totalEarnings: 0,
    last30DaysEarnings: 0,
    availableBalance: 0,
    inProgressBalance: 0,
    inReviewBalance: 0,
    completedOrdersCount: 0,
    activeOrdersCount: 0,
    cancelledOrdersCount: 0,
    totalGigsCount: 0,
    totalGigsViews: 0,
    successRate: 0,
    starRating: 0.0,
    onTimeDeliveryRate: 0,
    repeatClientsCount: 0,
    averageOrderValue: 0,
    responseRate: 0
  });

  const [transactions, setTransactions] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  // 🟢 অ্যাডমিন প্যানেল থেকে ডাইনামিক মিনিমাম উইথড্রল লিমিট স্টেট
  const [minWithdrawalLimit, setMinWithdrawalLimit] = useState(50);
  
  // সেভ করা অ্যাকাউন্টগুলোর লিস্ট ও প্রফেশনাল ড্রপডাউন স্টেট
  const [savedPayoutMethods, setSavedPayoutMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { showToast } = useToast();

  // ক্লিক আউটসাইড ক্লোজ করার জন্য লজিক
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

// 🟢 লোকালস্টোরেজ বাদ দিয়ে সরাসরি ব্যাকএন্ড থেকে অ্যানালিটিক্স ফেচ করার লজিক
  const loadAnalytics = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const sellerId = storedUser.id || 1;

      const response = await fetch(`http://localhost:3001/api/seller/analytics/${sellerId}`);
      if (response.ok) {
        const data = await response.json();
        
        setAnalyticsData({
          totalEarnings: data.totalEarnings || 0,
          last30DaysEarnings: data.last30DaysEarnings || 0,
          availableBalance: data.availableBalance || 0,
          inProgressBalance: data.inProgressBalance || 0,
          inReviewBalance: data.inReviewBalance || 0,
          completedOrdersCount: data.completedOrdersCount || 0,
          activeOrdersCount: data.activeOrdersCount || 0,
          cancelledOrdersCount: data.cancelledOrdersCount || 0,
          totalGigsCount: data.totalGigsCount || 0,
          totalGigsViews: data.totalGigsViews || 0,
          successRate: data.successRate || 0,
          starRating: data.starRating || 0.0,
          onTimeDeliveryRate: data.onTimeDeliveryRate || 0,
          repeatClientsCount: data.repeatClientsCount || 0,
          averageOrderValue: data.averageOrderValue || 0,
          responseRate: data.responseRate || 0
        });

        setTransactions(data.transactions || []);
        setMinWithdrawalLimit(data.minWithdrawalLimit || 50);
        setSavedPayoutMethods(data.payoutMethods || []);
        
        if (data.payoutMethods && data.payoutMethods.length > 0) {
          setSelectedMethod(data.payoutMethods[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load analytics from backend:", e);
    }
  };

  useEffect(() => {
    loadAnalytics();
    window.addEventListener('storage', loadAnalytics);
    return () => window.removeEventListener('storage', loadAnalytics);
  }, []);

  // গ্লোবাল উইথড্র সাবমিট লজিক
  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    
    if (!amt || amt <= 0) {
      showToast('Please enter a valid withdrawal amount.', 'error');
      return;
    }
    // 🟢 অ্যাডমিন প্যানেল থেকে সেট করা ডাইনামিক মিনিমাম লিমিট দিয়ে চেক
    if (amt < minWithdrawalLimit) {
      showToast(`⚠️ Minimum withdrawal limit is $${minWithdrawalLimit} USD`, 'error');
      return;
    }
    if (amt > analyticsData.availableBalance) {
      showToast('Insufficient available balance!' ,'error');
      return;
    }
    if (!selectedMethod) {
      showToast('⚠️ Please select a payout method first.', 'error');
      return;
    }

    try {
      const newTx = {
        id: Date.now(),
        type: 'withdraw',
        amount: amt,
        method: selectedMethod.method,
        details: selectedMethod.accountNumber,
        date: new Date().toLocaleDateString(),
        status: 'Pending Review'
      };

      const existingTx = JSON.parse(localStorage.getItem('talegig_transactions') || '[]');
      const updatedTx = [newTx, ...existingTx];
      localStorage.setItem('talegig_transactions', JSON.stringify(updatedTx));

      showToast(`Successfully requested withdrawal of $${amt} USD via ${selectedMethod.method}! Admin will review your project satisfaction before final approval.`, 'success');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      loadAnalytics(); 
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      showToast('Withdrawal failed. Try again.', 'error');
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0b0f19] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white space-y-6">
      
      {/* পেজ হেডার */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4 flex-wrap gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black">Account Analytics & Finances</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track your earnings, holding balances, and global payouts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowWithdrawModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md flex items-center gap-2"
          >
            <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Withdraw Funds
          </button>
          <button 
            onClick={loadAnalytics}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* 🟢 আপনার সুনির্দিষ্ট ৫টি ক্যাটাগরির ফিন্যান্সিয়াল কার্ডসমূহ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. In Progress Balance */}
        <div className="bg-gradient-to-br from-amber-600 to-orange-700 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-15">
            <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-85">In Progress Balance</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-2">
            ${analyticsData.inProgressBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </h3>
          <p className="text-[11px] opacity-80 mt-1">Active projects & buyer deposits</p>
        </div>

        {/* 2. In Review / Holding */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-700 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-15">
            <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          </div>
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-85">In Review / Holding</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-2">
            ${analyticsData.inReviewBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </h3>
          <p className="text-[11px] opacity-80 mt-1">Dynamic security hold period</p>
        </div>

        {/* 3. Available Balance */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden sm:col-span-2 lg:col-span-1">
          <div className="absolute right-3 top-3 opacity-15">
            <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
          </div>
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-85">Available Balance</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-2">
            ${analyticsData.availableBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </h3>
          <p className="text-[11px] opacity-80 mt-1">Ready for instant withdrawal</p>
        </div>

        {/* 4. Last 30 Days Earnings */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-15">
            <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          </div>
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-85">Last 30 Days Earnings</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-2">
            ${analyticsData.last30DaysEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </h3>
          <p className="text-[11px] opacity-80 mt-1">Revenue in last 30 days</p>
        </div>

        {/* 5. Total Earnings */}
        <div className="bg-gradient-to-br from-pink-600 to-rose-700 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden sm:col-span-2 lg:col-span-2">
          <div className="absolute right-3 top-3 opacity-15">
            <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-85">Lifetime Earnings</p>
          <h3 className="text-2xl sm:text-3xl font-black mt-2">
            ${analyticsData.totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </h3>
          <p className="text-[11px] opacity-80 mt-1">Total revenue generated overall</p>
        </div>

      </div>

      {/* পারফরম্যান্স ও সাকসেস মেট্রিকস */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 dark:bg-[#16171a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase">Success Score</span>
            <span className="text-amber-500 flex items-center font-bold text-xs gap-1">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {analyticsData.starRating}
            </span>
          </div>
          <h4 className="text-xl font-black">{analyticsData.successRate}%</h4>
          <p className="text-xs text-slate-500 mt-1">Based on client feedback</p>
        </div>

        <div className="bg-slate-50 dark:bg-[#16171a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase">On-Time Delivery</span>
            <span className="text-blue-500 flex items-center">
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </span>
          </div>
          <h4 className="text-xl font-black">{analyticsData.onTimeDeliveryRate}%</h4>
          <p className="text-xs text-slate-500 mt-1">Projects completed on time</p>
        </div>

        <div className="bg-slate-50 dark:bg-[#16171a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase">Loyal Clients</span>
            <span className="text-pink-500 flex items-center">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </span>
          </div>
          <h4 className="text-xl font-black">{analyticsData.repeatClientsCount} Clients</h4>
          <p className="text-xs text-slate-500 mt-1">Repeat order clients</p>
        </div>

        <div className="bg-slate-50 dark:bg-[#16171a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase">Avg Order Value</span>
            <span className="text-emerald-500 flex items-center">
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </span>
          </div>
          <h4 className="text-xl font-black">${analyticsData.averageOrderValue.toFixed(2)}</h4>
          <p className="text-xs text-slate-500 mt-1">Average per order</p>
        </div>

      </div>

      {/* গিগ ও অর্ডার স্ট্যাটিস্টিক্স টেবিল / গ্রিড */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        <div className="bg-slate-50 dark:bg-[#16171a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Order Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white dark:bg-[#0b0f19] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Completed Orders</span>
              <span className="font-black text-emerald-500 text-sm">{analyticsData.completedOrdersCount}</span>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-[#0b0f19] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Active / Running Orders</span>
              <span className="font-black text-amber-500 text-sm">{analyticsData.activeOrdersCount}</span>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-[#0b0f19] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Cancelled Orders</span>
              <span className="font-black text-red-500 text-sm">{analyticsData.cancelledOrdersCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#16171a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Gig Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white dark:bg-[#0b0f19] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Active Gigs</span>
              <span className="font-black text-pink-600 text-sm">{analyticsData.totalGigsCount}</span>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-[#0b0f19] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Gig Impressions / Views</span>
              <span className="font-black text-indigo-500 text-sm">{analyticsData.totalGigsViews} Views</span>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-[#0b0f19] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Response Rate</span>
              <span className="font-black text-emerald-500 text-sm">{analyticsData.responseRate}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* 🟢 TRANSACTION HISTORY SECTION */}
      <div className="bg-slate-50 dark:bg-[#16171a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Transaction History</h3>
        {transactions.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No recent transactions found.</p>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto">
            {transactions.map((tx, idx) => (
              <div key={tx.id || idx} className="flex justify-between items-center bg-white dark:bg-[#0b0f19] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white capitalize">{tx.type} via {tx.method}</p>
                  <p className="text-[10px] text-slate-400">{tx.date} {tx.details ? `• Acc: ${tx.details}` : ''}</p>
                </div>
                <div className="text-right">
                  <p className={`font-black ${tx.type === 'add' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.type === 'add' ? '+' : '-'}${tx.amount} USD
                  </p>
                  <span className="text-[10px] font-bold text-emerald-600">{tx.status || 'Successful'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🟢 GLOBAL WITHDRAW FUNDS MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl text-black dark:text-white space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black">Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">✕</button>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Available: <strong className="text-emerald-500">${analyticsData.availableBalance.toFixed(2)} USD</strong></span>
              <span className="text-amber-500 font-bold">Min Limit: ${minWithdrawalLimit} USD</span>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              
              <div className="relative" ref={dropdownRef}>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Select Saved Payout Account</label>
                
                {savedPayoutMethods.length === 0 ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-500 flex justify-between items-center">
                    <span>No payout method added yet!</span>
                    <button 
                      type="button"
                      onClick={() => {
                        setShowWithdrawModal(false);
                        navigate('/seller-dashboard?tab=Settings&sub=Withdrawals');
                      }}
                      className="underline font-extrabold cursor-pointer"
                    >
                      Add in Settings
                    </button>
                  </div>
                ) : (
                  <>
                    <div 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold flex justify-between items-center cursor-pointer hover:border-slate-400 transition select-none"
                    >
                      <span className="text-slate-900 dark:text-white truncate">
                        {selectedMethod ? `${selectedMethod.method} — ${selectedMethod.accountNumber} (${selectedMethod.accountName})` : 'Select account'}
                      </span>
                      <svg className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-full bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 py-2 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                        {savedPayoutMethods.map((m) => (
                          <div 
                            key={m.id}
                            onClick={() => {
                              setSelectedMethod(m);
                              setIsDropdownOpen(false);
                            }}
                            className="px-4 py-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition flex flex-col gap-0.5"
                          >
                            <span className="font-extrabold text-slate-900 dark:text-white">{m.method} — <span className="font-mono text-emerald-500">{m.accountNumber}</span></span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Holder: {m.accountName} {m.bankName ? `• Bank: ${m.bankName}` : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Withdrawal Amount (USD) *</label>
                <input 
                  type="number"
                  required
                  min={minWithdrawalLimit}
                  max={analyticsData.availableBalance}
                  placeholder={`Minimum $${minWithdrawalLimit} USD`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-bold focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={savedPayoutMethods.length === 0}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-extrabold text-xs cursor-pointer shadow-md"
                >
                  Confirm Withdrawal
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AccountAnalytics;