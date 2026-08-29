// client/src/pages/SuperAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import RevenueChart from '../components/RevenueChart';
import RecentActivities from '../components/RecentActivities';
import ProjectList from '../components/ProjectList';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalUsers: 0,
    activeOrders: 0,
    pendingSupport: 0
  });

  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // লোকালস্টোরেজ থেকে সব সোর্সের ডাটা একত্রিত ও ডাইনামিক করার লজিক
  useEffect(() => {
    try {
      let earnings = 0;
      let activeCount = 0;
      let allActivities = [];
      let allCombinedProjects = [];

      // ১. গিগ অর্ডার ও প্রজেক্ট ট্র্যাকিং
      const savedOrders = localStorage.getItem('talegig_orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        orders.forEach(ord => {
          const price = Number(ord.price || ord.budget || 0);
          const st = (ord.status || 'Active').toLowerCase();
          
          if (st === 'complete' || st === 'completed') {
            earnings += price;
          } else if (st === 'pending' || st === 'active' || st === 'running' || st === 'delivered') {
            activeCount++;
          }

          allActivities.push({
            id: ord.id || Date.now() + Math.random(),
            title: `Gig Order: ${ord.title || 'Professional Service'}`,
            amount: `$${price} USD`,
            status: ord.status || 'Active',
            date: ord.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            type: 'Gig'
          });

          allCombinedProjects.push({
            id: ord.id,
            name: ord.title || 'Gig Order',
            title: ord.title || 'Gig Order',
            budget: `$${price} USD`,
            status: ord.status === 'complete' ? 'Completed' : 'Active',
            source: 'Gig'
          });
        });
      }

      // ২. ফিন্যান্সিয়াল ট্রানজ্যাকশন (Deposit & Withdraw) ট্র্যাকিং লজিক
      const savedTransactions = localStorage.getItem('talegig_transactions');
      if (savedTransactions) {
        const txs = JSON.parse(savedTransactions);
        txs.forEach(tx => {
          const amt = Number(tx.amount || 0);
          const txType = (tx.type || tx.action || '').toLowerCase();
          const method = tx.method || tx.gateway || 'CARD';
          
          let titleText = 'Transaction';
          let normalizedType = 'transaction';

          if (txType.includes('deposit') || txType === 'add' || tx.isDeposit) {
            titleText = `Deposit via ${method}`;
            normalizedType = 'deposit';
            earnings += amt;
          } else if (txType.includes('withdraw') || txType.includes('payout') || tx.isWithdraw) {
            titleText = `Withdrawal via ${method}`;
            normalizedType = 'withdraw';
          } else {
            titleText = `Deposit via ${method}`;
            normalizedType = 'deposit';
            earnings += amt;
          }

          allActivities.push({
            id: tx.id || Date.now() + Math.random(),
            title: titleText,
            amount: `$${amt} USD`,
            status: tx.status || 'Successful',
            date: tx.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            type: normalizedType
          });
        });
      }

      // ৩. সাধারণ প্রজেক্ট বা কাস্টম অফার ট্র্যাকিং লজিক
      const savedProjects = localStorage.getItem('talegig_projects');
      if (savedProjects) {
        const projectsParsed = JSON.parse(savedProjects);
        if (Array.isArray(projectsParsed)) {
          projectsParsed.forEach(proj => {
            const priceStr = proj.budget || proj.price || proj.myproposal || '$0 USD';
            const projStatus = proj.status || proj.paymentStatus || 'In Progress';
            const workCategory = proj.workType || proj.type || 'Project';

            allActivities.push({
              id: proj.id || Date.now() + Math.random(),
              title: `${workCategory}: ${proj.title || proj.name || 'Custom Offer'}`,
              amount: priceStr,
              status: projStatus,
              date: proj.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              type: workCategory
            });

            const exists = allCombinedProjects.some(cp => String(cp.id) === String(proj.id));
            if (!exists) {
              allCombinedProjects.push({
                id: proj.id,
                name: proj.title || proj.name || 'Project',
                title: proj.title || proj.name || 'Project',
                budget: priceStr,
                status: projStatus,
                source: workCategory
              });
            }
          });
        }
      }

      // ৪. শুধুমাত্র স্ট্যান্ডার্ড 'user' কি থেকে ডাইনামিক মোট ইউজার কাউন্ট বের করা
      let calculatedUsers = 0;
      const uData = localStorage.getItem('user');
      if (uData) {
        try {
          const parsed = JSON.parse(uData);
          if (Array.isArray(parsed)) {
            calculatedUsers = parsed.length;
          } else if (parsed && typeof parsed === 'object' && parsed.name) {
            calculatedUsers = 1; 
          }
        } catch(err) {}
      }

      // ৫. পেন্ডিং সাপোর্ট বা টিকেট ডাইনামিক কাউন্ট করা
      let calculatedPendingSupport = 0;
      const supportData = localStorage.getItem('talegig_support_tickets') || localStorage.getItem('support_tickets');
      if (supportData) {
        try {
          const tickets = JSON.parse(supportData);
          if (Array.isArray(tickets)) {
            calculatedPendingSupport = tickets.filter(t => (t.status || '').toLowerCase() === 'pending').length;
          }
        } catch(err) {}
      }

      setProjects(allCombinedProjects);

      setStats({
        totalEarnings: earnings,
        totalUsers: calculatedUsers > 0 ? calculatedUsers : 1, 
        activeOrders: activeCount,
        pendingSupport: calculatedPendingSupport
      });

      setActivities(allActivities);

    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <PageLayout title="Admin Overview">
      
      {/* রেসপন্সিভ হেডার সেকশন ও ৩-ডট মেনু */}
      <div className="flex justify-between items-center mb-6 relative">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white sm:text-2xl">Dashboard Statistics</h2>
        
        <div className="relative sm:hidden">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-700 dark:text-white hover:bg-gray-200 transition cursor-pointer"
            title="More Options"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#16171a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-xs">
              <button onClick={() => { alert('Export Report'); setShowDropdown(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition cursor-pointer">Export Data</button>
              <button onClick={() => { window.location.reload(); }} className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition cursor-pointer">Refresh Stats</button>
            </div>
          )}
        </div>
      </div>

      {/* স্ট্যাট কার্ডস (ইনলাইন রেন্ডারিং, আলাদা ফাইলের প্রয়োজন নেই) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        
        <div className="bg-white dark:bg-white/5 shadow-md dark:shadow-none border border-gray-200 dark:border-white/10 p-6 rounded-2xl transition-all duration-300">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Earnings</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ${stats.totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </p>
          <p className="text-xs mt-2 text-green-600 dark:text-green-400">Live data</p>
        </div>

        <div className="bg-white dark:bg-white/5 shadow-md dark:shadow-none border border-gray-200 dark:border-white/10 p-6 rounded-2xl transition-all duration-300">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {stats.totalUsers.toLocaleString()}
          </p>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">Registered users</p>
        </div>

        <div className="bg-white dark:bg-white/5 shadow-md dark:shadow-none border border-gray-200 dark:border-white/10 p-6 rounded-2xl transition-all duration-300">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Orders</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {stats.activeOrders.toString()}
          </p>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">In progress</p>
        </div>

        <div className="bg-white dark:bg-white/5 shadow-md dark:shadow-none border border-gray-200 dark:border-white/10 p-6 rounded-2xl transition-all duration-300">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending Support</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {stats.pendingSupport.toString()}
          </p>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">Requires attention</p>
        </div>

      </div>

      {/* রিভিনিউ চার্ট এবং অ্যাক্টিভিটি লগ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 sm:p-6 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Revenue Overview</h3>
          <RevenueChart />
        </div>

        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Recent Activities</h3>
          <RecentActivities activities={activities} />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <ProjectList projects={projects} />
      </div>
    </PageLayout>
  );
}