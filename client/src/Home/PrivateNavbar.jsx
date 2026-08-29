import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

// ==========================================
// 🟢 স্থায়ী ও নিখুঁত সাসপেনশন অ্যালার্ট ব্যানার কম্পোনেন্ট
// ==========================================
const SuspensionBanner = () => {
  const [suspendedInfo, setSuspendedInfo] = useState({ isSuspended: false, reason: '' });
  const location = useLocation();

  useEffect(() => {
    const checkSuspensionStatus = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (storedUser.isSuspended) {
          const currentTime = new Date().getTime();
          
          if (storedUser.suspendUntil && currentTime > storedUser.suspendUntil) {
            storedUser.isSuspended = false;
            storedUser.status = 'Active';
            storedUser.restrictions = {};
            storedUser.suspendUntil = null;
            localStorage.setItem('user', JSON.stringify(storedUser));
            setSuspendedInfo({ isSuspended: false, reason: '' });
          } else {
            setSuspendedInfo({
              isSuspended: true,
              reason: storedUser.suspendReason || storedUser.status || 'Your account has been suspended by the administrator.'
            });
          }
        } else {
          setSuspendedInfo({ isSuspended: false, reason: '' });
        }
      } catch (e) {}
    };

    checkSuspensionStatus();
  }, [location.pathname]);

  if (!suspendedInfo.isSuspended) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-3 text-center text-xs sm:text-sm font-extrabold flex flex-col sm:flex-row justify-center items-center gap-2 shadow-xl z-[999] relative border-b border-red-700">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 animate-pulse shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        <span><strong>Account Suspended:</strong> {suspendedInfo.reason}</span>
      </div>
      <span className="text-[11px] bg-black/30 px-3 py-1 rounded-lg">Some marketplace features are restricted.</span>
    </div>
  );
};

const PrivateNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProjectNotifsOpen, setIsProjectNotifsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, toggleRole, toggleTheme, theme, walletBalance } = useAuth();
  const darkMode = theme === 'dark';
  const isLight = theme === 'light';
  const handleThemeToggle = () => {if (toggleTheme) {toggleTheme();}};

  const handleLogoClick = () => {
    if (role === 'buyer') {
      navigate('/buyer-dashboard');
    } else {
      navigate('/seller-dashboard');
    }
  };

  const getActiveRole = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.role) return parsed.role;
      }
    } catch (e) {}
    return localStorage.getItem('userRole') || user?.role || 'seller';
  };

  const role = getActiveRole();

  // 🟢 currentUsername ডিফাইন করা হলো যাতে কোনো ReferenceError না আসে
  const getActiveUsername = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser?.username && storedUser.username !== '@Not Found') {
        return storedUser.username;
      }
      if (storedUser?.email) {
        return '@' + storedUser.email.split('@')[0];
      }
    } catch (e) {}
    return user?.username || '@user';
  };

  const currentUsername = getActiveUsername();

  // 🟢 রিয়েল-টাইম ব্যালেন্স ফেচ ফাংশন
  const getActiveBalance = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser?.balance !== undefined && !isNaN(storedUser.balance)) {
        return Number(storedUser.balance);
      }
      const savedWallet = JSON.parse(localStorage.getItem('user_wallet') || '{}');
      if (savedWallet.balance !== undefined && !isNaN(savedWallet.balance)) {
        return Number(savedWallet.balance);
      }
      if (walletBalance !== undefined && !isNaN(walletBalance)) {
        return Number(walletBalance);
      }
      const dashBalance = localStorage.getItem('talegig_balance');
      if (dashBalance !== null && !isNaN(dashBalance)) {
        return Number(dashBalance);
      }
    } catch (e) {}
    return 0;
  };

  const currentBalance = Number(getActiveBalance()) || 0;

  const getActiveAvatarData = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const avatarUrl = storedUser.avatar || storedUser.profilePic || user?.avatar || user?.profilePic;
      
      let displayName = '';

      // ১. যদি লোকালস্টোরে সরাসরি firstName এবং lastName আলাদাভাবে থাকে
      if (storedUser.firstName || storedUser.lastName) {
        const fName = storedUser.firstName || '';
        const lName = storedUser.lastName || '';
        displayName = `${fName} ${lName}`.trim();
      } 
      // ২. যদি full name থাকে এবং সেটি 'Not Found' না হয়
      else if (storedUser.name && storedUser.name !== 'Not Found') {
        displayName = storedUser.name;
      } 
      // ৩. ব্যাকআপ হিসেবে ইমেইল থেকে নাম তৈরি করা
      else if (storedUser.email) {
        const emailPrefix = storedUser.email.split('@')[0];
        displayName = emailPrefix;
      }

      // 🟢 শর্ত অনুযায়ী চেক করা: নাম যদি অনেক লম্বা হয়, তবে শুধু First Name দেখাবে
      if (displayName) {
        const nameParts = displayName.split(' ');
        if (displayName.length > 14 && nameParts.length > 1) {
          displayName = nameParts[0]; // শুধু প্রথম নাম (First Name) দেখাবে
        }
      } else {
        displayName = 'User';
      }

      return { avatarUrl, userName: displayName };
    } catch (e) {}
    return { avatarUrl: null, userName: 'User' };
  };

  const { avatarUrl, userName } = getActiveAvatarData();

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('talegig_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 1, title: 'Account Secured', desc: 'Two-factor authentication is recommended.', time: '1 hour ago', read: false, type: 'general' },
      { id: 2, title: 'Milestone Created', desc: 'A new milestone contract has been set up.', time: '3 hours ago', read: false, type: 'general' }
    ];
  });

  const [projectNotifications, setProjectNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('talegig_project_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 101, title: 'Project Posted Successfully', desc: 'Your project "E-commerce Website" is now live.', time: '10 mins ago', read: false, type: 'project' },
      { id: 102, title: 'New Proposal Received', desc: 'A freelancer submitted a proposal for your project.', time: '2 hours ago', read: false, type: 'project' }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('talegig_notifications', JSON.stringify(notifications));
      localStorage.setItem('talegig_project_notifications', JSON.stringify(projectNotifications));
    } catch (e) {}
  }, [notifications, projectNotifications]);


  const DropdownContent = (
    <div className="bg-white dark:bg-[#16171a] text-slate-900 dark:text-white border border-slate-200 dark:border-gray-800 rounded-xl p-4 shadow-2xl w-full md:w-72 transition-all">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-800 pb-2.5 mb-2.5">
        <div>
          <h4 className="font-bold text-sm">{userName}</h4>
          <p className="text-xs text-gray-400">{currentUsername}</p>
        </div>
        <button 
          onClick={() => setIsDropdownOpen(false)}
          className="md:hidden text-lg font-bold text-gray-400 hover:text-red-500 cursor-pointer p-1"
        >
          ✕
        </button>
      </div>

      <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-800 pb-2.5 mb-2.5">
        <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">User Role</span>
        <button 
          onClick={() => {
            toggleRole(); 
            setIsDropdownOpen(false);
            if (role === 'seller') {
              navigate('/buyer-dashboard');
            } else {
              navigate('/seller-dashboard');
            }
          }}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer"
        >
          {role === 'seller' ? 'Switch to Buyer' : 'Switch to Seller'}
        </button>
      </div>
      
      <div className="space-y-1 text-sm">
       <Link 
        to={`/profile/${currentUsername.replace('@', '')}`} 
        onClick={() => setIsDropdownOpen(false)} 
        className="flex items-center gap-2.5 hover:text-blue-400 py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800/80 transition text-xs font-medium"
          >
         <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
         View Profile
       </Link>
        <p 
          onClick={() => {
            setIsDropdownOpen(false);
            navigate('/seller-dashboard', { state: { activeTab: 'Membership' } });
          }} 
          className="flex items-center gap-2.5 hover:text-blue-400 py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800/80 transition cursor-pointer text-xs font-medium"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          Membership
        </p>
        <div 
          onClick={() => {
            setIsDropdownOpen(false);
            navigate('/seller-dashboard?tab=Settings');
          }} 
          className="flex items-center gap-2.5 hover:text-blue-400 py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800/80 transition cursor-pointer text-xs font-medium"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Settings
        </div>
        
        <div 
          onClick={() => {
            setIsDropdownOpen(false);
            if (role === 'buyer') {
              navigate('/buyer-dashboard', { state: { activeTab: 'Account Analytics' } });
            } else {
              navigate('/seller-dashboard', { state: { activeTab: 'Account Analytics' } });
            }
          }} 
          className="flex items-center gap-2.5 hover:text-blue-400 py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800/80 transition cursor-pointer text-xs font-medium"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          Account Analytics
        </div>
        
        <div className="flex justify-between items-center py-2 px-2 border-t border-slate-200 dark:border-gray-800 mt-1">
          <span className="text-xs text-slate-600 dark:text-gray-300">Theme Mode:</span>
          <button 
            onClick={handleThemeToggle} // 🟢 সরাসরি গ্লোবাল handleThemeToggle কল করা হলো
            className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-gray-800 text-xs cursor-pointer text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-gray-700 transition flex items-center gap-1.5"
          >
            {darkMode ? (
              <>
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Light
              </>
              
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                Dark
              </>
            )}
          </button>
        </div>
      </div>

      <h4 className="font-bold border-t border-slate-200 dark:border-gray-800 pt-2.5 mt-2 mb-1.5 text-[11px] text-gray-400 uppercase tracking-wider">Available Funds</h4>
      <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300 px-2">
        <p className="flex justify-between"><span>Balance:</span> <span className="font-bold text-slate-900 dark:text-white">${currentBalance.toLocaleString()} USD</span></p>
      </div>
      
      <div 
        onClick={() => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          navigate('/');
        }} 
        className="border-t border-slate-200 dark:border-gray-800 pt-2.5 mt-2.5 text-xs font-bold text-red-500 cursor-pointer hover:text-red-400 px-2 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        Logout
      </div>
    </div>
  );

  return (
    <>
      <SuspensionBanner />

      <nav className="w-full bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white pb-0 sticky top-0 z-[1000] transition-colors duration-200 font-sans shadow-xl border-b border-slate-200 dark:border-gray-800">
        <div className="w-full px-4 sm:px-6 py-3 flex justify-between items-center max-w-[1500px] mx-auto">
          
          <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide py-0.5">
<div 
        onClick={handleLogoClick} 
        className="cursor-pointer flex items-center pr-3 shrink-0"
      >
        <img 
          src={isLight ? "/taleGig3.png" : "/taleGig1.png"} // 🟢 লাইট মোডে taleGig3 এবং ডার্ক মোডে taleGig1 দেখাবে
          alt={isLight ? "taleGig3" : "taleGig1"} 
          className="h-8 sm:h-9 w-auto object-contain cursor-pointer transition-all duration-200"
        />
      </div>

            {role === 'seller' ? (
              <>
                <button 
                  onClick={() => navigate('/allproject')}
                  className="bg-pink-600 hover:bg-pink-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white cursor-pointer transition shadow-md shrink-0"
                >
                  Find Project
                </button>
                <button 
                  onClick={() => navigate('/allcontest')}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white cursor-pointer transition shadow-md shrink-0"
                >
                  Find Contest
                </button>
                <button 
                  onClick={() => navigate('/create-gig')}
                  className="border-2 border-pink-600 hover:bg-pink-600/10 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white cursor-pointer transition shrink-0"
                >
                  Create a gig
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/createproject')}
                  className="bg-pink-600 hover:bg-pink-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white cursor-pointer transition shadow-md shrink-0"
                >
                  Post a Project
                </button>
                <button 
                  onClick={() => navigate('/createproject', { state: { defaultType: 'contest' } })}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white cursor-pointer transition shadow-md shrink-0"
                >
                  Post a Contest
                </button>
                <button 
                  onClick={() => navigate('/freelancers')}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white cursor-pointer transition shadow-md shrink-0"
                >
                  Freelancers
                </button>
                <button 
                  onClick={() => navigate('/gigs')}
                  className="border-2 border-pink-600 hover:bg-pink-600/10 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white cursor-pointer transition shrink-0"
                >
                  All Gigs
                </button>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-5 text-xl shrink-0">
            
            {/* 🟢 ১. ফোল্ডার / প্রজেক্ট নোটিফিকেশন আইকন ও ড্রপডাউন */}
            <div 
              className="relative"
              onMouseEnter={() => setIsProjectNotifsOpen(true)}
              onMouseLeave={() => setIsProjectNotifsOpen(false)}
            >
              <span className="text-slate-600 dark:text-gray-300 hover:text-pink-500 cursor-pointer relative inline-block p-1.5 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {projectNotifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                )}
              </span>

              {isProjectNotifsOpen && (
                <div className="absolute right-0 top-11 w-96 bg-white dark:bg-[#16171a] text-slate-900 dark:text-white border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl z-[200] overflow-hidden animate-fadeIn">
                  <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-[#111]">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                      Project & Post Alerts
                    </h3>
                    <button 
                      onClick={() => setProjectNotifications(projectNotifications.map(n => ({ ...n, read: true })))}
                      className="text-xs text-pink-400 font-semibold hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-200 dark:divide-gray-800">
                    {projectNotifications.length > 0 ? (
                      projectNotifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-4 transition cursor-pointer flex gap-3 items-start ${
                            !notif.read ? 'bg-pink-50 dark:bg-pink-950/20' : 'hover:bg-slate-100 dark:hover:bg-[#1f2025]'
                          }`}
                        >
                          <span className="p-2 bg-pink-500/10 text-pink-500 rounded-xl shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2h0a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <h4 className="font-bold text-xs truncate">{notif.title}</h4>
                              <span className="text-[10px] text-gray-400 shrink-0">{notif.time}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">{notif.desc}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-gray-400">No project notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* 🟢 ২. জেনারেল নোটিফিকেশন আইকন ও ড্রপডাউন */}
            <div 
              className="relative"
              onMouseEnter={() => setIsNotificationsOpen(true)}
              onMouseLeave={() => setIsNotificationsOpen(false)}
            >
              <span className="text-slate-600 dark:text-gray-300 hover:text-blue-400 cursor-pointer relative inline-block p-1.5 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                )}
              </span>

              {isNotificationsOpen && (
                <div className="absolute right-0 top-11 w-96 bg-white dark:bg-[#16171a] text-slate-900 dark:text-white border border-slate-200 dark:border-gray-800 rounded-2xl shadow-2xl z-[200] overflow-hidden animate-fadeIn">
                  <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-[#111]">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      General Alerts
                    </h3>
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                      className="text-xs text-blue-400 font-semibold hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-200 dark:divide-gray-800">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-4 transition cursor-pointer flex gap-3 items-start ${
                            !notif.read ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-slate-100 dark:hover:bg-[#1f2025]'
                          }`}
                        >
                          <span className="p-2 bg-blue-500/10 text-blue-400 rounded-xl shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <h4 className="font-bold text-xs truncate">{notif.title}</h4>
                              <span className="text-[10px] text-gray-400 shrink-0">{notif.time}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">{notif.desc}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-gray-400">No new alerts</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Chat / Message SVG Icon */}
            <span 
              onClick={() => {
                if (role === 'buyer') {
                  navigate('/buyer-dashboard', { state: { activeTab: 'Inbox' } });
                } else {
                  navigate('/seller-dashboard', { state: { activeTab: 'Inbox' } });
                }
              }} 
              className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white cursor-pointer p-1.5 transition"
              title="Go to Messages"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </span>
            
            {/* 🟢 ৩. ডাইনামিক প্রোফাইল পিকচার অথবা প্রিমিয়াম লেটার অবতার */}
            <div 
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-gray-800 cursor-pointer py-1">
                <div className="text-right">
                  <span className="block font-bold text-xs text-slate-900 dark:text-white">{userName}</span>
                  <span className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">${currentBalance.toLocaleString()} USD</span>
                </div>
                {avatarUrl ? (
                  <img src={avatarUrl} className="w-9 h-9 rounded-full border-2 border-slate-300 dark:border-gray-600 object-cover shadow-md" alt="Profile" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shadow-md">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              {isDropdownOpen && <div className="absolute right-0 top-11 pt-1 z-[200]">{DropdownContent}</div>}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-[#111] text-slate-900 dark:text-white border-t border-slate-200 dark:border-gray-800 p-3 flex justify-around text-xl z-[100] items-center">
          <span className="p-1 text-slate-600 dark:text-gray-300 cursor-pointer" onClick={() => setIsProjectNotifsOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </span>
          
          <div className="relative p-1 text-slate-600 dark:text-gray-300 cursor-pointer" onClick={() => setIsNotificationsOpen(true)}>
            <span className="relative inline-block">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications.some(n => !n.read) && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </span>
          </div>

          <span 
            onClick={() => {
              if (role === 'buyer') {
                navigate('/buyer-dashboard', { state: { activeTab: 'Inbox' } });
              } else {
                navigate('/seller-dashboard', { state: { activeTab: 'Inbox' } });
              }
            }} 
            className="cursor-pointer p-1 text-slate-600 dark:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </span>

          <div onClick={() => setIsDropdownOpen(true)} className="relative cursor-pointer">
            {avatarUrl ? (
              <img src={avatarUrl} className="w-8 h-8 rounded-full border border-slate-300 dark:border-gray-600 object-cover" alt="Profile" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
        </div>

        {/* মোবাইল ড্রপডাউন */}
        {isDropdownOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex justify-end animate-fadeIn"
            onClick={() => setIsDropdownOpen(false)}
          >
            <div 
              className="w-[85%] max-w-xs h-full bg-white dark:bg-[#16171a] text-slate-900 dark:text-white shadow-2xl p-4 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {DropdownContent}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default PrivateNavbar;