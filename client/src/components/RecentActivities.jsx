// client/src/components/RecentActivities.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecentActivities({ activities = [] }) {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleActivityClick = (act) => {
    let userInfo = {
      tgId: 'TG-' + Math.floor(10000 + Math.random() * 90000),
      name: 'User',
      username: 'user',
      email: 'user@talegig.com'
    };

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key);
        if (val && val.startsWith('{') && val.includes('username')) {
          const parsed = JSON.parse(val);
          if (parsed.name && parsed.username) {
            userInfo.name = parsed.name;
            userInfo.username = parsed.username.replace('@', '');
            userInfo.email = parsed.email || userInfo.email;
            userInfo.tgId = parsed.tgId || parsed.id || userInfo.tgId;
            break;
          }
        }
      }
    } catch (e) {}

    setSelectedActivity({ 
      ...act, 
      ...userInfo,
      title: act.title || act.text || 'Platform Activity',
      amount: act.amount || act.price || act.budget || 'N/A',
      status: act.status || 'Successful',
      date: act.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    setShowModal(true);
  };

  return (
    <>
      <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <div className="text-gray-400 text-sm italic py-6 text-center">
            <p>No recent activities found.</p>
          </div>
        ) : (
          activities.map((act, index) => {
            const activityTitle = act.title || act.text || 'Platform Activity';
            const activityAmount = act.amount || act.price || act.budget;
            const activityDate = act.date || 'Recent';
            const activityStatus = act.status || 'Successful';

            return (
              <div 
                key={act.id || index} 
                onClick={() => handleActivityClick(act)}
                className="flex justify-between items-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 rounded-xl text-xs sm:text-sm hover:border-pink-500/50 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0 group-hover:scale-125 transition-transform"></span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-pink-500 transition-colors truncate">
                      {activityTitle}
                    </p>
                    {activityAmount && (
                      <span className="text-[10px] font-bold text-emerald-400">Amount: {activityAmount}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 ml-2">
                  <span className="text-[11px] text-gray-400 font-medium">{activityDate}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    activityStatus.toLowerCase() === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {activityStatus}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl text-gray-900 dark:text-white space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-black">Activity & Financial Details</h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-white font-bold text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-pink-500/10 border border-pink-500/20 p-4 rounded-2xl text-xs space-y-2">
              <p className="font-extrabold text-pink-600 dark:text-pink-400 text-sm">{selectedActivity.title}</p>
              <div className="flex justify-between items-center pt-1 border-t border-pink-500/10">
                <span className="text-gray-400">Date: {selectedActivity.date}</span>
                <span className="font-bold text-emerald-400 text-sm">
                  Amount: {selectedActivity.amount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  selectedActivity.status.toLowerCase() === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {selectedActivity.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 dark:bg-[#1f2937]/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">TG ID:</span>
                <span className="font-mono font-bold text-emerald-500">{selectedActivity.tgId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">Full Name:</span>
                <span className="font-bold">{selectedActivity.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">Username:</span>
                <span className="text-pink-500 font-bold">@{selectedActivity.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">Email:</span>
                <span className="font-medium">{selectedActivity.email}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => {
                  setShowModal(false);
                  navigate(`/profile/${selectedActivity.username}`);
                }}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-extrabold text-xs transition cursor-pointer shadow-sm"
              >
                View Profile
              </button>
              <button 
                onClick={() => {
                  setShowModal(false);
                  localStorage.setItem('talegig_active_chat', selectedActivity.username);
                  localStorage.setItem('talegig_admin_notification', JSON.stringify({
                    user: selectedActivity.username,
                    message: `Admin reviewed activity: ${selectedActivity.title} (${selectedActivity.amount})`,
                    time: new Date().toLocaleTimeString(),
                    unread: true
                  }));
                  
                  navigate('/superadmin/inbox');
                }}
                className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-extrabold text-xs transition cursor-pointer shadow-md"
              >
                Direct Chat
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}