import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import TransactionTable from '../components/TransactionTable';

export default function FinanceDashboard() {
  const [financeData, setFinanceData] = useState({
    grossRevenue: 0,
    netProfit: 0,
    escrowBalance: 0,
    pendingPayouts: 0,
    transactions: []
  });

  const loadFinanceOverview = () => {
    try {
      const savedTransactions = JSON.parse(localStorage.getItem('talegig_transactions') || '[]');

      let totalGrossRevenue = 0;
      let totalNetProfit = 0;
      let escrow = 0;
      let pending = 0;

      if (Array.isArray(savedTransactions) && savedTransactions.length > 0) {
        savedTransactions.forEach(tx => {
          const amt = Number(tx.amount) || 0;
          const buyerPaid = Number(tx.buyerPaidTotal) || amt;
          const adminProfit = Number(tx.adminProfit) || (amt * 0.1); // ফলব্যাক হিসেবে ১০% কমিশন
          const status = (tx.status || '').toLowerCase();
          const type = (tx.type || '').toLowerCase();

          // 🟢 উইথড্র বা পেআউট ট্রানজ্যাকশনগুলো গ্রস রেভিনিউ বা নেট প্রফিটে যোগ হবে না
          if (type === 'withdraw' || type === 'withdrawal' || type === 'payout') {
            if (status === 'pending review' || status === 'pending') {
              pending += Math.abs(amt);
            }
            return; 
          }

          // সফল ট্রানজ্যাকশন বা অর্ডার
          if (amt > 0 && (status === 'completed' || status === 'success' || status === 'approved' || status === 'successful')) {
            totalGrossRevenue += buyerPaid; 
            totalNetProfit += adminProfit; 
          } 
          // পেন্ডিং বা রিভিউ অর্ডার
          else if (status === 'pending review' || status === 'pending') {
            pending += Math.abs(amt);
          } 
          // এসক্রো হোল্ডিং ফান্ড
          else if (status === 'escrow' || status === 'holding' || status === 'on_hold') {
            escrow += Math.abs(amt);
          }
        });
      }

      setFinanceData({
        grossRevenue: totalGrossRevenue,
        netProfit: totalNetProfit,
        escrowBalance: escrow,
        pendingPayouts: pending,
        transactions: savedTransactions
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFinanceOverview();
    window.addEventListener('storage', loadFinanceOverview);
    return () => window.removeEventListener('storage', loadFinanceOverview);
  }, []);

  return (
    <PageLayout title="Finance Overview">
      {/* 🟢 প্রফেশনাল ফিন্যান্সিয়াল ওভারভিউ কার্ড */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Gross Revenue */}
        <div className="bg-white dark:bg-white/5 shadow-md dark:shadow-none border border-gray-200 dark:border-white/10 p-6 rounded-2xl transition-all duration-300">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Gross Revenue</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ${financeData.grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs mt-2 text-green-600 dark:text-green-400">Total Marketplace Turnover</p>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-white/5 shadow-md dark:shadow-none border border-gray-200 dark:border-white/10 p-6 rounded-2xl transition-all duration-300">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Net Profit (Admin Earn)</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ${financeData.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs mt-2 text-green-600 dark:text-green-400">Commission & Service Fees</p>
        </div>

        {/* Escrow Balance */}
        <div className="bg-white dark:bg-white/5 shadow-md dark:shadow-none border border-gray-200 dark:border-white/10 p-6 rounded-2xl transition-all duration-300">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Escrow Balance</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ${financeData.escrowBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">Funds in secure holding</p>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white dark:bg-white/5 shadow-md dark:shadow-none border border-gray-200 dark:border-white/10 p-6 rounded-2xl transition-all duration-300">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending Payouts</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ${financeData.pendingPayouts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">Withdrawals under review</p>
        </div>

      </div>

      {/* ট্রানজ্যাকশন টেবিল */}
      <div className="bg-white dark:bg-white/5 shadow-lg dark:shadow-none border border-gray-200 dark:border-white/10 p-6 rounded-2xl w-full"> 
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white px-2">Recent Transactions</h3>
        <TransactionTable transactions={financeData.transactions} /> 
      </div>
    </PageLayout>
  );
}