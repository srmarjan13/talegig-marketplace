import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';

export default function FinanceControl() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // 🟢 বায়ার ও সেলারের আলাদা কমিশন স্টেট
  const [sellerCommissionRate, setSellerCommissionRate] = useState(10);
  const [buyerFeeRate, setBuyerFeeRate] = useState(5);

  const [settings, setSettings] = useState({
    taxRate: '5%',
    currency: 'USD ($)',
    serviceFee: '2.5%'
  });
  
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showChatReviewModal, setShowChatReviewModal] = useState(false);
  const [selectedPayoutForReview, setSelectedPayoutForReview] = useState(null);

  // প্রজেক্ট ইন্সপেক্টর ও চ্যাট স্টেট
  const [selectedProjectInspect, setSelectedProjectInspect] = useState(null);
  const [showProjectInspectorModal, setShowProjectInspectorModal] = useState(false);
  const [projectChatLogs, setProjectChatLogs] = useState([]);
  
  const [payouts, setPayouts] = useState([]);

  // 🟢 ১০০% ডাইনামিক ডাটা ফেচিং (লোকালস্টোরেজ থেকে বায়ার ও সেলার কমিশন সহ)
  const loadFinanceOperations = () => {
    try {
      const savedSettings = JSON.parse(localStorage.getItem('talegig_finance_settings') || '{}');
      if (savedSettings.taxRate) setSettings(savedSettings);
      
      const savedSellerComm = localStorage.getItem('talegig_seller_commission_rate');
      if (savedSellerComm) setSellerCommissionRate(Number(savedSellerComm));

      const savedBuyerFee = localStorage.getItem('talegig_buyer_fee_rate');
      if (savedBuyerFee) setBuyerFeeRate(Number(savedBuyerFee));

      const savedMaint = localStorage.getItem('talegig_finance_maintenance');
      if (savedMaint) setMaintenanceMode(JSON.parse(savedMaint));

      // শুধুমাত্র লোকালস্টোরেজের রিয়েল ট্রানজ্যাকশন থেকে উইথড্রল রিকোয়েস্ট ফেচ করা
      const savedTransactions = JSON.parse(localStorage.getItem('talegig_transactions') || '[]');
      const withdrawalRequests = savedTransactions
        .filter(tx => tx.type === 'withdraw')
        .map((tx, index) => ({
          id: tx.id || index,
          user: tx.details ? `${tx.method} (${tx.details})` : (tx.method || 'Bank Transfer'),
          amount: tx.amount,
          status: tx.status || 'Pending Review',
          date: tx.date,
          sellerName: tx.sellerName || 'Freelance Seller',
          ordersBreakdown: tx.ordersBreakdown || []
        }));

      setPayouts(withdrawalRequests);
    } catch (e) {
      setPayouts([]);
    }
  };

  useEffect(() => {
    loadFinanceOperations();
    window.addEventListener('storage', loadFinanceOperations);
    return () => window.removeEventListener('storage', loadFinanceOperations);
  }, []);

  // 🟢 নির্দিষ্ট প্রজেক্টের রিয়েল চ্যাট ও অর্ডার ডিটেইলস ফেচ করা
  const handleInspectProject = (ord, sellerName) => {
    setSelectedProjectInspect({ ...ord, sellerName });
    
    try {
      const allMessages = JSON.parse(localStorage.getItem('talegig_messages') || localStorage.getItem('talegig_chat_logs') || '[]');
      const filteredChats = allMessages.filter(msg => 
        String(msg.projectId) === String(ord.id) || 
        String(msg.orderId) === String(ord.id) ||
        (msg.sender === ord.buyer || msg.receiver === ord.buyer)
      );

      setProjectChatLogs(filteredChats);
    } catch (e) {
      setProjectChatLogs([]);
    }

    setShowProjectInspectorModal(true);
  };

  const handleSettingsSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('talegig_finance_settings', JSON.stringify(settings));
      alert('Global financial settings updated successfully!');
    } catch (e) {}
  };

  const toggleMaintenance = () => {
    const nextState = !maintenanceMode;
    setMaintenanceMode(nextState);
    try {
      localStorage.setItem('talegig_finance_maintenance', JSON.stringify(nextState));
    } catch (e) {}
    alert(`Financial Maintenance Mode is now ${nextState ? 'ENABLED' : 'DISABLED'}.`);
  };

  const handlePayoutAction = (id, action) => {
    const updated = payouts.map(p => p.id === id ? { ...p, status: action } : p);
    setPayouts(updated);

    try {
      const savedTransactions = JSON.parse(localStorage.getItem('talegig_transactions') || '[]');
      const updatedTx = savedTransactions.map(tx => {
        if (tx.id === id || (tx.type === 'withdraw' && tx.amount === updated.find(item => item.id === id)?.amount)) {
          return { ...tx, status: action === 'Approved' ? 'Successful' : 'Rejected' };
        }
        return tx;
      });
      localStorage.setItem('talegig_transactions', JSON.stringify(updatedTx));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    alert(`Payout request has been marked as ${action}.`);
  };

  return (
    <PageLayout title="Finance Operations">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* সিস্টেম অ্যাকশন প্যানেল */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-2xl shadow-sm dark:shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">System Actions</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${maintenanceMode ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              {maintenanceMode ? 'Maintenance: ON' : 'System: Active'}
            </span>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => setShowPayoutModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition shadow-lg shadow-blue-600/20 cursor-pointer flex justify-between px-6 items-center"
            >
              <span>Approve/Reject Payouts</span>
              <span className="bg-blue-800 px-2.5 py-0.5 rounded-full text-xs">
                {payouts.filter(p => p.status === 'Pending Review' || p.status === 'Pending').length} Pending
              </span>
            </button>

            {/* 🟢 ম্যানেজ কমিশন বাটন (বায়ার ও সেলার আলাদা ফি দেখাবে) */}
            <button 
              onClick={() => setShowCommissionModal(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition shadow-lg shadow-indigo-600/20 cursor-pointer flex justify-between px-6 items-center"
            >
              <span>Manage Marketplace Fees</span>
              <span className="bg-indigo-800 px-2.5 py-0.5 rounded-full text-xs">Seller: {sellerCommissionRate}% | Buyer: {buyerFeeRate}%</span>
            </button>

            <button 
              onClick={toggleMaintenance}
              className={`w-full py-4 rounded-xl font-bold transition shadow-lg cursor-pointer text-white ${maintenanceMode ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'}`}
            >
              {maintenanceMode ? 'Disable Maintenance Mode' : 'Toggle Maintenance Mode'}
            </button>
          </div>
        </div>

        {/* গ্লোবাল সেটিংস প্যানেল */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-2xl shadow-sm dark:shadow-2xl backdrop-blur-md">
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Global Settings</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Update Tax rates, Currencies, and Service fees.</p>
          
          <form onSubmit={handleSettingsSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Tax Rate (%)</label>
              <input 
                type="text" 
                value={settings.taxRate} 
                onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                className="w-full p-3 bg-white/5 border border-gray-700 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Default Currency</label>
              <input 
                type="text" 
                value={settings.currency} 
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full p-3 bg-white/5 border border-gray-700 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Platform Service Fee</label>
              <input 
                type="text" 
                value={settings.serviceFee} 
                onChange={(e) => setSettings({ ...settings, serviceFee: e.target.value })}
                className="w-full p-3 bg-white/5 border border-gray-700 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500" 
              />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs transition shadow-lg cursor-pointer mt-2">
              Save Global Settings
            </button>
          </form>
        </div>
      </div>

      {/* পেআউট রিকোয়েস্ট লিস্ট মডাল */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#16171a] border border-gray-800 p-6 rounded-3xl max-w-xl w-full text-white space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div>
                <h3 className="font-bold text-base">Pending Withdrawal Requests</h3>
                <p className="text-[11px] text-gray-400">Review associated projects and buyer satisfaction before approving.</p>
              </div>
              <button onClick={() => setShowPayoutModal(false)} className="text-gray-400 hover:text-red-500 font-bold cursor-pointer">✕</button>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {payouts.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-6">Not Found: No pending withdrawal requests found in localStorage.</p>
              ) : (
                payouts.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3.5 bg-white/5 rounded-2xl border border-gray-800 gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-white">{p.sellerName} — <span className="text-emerald-400 font-mono">${p.amount} USD</span></h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Method: {p.user}</p>
                      <p className={`text-[10px] font-bold mt-1 ${p.status === 'Approved' ? 'text-emerald-400' : p.status === 'Rejected' ? 'text-red-400' : 'text-amber-400'}`}>
                        Status: {p.status}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => {
                          setSelectedPayoutForReview(p);
                          setShowChatReviewModal(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-[11px] font-extrabold rounded-xl cursor-pointer transition flex items-center gap-1.5"
                      >
                        <span>🔍 Review All Projects ({p.ordersBreakdown?.length || 0})</span>
                      </button>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handlePayoutAction(p.id, 'Approved')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition">Approve</button>
                        <button onClick={() => handlePayoutAction(p.id, 'Rejected')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer transition">Reject</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* প্রজেক্ট ব্রেকডাউন মডাল */}
      {showChatReviewModal && selectedPayoutForReview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#16171a] border border-gray-800 p-6 rounded-3xl max-w-xl w-full text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-indigo-400">Withdrawal Breakdown & Project Inspection</h3>
                <p className="text-[11px] text-gray-400">Seller: <strong className="text-white">{selectedPayoutForReview.sellerName}</strong> | Total: <strong className="text-emerald-400">${selectedPayoutForReview.amount} USD</strong></p>
              </div>
              <button onClick={() => setShowChatReviewModal(false)} className="text-gray-400 hover:text-red-500 font-bold cursor-pointer">✕</button>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Associated Orders / Projects:</p>
              
              {(!selectedPayoutForReview.ordersBreakdown || selectedPayoutForReview.ordersBreakdown.length === 0) ? (
                <p className="text-xs text-gray-400 italic text-center py-4">Not Found: No specific order breakdown attached to this transaction.</p>
              ) : (
                selectedPayoutForReview.ordersBreakdown.map((ord, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleInspectProject(ord, selectedPayoutForReview.sellerName)}
                    className="bg-white/5 hover:bg-indigo-600/10 p-4 rounded-2xl border border-gray-800 hover:border-indigo-500/50 space-y-2 text-xs cursor-pointer transition group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-indigo-300 font-bold group-hover:underline">{ord.id}</span>
                      <span className="font-black text-emerald-400">+${ord.amount} USD</span>
                    </div>
                    <div>
                      <p className="font-extrabold text-white group-hover:text-indigo-200">{ord.title}</p>
                      <p className="text-[11px] text-gray-400">Buyer / Client: <span className="text-gray-200">{ord.buyer}</span></p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-800/60 text-[11px]">
                      <span className="text-emerald-400 font-bold">✅ Status: {ord.status || 'Completed'}</span>
                      <span className="text-indigo-400 font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        View Project & Chat Logs →
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => {
                  handlePayoutAction(selectedPayoutForReview.id, 'Approved');
                  setShowChatReviewModal(false);
                }} 
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer transition shadow-lg"
              >
                Approve Total Payout (${selectedPayoutForReview.amount})
              </button>
              <button 
                onClick={() => {
                  handlePayoutAction(selectedPayoutForReview.id, 'Rejected');
                  setShowChatReviewModal(false);
                }} 
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer transition shadow-lg"
              >
                Reject Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* প্রজেক্ট ও রিয়েল চ্যাট ইন্সপেক্টর মডাল */}
      {showProjectInspectorModal && selectedProjectInspect && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-[#121316] border border-indigo-500/30 p-6 rounded-3xl max-w-2xl w-full text-white space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-md text-[10px] font-extrabold uppercase">Project Inspector</span>
                <h3 className="font-black text-base mt-1">{selectedProjectInspect.title}</h3>
              </div>
              <button 
                onClick={() => setShowProjectInspectorModal(false)} 
                className="text-gray-400 hover:text-red-500 font-bold text-base cursor-pointer bg-white/5 p-2 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white/5 p-4 rounded-2xl border border-gray-800">
              <div>
                <p className="text-gray-400 text-[10px] uppercase">Project ID</p>
                <p className="font-mono font-bold text-indigo-300 mt-0.5">{selectedProjectInspect.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase">Buyer / Client</p>
                <p className="font-bold text-white mt-0.5">{selectedProjectInspect.buyer}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase">Assigned Seller</p>
                <p className="font-bold text-white mt-0.5">{selectedProjectInspect.sellerName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase">Project Value</p>
                <p className="font-black text-emerald-400 mt-0.5">${selectedProjectInspect.amount} USD</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>💬 Buyer & Seller Conversation History</span>
                <span className="text-[10px] text-emerald-400 font-normal">Real-time LocalStorage Log</span>
              </h4>

              <div className="bg-[#0b0f19] border border-gray-800 rounded-2xl p-4 space-y-3 max-h-64 overflow-y-auto">
                {projectChatLogs.length === 0 ? (
                  <p className="text-xs text-gray-500 italic text-center py-6">Not Found: No chat logs found in localStorage for this project.</p>
                ) : (
                  projectChatLogs.map((chat, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${chat.sender === selectedProjectInspect.sellerName ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold text-gray-400">{chat.sender || 'User'}</span>
                        <span className="text-[9px] text-gray-600">{chat.time || ''}</span>
                      </div>
                      <div className={`p-3 rounded-2xl text-xs max-w-[80%] ${
                        chat.sender === selectedProjectInspect.sellerName 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white/10 text-gray-200 rounded-bl-none'
                      }`}>
                        {chat.text || chat.message || 'File delivered'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button 
              onClick={() => setShowProjectInspectorModal(false)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-xs cursor-pointer transition"
            >
              Back to Withdrawal Breakdown
            </button>
          </div>
        </div>
      )}

      {/* 🟢 ডাইনামিক বায়ার ও সেলার কমিশন ম্যানেজমেন্ট মডাল */}
      {showCommissionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#16171a] border border-gray-800 p-6 rounded-3xl max-w-sm w-full text-white space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="font-bold text-base">Marketplace Fees Control</h3>
              <button onClick={() => setShowCommissionModal(false)} className="text-gray-400 hover:text-red-500 font-bold cursor-pointer">✕</button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">Seller Commission (%)</label>
                <input 
                  type="number" 
                  value={sellerCommissionRate} 
                  onChange={(e) => setSellerCommissionRate(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-gray-700 rounded-xl text-xs font-bold text-white outline-none focus:border-indigo-500 font-mono" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">Buyer Service Fee (%)</label>
                <input 
                  type="number" 
                  value={buyerFeeRate} 
                  onChange={(e) => setBuyerFeeRate(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-gray-700 rounded-xl text-xs font-bold text-white outline-none focus:border-indigo-500 font-mono" 
                />
              </div>
            </div>

            <button 
              onClick={() => {
                localStorage.setItem('talegig_seller_commission_rate', sellerCommissionRate);
                localStorage.setItem('talegig_buyer_fee_rate', buyerFeeRate);
                setShowCommissionModal(false);
                alert(`Fees updated successfully!\nSeller Commission: ${sellerCommissionRate}%\nBuyer Service Fee: ${buyerFeeRate}%`);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-xs cursor-pointer shadow-lg mt-2"
            >
              Update Marketplace Fees
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}