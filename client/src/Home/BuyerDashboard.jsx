import React, { useState, useEffect, useRef } from 'react';
import PrivateNavbar from './PrivateNavbar';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules'; 
import 'swiper/css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import CommunityFeed from './CommunityFeed';
import Inbox from './Inbox';
import BuyerAnalytics from './BuyerAnalytics';
import Checkout from '../components/Checkout';
import Settings from './Settings';
import { useToast } from '../Home/ToastContext';

const BuyerDashboard = () => {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('talegig_theme') || localStorage.getItem('userTheme');
      return savedTheme ? savedTheme === 'dark' : true;
    } catch (e) {
      return true;
    }
  });

  const [showMenu, setShowMenu] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const { showToast } = useToast();
  
  const { user } = useAuth();
  const role = 'buyer';

  const menuItems = ['Dashboard', 'All Project', 'All Contest', 'All Gig', 'Favorites', 'Inbox', 'Free Credit', 'Membership', 'Account Analytics', 'Settings'];

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveItem(location.state.activeTab);
    }
  }, [location]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    if (tabParam) {
      setActiveItem(tabParam);
    }
  }, [location]);

  useEffect(() => {
    const checkTheme = () => {
      try {
        const savedTheme = localStorage.getItem('talegig_theme') || localStorage.getItem('userTheme');
        if (savedTheme) {
          const isDark = savedTheme === 'dark';
          setDarkMode(isDark);
          if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
          } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
          }
        }
      } catch (e) {}
    };

    checkTheme();
    window.addEventListener('storage', checkTheme);
    return () => window.removeEventListener('storage', checkTheme);
  }, [location.pathname]);

  // 🟢 কোনো ডামি ডাটা ছাড়াই সরাসরি ব্যাকএন্ড ডাটাবেজ থেকে রিয়েল প্রজেক্ট ফেচ করার লজিক
  const [projects, setProjects] = useState([]);

useEffect(() => {
    const fetchBackendProjects = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/projects');
        if (response.ok) {
          const data = await response.json();
          console.log("BACKEND PROJECTS DATA:", data);
          if (Array.isArray(data)) {
            const formatted = data.map(item => {
              // ক্যাটাগরি বা ক্যাশ থেকে স্ট্যাটাস বের করা
              let itemStatus = 'active';
              try {
                if (item.category && item.category.startsWith('{')) {
                  const parsedObj = JSON.parse(item.category);
                  if (parsedObj.paymentState === 'paid' || item.status === 'complete') {
                    itemStatus = 'complete';
                  } else if (parsedObj.awardedEntries && parsedObj.awardedEntries.length > 0) {
                    itemStatus = 'active';
                  }
                }
              } catch(e) {}

              return {
                id: item.id,
                title: item.title || 'Untitled Project',
                status: item.status ? item.status.toLowerCase() : itemStatus,
                partner: item.authorName ? `@${item.authorName.toLowerCase().replace(/\s+/g, '')}` : '@User not found',
                workFrom: item.type || 'Project',
                milestone: `$${item.budget !== undefined && item.budget !== null ? item.budget : 0}.00`,
                totalMilestoneCount: `1 Milestone ($${item.budget !== undefined && item.budget !== null ? item.budget : 0}.00 USD)`,
                totalProposal: item.proposals ? item.proposals.length : 0
              };
            });
            setProjects(formatted);
          }
        }
      } catch (err) {
        console.error("Failed to fetch projects from backend:", err);
      }
    };

    fetchBackendProjects();
  }, [location, activeItem]);

  const [contests, setContests] = useState([]);
  
  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = localStorage.getItem('talegig_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

const [favorites, setFavorites] = useState([]);

  // 🟢 লোকালস্টোরেজ বাদ দিয়ে সরাসরি ব্যাকএন্ড থেকে ফেচ করার লজিক
  useEffect(() => {
    const fetchBuyerDataFromBackend = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const buyerId = storedUser.id || 1;

        // ১. ফেভারিটস ফেচ করার লজিক (যদি ব্যাকএন্ডে ফেভারিটস রাউট থাকে)
        const favResponse = await fetch(`http://localhost:3001/api/buyer/favorites/${buyerId}`);
        if (favResponse.ok) {
          const favData = await favResponse.json();
          if (Array.isArray(favData)) setFavorites(favData);
        }

        // ২. অর্ডার্স ফেচ করার লজিক
        const ordResponse = await fetch(`http://localhost:3001/api/buyer/orders/${buyerId}`);
        if (ordResponse.ok) {
          const ordData = await ordResponse.json();
          if (Array.isArray(ordData)) setOrders(ordData);
        }
      } catch (e) {
        console.error("Failed to load backend buyer data:", e);
      }
    };

    fetchBuyerDataFromBackend();
  }, [location, activeItem]);

  const calculateBuyerFinancials = () => {
    let totalSpent = 0;
    let last30DaysSpent = 0;
    let currentBalance = 0;

    try {
      const savedProjects = localStorage.getItem('talegig_projects');
      if (savedProjects) {
        const projectsParsed = JSON.parse(savedProjects);
        projectsParsed.forEach(p => {
          if (p.status === 'complete') {
            const budgetNum = Number(String(p.budget || p.milestone || '0').replace(/[^0-9.]/g, ''));
            totalSpent += budgetNum;
            last30DaysSpent += budgetNum;
          }
        });
      }

      if (orders.length > 0) {
        orders.forEach(ord => {
          if (ord.status === 'complete') {
            const price = Number(ord.price || 0);
            totalSpent += price;
            last30DaysSpent += price;
          }
        });
      }

      const savedTransactions = localStorage.getItem('talegig_transactions');
      if (savedTransactions) {
        const transactions = JSON.parse(savedTransactions);
        transactions.forEach(tx => {
          const amt = Number(tx.amount || 0);
          if (tx.type === 'add') {
            currentBalance += amt;
          } else if (tx.type === 'withdraw' || tx.type === 'spend') {
            currentBalance -= amt;
          }
        });
      }
    } catch (e) {}

    return {
      totalSpent,
      last30: last30DaysSpent,
      balance: Math.max(0, currentBalance)
    };
  };

  const buyerFinancials = calculateBuyerFinancials();
  
  const profileData = { 
    fullName: user?.name || "Md Saidur Rahman Marjan",
    referralCode: "SAIDUR13" 
  };

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-[#050b1a] text-black dark:text-white flex flex-col overflow-hidden transition-colors duration-300">
      
      <div className="shrink-0">
        <PrivateNavbar />
      </div>

      {showSummary && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSummary(false)}></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-[#0b0f19] p-6 shadow-2xl overflow-y-auto border-l border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-black dark:text-white">Summary</h2>
              <button className="text-2xl cursor-pointer text-black dark:text-white" onClick={() => setShowSummary(false)}>✕</button>
            </div>
            <SummaryContent balance={buyerFinancials.balance} userName={user?.name || "Srmarjan"} financials={buyerFinancials} />
          </div>
        </div>
      )}

      <div className="md:hidden flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19]">
        <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-3 font-bold text-base cursor-pointer text-black dark:text-white">
          Dashboard <span className={`transform transition ${showMenu ? 'rotate-180' : ''}`}>▾</span>
        </button>
        <button onClick={() => setShowSummary(!showSummary)} className="text-2xl cursor-pointer text-black dark:text-white">☰</button>
      </div>

      {showMenu && (
        <div className="md:hidden bg-white dark:bg-[#0b0f19] p-4 border-b border-slate-200 dark:border-slate-800 space-y-1">
          {menuItems.map(item => (
            <div 
              key={item} 
              onClick={() => { setActiveItem(item); setShowMenu(false); }} 
              className={`p-2.5 rounded-xl text-sm font-semibold cursor-pointer text-black dark:text-white ${
                  activeItem === item ? 'bg-pink-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 flex w-full pt-3 px-2 sm:px-4 md:px-8 max-w-[1600px] mx-auto gap-6 pb-3 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <aside className="hidden md:block w-64 shrink-0 pr-2 h-full overflow-y-auto space-y-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {menuItems.map((item) => (
            <div 
              key={item} 
              onClick={() => setActiveItem(item)} 
              className={`p-3 rounded-2xl cursor-pointer font-bold text-sm transition-all ${
                activeItem === item 
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20' 
                  : 'text-black dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-black dark:hover:text-white'
              }`}
            >
              {item}
            </div>
          ))}
        </aside>

        <main className="flex-1 h-full px-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] text-black dark:text-white">
          {activeItem === 'Dashboard' && (
            <div className="space-y-6 h-full pr-1">
              <div className="relative mb-4 w-full overflow-hidden rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <Swiper
                  modules={[Autoplay]}
                  loop={true}
                  autoplay={{ delay: 3500 }}
                  onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                  className="w-full h-36 sm:h-48 md:h-56"
                >
                  {(() => {
                    let banners = [
                      { id: 1, title: 'TaleGig Buyer Banner Advertising 1', bg: 'from-blue-600 to-indigo-700', image: '' },
                      { id: 2, title: 'TaleGig Buyer Banner Advertising 2', bg: 'from-purple-600 to-pink-700', image: '' },
                      { id: 3, title: 'TaleGig Buyer Banner Advertising 3', bg: 'from-emerald-600 to-teal-700', image: '' }
                    ];

                    try {
                      const savedBanners = localStorage.getItem('talegig_admin_banners');
                      if (savedBanners) {
                        const parsed = JSON.parse(savedBanners);
                        if (Array.isArray(parsed) && parsed.length > 0) banners = parsed;
                      }
                    } catch (e) {}

                    return banners.map((banner, index) => (
                      <SwiperSlide key={banner.id || index} className="w-full h-full">
                        <div className={`w-full h-full bg-gradient-to-r ${banner.bg || 'from-blue-600 to-indigo-700'} relative flex items-center justify-center overflow-hidden`}>
                          {banner.image ? (
                            <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center px-4">
                              <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white drop-shadow-md">
                                {banner.title || 'TaleGig Buyer Banner Advertising'}
                              </h3>
                            </div>
                          )}
                        </div>
                      </SwiperSlide>
                    ));
                  })()}
                </Swiper>

                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
                  {[0, 1, 2].map((index) => (
                    <div 
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        activeIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <CommunityFeed currentUser={user} userRole="buyer" />
            </div>
          )}

          {activeItem === 'All Project' && (<BuyerProjectTable role={role} projects={projects} setProjects={setProjects} />)}
          {activeItem === 'All Contest' && (<ContestTable contests={contests} />)}
          {activeItem === 'All Gig' && (<GigTable orders={orders} />)}
          {activeItem === 'Favorites' && (<FavoritesTable favorites={favorites} setFavorites={setFavorites} />)}
          {activeItem === 'Account Analytics' && (<BuyerAnalytics />)}
          {activeItem === 'Inbox' && (
            <div className="w-full h-full overflow-hidden">
              <Inbox location={location} hideNavbar={true} />
            </div>
          )}
          {activeItem === 'Free Credit' && (<FreeCredit userData={{name: profileData?.fullName || "User",
                referralCode: profileData?.fullName.toUpperCase().replace(/\s+/g, '') + '13',
                points: 400, 
                shares: 1239,
                logins: 12,
                balance: 120}} />)}
          {activeItem === 'Membership' && <Membership userData={profileData} />}
        </main>

        {activeItem === 'Settings' && <Settings />}

        {activeItem !== 'Inbox' && (
          <aside className="hidden lg:block w-80 shrink-0 pl-2 space-y-6 overflow-y-auto h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] text-black dark:text-white">
             <SummaryContent balance={buyerFinancials.balance} userName={user?.name || "Srmarjan"} financials={buyerFinancials} />
          </aside>
        )}
      </div>
    </div>
  );
};

// 🏆 বায়ার প্রজেক্ট টেবিল কম্পোনেন্ট
const BuyerProjectTable = ({ role, projects, setProjects }) => {
  const [activeTab, setActiveTab] = useState('project');
  const navigate = useNavigate();
  const displayedProjects = projects || [];

  const [localProposals, setLocalProposals] = useState([]);

  // 🟢 লোকালস্টোরেজ বাদ দিয়ে সরাসরি ব্যাকএন্ড থেকে প্রোপোজাল/প্রজেক্ট ফেচ করা
  useEffect(() => {
    const fetchProposalsFromBackend = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/projects');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setLocalProposals(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch proposals from backend:", err);
      }
    };

    fetchProposalsFromBackend();
  }, []);

  const handleEndProject = (projectId, projectItem) => {
    const isPaymentCleared = projectItem.milestone && !projectItem.milestone.toLowerCase().includes('pending');
    if (!isPaymentCleared) {
      showToast("⚠️ Cannot end project! All milestone payments must be cleared first.",'error');
      return;
    }

    const updatedProjects = projects.map(p => 
      String(p.id) === String(projectId) ? { ...p, status: 'complete' } : p
    );
    setProjects(updatedProjects);
    try {
      localStorage.setItem('talegig_projects', JSON.stringify(updatedProjects));
      localStorage.setItem(`talegig_project_ended_${projectId}`, 'true');
    } catch (e) {}
    showToast("✅ Project successfully completed and moved to Complete tab!",'success');
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project-details/${projectId}`);
  };

  const handleProfileClick = (username) => {
    if (!username) return;
    const cleanUsername = String(username).replace('@', '');
    navigate(`/profile/${cleanUsername}`, { state: { username: cleanUsername, viewRole: 'freelancer' } });
  };

  const getWorkFromLabel = (type) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('contest')) return 'Contest';
    if (t.includes('gig')) return 'Gig';
    if (t.includes('custom')) return 'Custom Offer';
    if (t.includes('profile') || t.includes('direct')) return 'Direct';
    return 'Project';
  };

  const workBadgeStyles = {
    Project: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    Contest: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    Gig: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'Custom Offer': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Direct: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  };

  return (
    <div className="w-full bg-white dark:bg-[#0b0f19] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white">
      <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-[#16171a] p-1.5 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
        {['project', 'active', 'complete'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`px-6 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all capitalize cursor-pointer ${
              activeTab === tab ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="w-full overflow-hidden">
        {activeTab === 'project' && (
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider">
                <th className="py-3 px-3 font-extrabold w-[45%]">Project Title</th>
                <th className="py-3 px-3 font-extrabold w-[25%]">Total Proposal</th>
                <th className="py-3 px-3 font-extrabold w-[20%]">Status</th>
                <th className="py-3 px-3 font-extrabold w-[10%] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
              {localProposals.length > 0 ? (
                localProposals.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-3 font-medium max-w-[250px] sm:max-w-xs truncate">
                      <span onClick={() => handleProjectClick(item.id)} className="cursor-pointer text-slate-800 dark:text-slate-200 hover:text-pink-600 font-bold block truncate" title={item.title}>
                        {item.title}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-slate-700 dark:text-slate-400 font-semibold whitespace-nowrap">{item.totalProposal || (item.proposalsData ? item.proposalsData.length : 0)} Proposals</td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 inline-block">
                        No selected yet
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <ProjectActionDropdown project={item} onDelete={() => {
                        const filtered = localProposals.filter(p => p.id !== item.id);
                        setLocalProposals(filtered);
                        localStorage.setItem('talegig_proposals', JSON.stringify(filtered));
                      }} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500 text-sm font-medium">
                    No new projects found. Post a project first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'active' && (
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider">
                <th className="py-3 px-3 font-extrabold w-[35%]">Project Title</th>
                <th className="py-3 px-3 font-extrabold w-[20%]">Freelancer</th>
                <th className="py-3 px-3 font-extrabold w-[15%]">Work From</th>
                <th className="py-3 px-3 font-extrabold w-[18%]">Milestone</th>
                <th className="py-3 px-3 font-extrabold w-[12%] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
{projects.filter(p => String(p.status).toLowerCase() === 'active').length > 0 ? (
  projects.filter(p => String(p.status).toLowerCase() === 'active').map((p) => {
    const workLabel = getWorkFromLabel(p.workFrom || p.type);
    return (
      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
        <td className="py-4 px-3 font-medium max-w-[200px] truncate">
          <span onClick={() => handleProjectClick(p.id)} className="cursor-pointer text-slate-800 dark:text-slate-200 hover:text-pink-600 font-bold block truncate" title={p.title}>
            {p.title}
          </span>
        </td>
        <td className="py-4 px-3 font-medium whitespace-nowrap truncate max-w-[120px]">
          <span onClick={() => handleProfileClick(p.partner)} className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline font-bold truncate block">
            {p.partner || '@freelancer'}
          </span>
        </td>
        <td className="py-4 px-3 whitespace-nowrap">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${workBadgeStyles[workLabel] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
            {workLabel}
          </span>
        </td>
        <td className="py-4 px-3 text-amber-600 dark:text-amber-500 font-extrabold whitespace-nowrap">
          {p.milestone || p.budget || 'No active milestone'}
        </td>
        <td className="py-4 px-3 text-right whitespace-nowrap">
          <ActionDropdown project={p} onEndProject={() => handleEndProject(p.id, p)} navigate={navigate} />
        </td>
      </tr>
    );
  })
) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500 text-sm font-medium">
                    No active projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'complete' && (
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider">
                <th className="py-3 px-3 font-extrabold w-[35%]">Project Title</th>
                <th className="py-3 px-3 font-extrabold w-[20%]">Freelancer</th>
                <th className="py-3 px-3 font-extrabold w-[15%]">Work From</th>
                <th className="py-3 px-3 font-extrabold w-[18%]">Milestone</th>
                <th className="py-3 px-3 font-extrabold w-[12%] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
              {projects.filter(p => p.status === 'complete').length > 0 ? (
                projects.filter(p => p.status === 'complete').map((p) => {
                  const workLabel = getWorkFromLabel(p.workFrom || p.type);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-3 font-medium max-w-[200px] truncate">
                        <span onClick={() => handleProjectClick(p.id)} className="cursor-pointer text-slate-800 dark:text-slate-200 hover:text-pink-600 font-bold block truncate" title={p.title}>
                          {p.title}
                        </span>
                      </td>
                      <td className="py-4 px-3 font-medium whitespace-nowrap truncate max-w-[120px]">
                        <span onClick={() => handleProfileClick(p.partner)} className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline font-bold truncate block">
                          {p.partner || '@freelancer'}
                        </span>
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${workBadgeStyles[workLabel] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                          {workLabel}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-emerald-600 dark:text-emerald-500 font-extrabold whitespace-nowrap">
                        {p.milestone || p.budget || p.totalMilestoneCount || '1 Milestone'}
                      </td>
                      <td className="py-4 px-3 text-right whitespace-nowrap">
                        <CompleteActionDropdown project={p} navigate={navigate} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500 text-sm font-medium">
                    No completed projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const ProjectActionDropdown = ({ project, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 6, left: rect.right - 140 });
    }
    setIsOpen(!isOpen);
  };

  const handleEditProject = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('talegig_edit_project_data', JSON.stringify(project));
    } catch (e) {}
    navigate('/createproject', { state: { editProject: project } });
  };

  return (
    <div className="relative inline-block text-left">
      <button ref={buttonRef} onClick={toggleDropdown} className="bg-pink-600 hover:bg-pink-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-sm whitespace-nowrap">Action ▾</button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)}></div>
          <div className="fixed z-[9999] w-36 bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-black dark:text-white py-1" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
            <button onClick={() => { setIsOpen(false); navigate(`/project-details/${project.id}`); }} className="block w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer">Preview</button>
            <button onClick={handleEditProject} className="block w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer">Edit Project</button>
            <button onClick={() => { setIsOpen(false); showToast('Project link copied!','success'); }} className="block w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer">Share</button>
            <button onClick={() => { setIsOpen(false); onDelete(); }} className="block w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold text-red-500 border-t border-slate-100 dark:border-slate-800 cursor-pointer">Delete</button>
          </div>
        </>
      )}
    </div>
  );
};

const ActionDropdown = ({ project, onEndProject, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 6, left: rect.right - 170 });
    }
    setIsOpen(!isOpen);
  };

  const workTypeLabel = String(project.workFrom || project.type || '').toLowerCase();
  const isContest = workTypeLabel.includes('contest') || project.contestId || project.isContest;
  const isGig = workTypeLabel.includes('gig');

  return (
    <div className="relative inline-block text-left">
      <button ref={buttonRef} onClick={toggleDropdown} className="bg-pink-600 hover:bg-pink-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-sm whitespace-nowrap">Action ▾</button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)}></div>
          <div className="fixed z-[9999] w-44 bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-black dark:text-white py-1" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
            <button onClick={() => { 
              setIsOpen(false); 
              if (isContest) {
                navigate(`/contest-details/${project.id}`);
              } else if (isGig) {
                localStorage.setItem('talegig_active_order_id', project.id);
                navigate(`/gig-order/${project.id}`); 
              } else {
                navigate(`/project-details/${project.id}`); 
              }
            }} className="block w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer">View Order</button>
            
            <button onClick={() => { 
              setIsOpen(false); 
              navigate('/buyer-dashboard', { state: { activeTab: 'Inbox', chatUser: project.partner || 'Freelancer' } }); 
            }} className="block w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer text-pink-600">Chat</button>
            
            {!isContest && !isGig && (
              <button onClick={() => { setIsOpen(false); navigate(`/project-details/${project.id}?tab=payment`); }} className="block w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer">Milestone</button>
            )}

            {project.status === 'active' && (
              <button onClick={() => { onEndProject(); setIsOpen(false); }} className="block w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold text-red-500 border-t border-slate-100 dark:border-slate-800 cursor-pointer">End Project</button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const CompleteActionDropdown = ({ project, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 6, left: rect.right - 150 });
    }
    setIsOpen(!isOpen);
  };

  const workTypeLabel = String(project.workFrom || project.type || '').toLowerCase();
  const isContest = workTypeLabel.includes('contest') || project.contestId || project.isContest;
  const isGig = workTypeLabel.includes('gig');

  return (
    <div className="relative inline-block text-left">
      <button ref={buttonRef} onClick={toggleDropdown} className="bg-pink-600 hover:bg-pink-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-sm whitespace-nowrap">Action ▾</button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)}></div>
          <div className="fixed z-[9999] w-40 bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-black dark:text-white py-1" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
            <button onClick={() => { 
              setIsOpen(false); 
              navigate('/buyer-dashboard', { state: { activeTab: 'Inbox', chatUser: project.partner || 'Freelancer' } }); 
            }} className="block w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer text-pink-600">Chat</button>
            
            <button onClick={() => { setIsOpen(false); showToast(`Re-hiring ${project.partner || 'Freelancer'}...`); }} className="block w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-emerald-500 cursor-pointer">Re-Hire</button>
            
            <button onClick={() => { 
              setIsOpen(false); 
              if (isContest) {
                navigate(`/contest-details/${project.id}`);
              } else if (isGig) {
                localStorage.setItem('talegig_active_order_id', project.id);
                navigate(`/gig-order/${project.id}`); 
              } else {
                navigate(`/project-details/${project.id}?tab=payment`); 
              }
            }} className="block w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold border-t border-slate-100 dark:border-slate-800 cursor-pointer">View Order</button>
          </div>
        </>
      )}
    </div>
  );
};

const ContestTable = ({ contests }) => {
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate(); // 🟢 নেভিগেশন হুক যোগ করা হলো

  const getDeadlineStyle = (deadline) => {
    if (deadline === "Time Over") return "bg-red-500/10 text-red-500 border border-red-500/20";
    return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
  };

  return (
    <div className="w-full bg-white dark:bg-[#0b0f19] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-black dark:text-white">
      <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-[#16171a] p-1.5 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
        {['active', 'awarded'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`px-6 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all capitalize cursor-pointer ${
              activeTab === tab ? 'bg-pink-600 text-white shadow-md' : 'text-black dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider">
              <th className="pb-4 font-extrabold px-3">Project Title</th>
              <th className="pb-4 font-extrabold px-3">
                {activeTab === 'active' ? 'Entries' : 'Client'}
              </th>
              <th className="pb-4 font-extrabold px-3">Price</th>
              <th className="pb-4 font-extrabold px-3">Status</th>
              <th className="pb-4 font-extrabold px-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
            {contests && contests.filter(c => c.status === activeTab).length > 0 ? (
              contests.filter(c => c.status === activeTab).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 font-bold px-3">{c.title}</td>
                  <td className="py-4 px-3 text-slate-600 dark:text-slate-400 font-medium">
                    {activeTab === 'active' ? (c.entriesCount || c.entries || 0) : (c.client || '@saidurbuyer')}
                  </td>
                  <td className="py-4 font-extrabold px-3">{c.budget || c.price}</td>
                  <td className="py-4 px-3">
                     {activeTab === 'active' ? (
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDeadlineStyle(c.deadline || c.timeLeft)}`}>
                         {c.deadline || c.timeLeft || '3 days left'}
                       </span>
                     ) : (
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.hasReviewed ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                         {c.hasReviewed ? 'Complete' : 'Give review'}
                       </span>
                     )}
                  </td>
                  <td className="py-4 px-3">
                    <button 
                      onClick={() => navigate(`/buyer-contest-details/${c.id}`, { state: { contest: c } })}
                      className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-sm"
                    >
                      View Contest
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-500 text-sm font-medium">
                  No {activeTab} contests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GigTable = ({ orders }) => {
  const [activeTab, setActiveTab] = useState('Gig Order');
  const navigate = useNavigate();

  const filteredOrders = (orders || []).filter(o => {
    const st = (o.status || '').toLowerCase();
    if (activeTab === 'Gig Order') return st === 'pending' || st === 'active' || st === 'delivered';
    if (activeTab === 'Complete') return st === 'complete';
    return true;
  });

  return (
    <div className="w-full bg-white dark:bg-[#0b0f19] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-black dark:text-white">
      <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-[#16171a] p-1.5 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
        {['Gig Order', 'Complete'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`px-6 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all capitalize cursor-pointer ${
              activeTab === tab ? 'bg-pink-600 text-white shadow-md' : 'text-black dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-slate-50 dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider">
              <th className="p-4 font-extrabold">Gig Title</th>
              <th className="p-4 font-extrabold">Client</th>
              <th className="p-4 font-extrabold">Price</th>
              <th className="p-4 font-extrabold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-12 text-center text-slate-400 font-bold">
                  No {activeTab.toLowerCase()}s found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-black dark:text-white">{o.title}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">@{o.client}</td>
                  <td className="p-4 font-extrabold text-black dark:text-white">${o.price}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => navigate(`/gig-order/${o.id}`)}
                      className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer"
                    >
                      View Order
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FavoritesTable = ({ favorites, setFavorites }) => {
  const subTabs = ['Freelancer', 'Gig'];
  const [activeSubTab, setActiveSubTab] = useState(subTabs[0]);
  const navigate = useNavigate();

  const handleRemoveFavorite = (id, e) => {
    e.stopPropagation();
    const updated = favorites.filter(item => item.id !== id);
    setFavorites(updated);
    try {
      localStorage.setItem('talegig_favorites', JSON.stringify(updated));
    } catch (e) {}
  };

  const filteredFavorites = favorites.filter(f => {
    const itemType = (f.type || '').toLowerCase();
    if (activeSubTab === 'Freelancer') {
      return itemType === 'client' || itemType === 'freelancer';
    } else {
      return itemType === 'gig';
    }
  });

  return (
    <div className="w-full bg-white dark:bg-[#0b0f19] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-black dark:text-white">
      <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-[#16171a] p-1.5 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
        {subTabs.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveSubTab(tab)} 
            className={`px-6 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all capitalize cursor-pointer ${
              activeSubTab === tab 
                ? 'bg-pink-600 text-white shadow-md' 
                : 'text-black dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="w-full overflow-x-auto pb-4 space-y-4">
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm font-medium">
            You haven't added any favorite {activeSubTab.toLowerCase()}s yet.
          </div>
        ) : (
          filteredFavorites.map((item) => (
            <div 
              key={item.id} 
              className="bg-slate-50 dark:bg-[#16171a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start gap-6 transition-all w-full min-w-[700px] md:min-w-0"
            >
              <img src={item.image} className="w-28 h-28 rounded-2xl object-cover flex-shrink-0 border border-slate-300 dark:border-slate-700 shadow-sm" alt="" />

              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-extrabold text-black dark:text-white">{item.name || item.title}</h3>
                  {item.username && <span className="text-xs font-semibold text-slate-500">@{item.username}</span>}
                  <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">● online</span>
                </div>
                
                <h4 className="text-black dark:text-slate-200 font-bold text-sm sm:text-base">{item.tagline || item.description}</h4>
                
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  {item.rating && <span>⭐ {item.rating}</span>}
                  {item.reviews && <span>💬 {item.reviews} reviews</span>}
                  {item.completedProjects && <span>☑ {item.completedProjects}% Complete</span>}
                  {item.location && <span>📍 {item.location}</span>}
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-1 mt-0.5">
                  {item.bio}
                </p>

                {item.skills && item.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.skills.map((skill, index) => (
                      <span key={index} className="text-xs font-bold text-black dark:text-slate-300 bg-white dark:bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 w-full md:w-36 pt-4 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800">
                <div className="text-left md:text-right">
                  <p className="text-xl sm:text-2xl font-black text-black dark:text-white">${item.price}</p>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase">Per {activeSubTab === 'Freelancer' ? 'hour' : 'order'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleRemoveFavorite(item.id, e)} 
                    className="text-xl text-pink-600 hover:scale-110 transition-transform cursor-pointer p-1"
                    title="Remove from favorites"
                  >
                    ❤️
                  </button>
                  <button 
                    onClick={() => {
                      if (activeSubTab === 'Freelancer') {
                        navigate(`/buyer-dashboard`, { state: { activeTab: 'Inbox', targetUser: item.username } });
                      } else {
                        navigate(`/gig/${item.id}`);
                      }
                    }} 
                    className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shadow-md cursor-pointer"
                  >
                    {activeSubTab === 'Freelancer' ? 'Contact' : 'View Gig'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const FreeCredit = ({ userData }) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const minWithdraw = 300;
  const canWithdraw = userData.points >= minWithdraw;
  const firstName = userData.name ? userData.name.split(' ')[0] : 'User';
  const generatedCode = userData.referralCode || (userData.name.toUpperCase().replace(/\s+/g, '').substring(0, 6) + '13');

  return (
    <div className="p-6 bg-white dark:bg-[#0b0f19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all text-black dark:text-white">
      <h2 className="text-2xl font-extrabold mb-1">Hello, {firstName}</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">Your Referral code is <span className="text-pink-600 font-bold">{generatedCode}</span></p>

      <div className="bg-pink-500/10 border border-pink-500/20 p-4 rounded-2xl mb-6">
        <h4 className="font-extrabold text-pink-600 dark:text-pink-400 text-sm">Invite & Earn Together!</h4>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1">
          Share your link. When your friend joins, you both get 10 bonus points instantly!
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-xs sm:text-sm font-bold mb-2">
          <span>{userData.points} Points</span>
          <span>{minWithdraw} Points to withdraw</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-full transition-all duration-500" 
               style={{ width: `${Math.min((userData.points / minWithdraw) * 100, 100)}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 border border-white/10 shadow-xl text-white">
          <p className="text-xs font-extrabold opacity-80 uppercase tracking-wider">Total Share</p>
          <h3 className="text-3xl sm:text-4xl font-black my-3">{userData.shares}</h3>
          <p className="text-xs opacity-80 mb-6">You share this platform {userData.shares} times</p>
          <button className="w-full py-3 rounded-xl border border-white/30 font-bold text-xs sm:text-sm hover:bg-white/20 transition-all cursor-pointer shadow-sm">Share Now!</button>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 border border-white/10 shadow-xl text-white">
          <p className="text-xs font-extrabold opacity-80 uppercase tracking-wider">Total Login</p>
          <h3 className="text-3xl sm:text-4xl font-black my-3">{userData.logins}</h3>
          <p className="text-xs opacity-80 mb-6">{userData.logins} people logged in from your shared link.</p>
          <button className="w-full py-3 rounded-xl border border-white/30 font-bold text-xs sm:text-sm hover:bg-white/20 transition-all cursor-pointer shadow-sm">Share More!</button>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 border border-white/10 shadow-xl text-white">
          <p className="text-xs font-extrabold opacity-80 uppercase tracking-wider">Your Earning</p>
          <h3 className="text-3xl sm:text-4xl font-black my-3">${userData.balance}</h3>
          <p className="text-xs opacity-80 mb-6">Congratulations!! You earned ${userData.balance}.</p>
          <button 
            disabled={!canWithdraw}
            onClick={() => setShowWithdrawModal(true)}
            className={`w-full py-3 rounded-xl border border-white/30 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm ${canWithdraw ? 'hover:bg-white/20' : 'opacity-50 cursor-not-allowed'}`}
          >
            {canWithdraw ? "Withdraw" : "Need 300 pts"}
          </button>
        </div>
      </div>

      {showWithdrawModal && <WithdrawModal onClose={() => setShowWithdrawModal(false)} />}
    </div>
  );
};

const WithdrawModal = ({ onClose }) => {
  const methods = ['Bkash', 'Nagad', 'Rocket', 'Bank Transfer'];
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-sm shadow-2xl text-black dark:text-white space-y-4">
        <h3 className="text-lg font-extrabold">Select Payment Method</h3>
        <div className="space-y-2">
          {methods.map(m => (
            <button key={m} className="w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition font-bold text-sm cursor-pointer">
              {m}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-3 bg-slate-200 dark:bg-slate-800 text-black dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer text-xs sm:text-sm">
          Close
        </button>
      </div>
    </div>
  );
};

const Membership = ({ userData }) => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    { name: "Free", price: 0, features: ["5 Projects", "Custom Cover Photo", "Daily Support", "10 Skills", "Post Contest"] },
    { name: "Basic", price: 4.99, features: ["15 Projects", "Custom Cover Photo", "Priority Support", "15 Skills", "Post Contest", "Verified Badge"] },
    { name: "Standard", price: 9.99, features: ["30 Projects", "Custom Cover Photo", "24/7 Support", "20 Skills", "Post Contest", "Verified Badge", "Project Promote"] },
    { name: "Premium", price: 19.99, features: ["Unlimited Projects", "Custom Cover Photo", "Dedicated Manager", "40 Skills", "Post Contest", "Verified Badge", "Top Placement"] }
  ];

  return (
    <div className="p-2 text-black dark:text-white">
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 p-1.5 rounded-full flex shadow-sm">
          <button onClick={() => setIsYearly(false)} className={`px-6 py-2.5 rounded-full font-extrabold text-xs sm:text-sm cursor-pointer transition ${!isYearly ? 'bg-pink-600 text-white shadow-md' : 'text-black dark:text-slate-500'}`}>Monthly</button>
          <button onClick={() => setIsYearly(true)} className={`px-6 py-2.5 rounded-full font-extrabold text-xs sm:text-sm cursor-pointer transition ${isYearly ? 'bg-pink-600 text-white shadow-md' : 'text-black dark:text-slate-500'}`}>Yearly (Save 20%)</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className="group relative bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col h-full overflow-hidden transition-all hover:border-pink-500/50 shadow-sm"
          >
            <div className={`relative ${plan.name === 'Free' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} 
              rounded-2xl text-center py-2.5 font-extrabold text-sm sm:text-base mb-6 mx-4 mt-4 shadow-md text-white`}>
              {plan.name}
            </div>

            <div className="text-center mb-6 px-4">
              <h2 className="text-3xl sm:text-4xl font-black text-black dark:text-white">
                ${isYearly ? (plan.price * 10 * 12 / 10).toFixed(2) : plan.price.toFixed(2)}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-extrabold mt-1">Per {isYearly ? 'Year' : 'Month'}</p>
            </div>

            <ul className="text-xs sm:text-sm space-y-3 px-6 mb-8 text-slate-700 dark:text-slate-300 font-medium flex-grow">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className="text-pink-600 font-extrabold">✓</span> {f}
                </li>
              ))}
            </ul>

            <div className="p-5 mt-auto">
              <button 
                onClick={() => setSelectedPlan(plan)}
                className="w-full py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm text-white shadow-lg shadow-pink-600/20 bg-pink-600 hover:bg-pink-700 transition-all duration-300 cursor-pointer"
              >
                {plan.price === 0 ? 'Current Plan' : 'Upgrade Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPlan && <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </div>
  );
};

const PaymentModal = ({ plan, onClose }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl text-black dark:text-white space-y-4">
      <h2 className="text-xl font-extrabold text-black dark:text-white">Pay for {plan.name} Plan</h2>
      <div className="space-y-2.5">
        {['Credit / Debit Card', 'Visa / Mastercard', 'Bkash / Nagad'].map(m => (
          <button key={m} className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer text-left text-black dark:text-white">
            {m}
          </button>
        ))}
      </div>
      <button 
  key={m} 
  onClick={() => { showToast(`Processing payment via ${m}...`, 'success'); onClose(); }}
  className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer text-left text-black dark:text-white"
>
  {m}
</button>
    </div>
  </div>
);

const SummaryContent = ({ balance, userName, financials }) => {
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvc: ''
  });
  const [showVerifyCvc, setShowVerifyCvc] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [savedCards, setSavedCards] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('talegig_saved_cards') || '[]');
    } catch (e) {
      return [];
    }
  });

  const isVerified = savedCards.length > 0 || localStorage.getItem('talegig_payment_verified') === 'true';

  const handleVerifyCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardForm({ ...cardForm, cardNumber: formatted });
    if (formErrors.cardNumber) setFormErrors({ ...formErrors, cardNumber: '' });
  };

  const handleVerifyExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardForm({ ...cardForm, expiryDate: val });
    if (formErrors.expiryDate) setFormErrors({ ...formErrors, expiryDate: '' });
  };

  const validateVerifyForm = () => {
    let errors = {};
    const cleanCard = cardForm.cardNumber.replace(/\s+/g, '');
    
    if (cleanCard.length !== 16) {
      errors.cardNumber = 'Card number must be 16 digits.';
    }
    if (!cardForm.cardHolder.trim() || /\d/.test(cardForm.cardHolder)) {
      errors.cardHolder = 'Enter valid name (no numbers allowed).';
    }
    if (!cardForm.expiryDate.includes('/') || cardForm.expiryDate.length !== 5) {
      errors.expiryDate = 'Format must be MM/YY.';
    }
    if (cardForm.cvc.length < 3 || isNaN(cardForm.cvc)) {
      errors.cvc = 'Valid CVC required (3-4 digits).';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    if (!validateVerifyForm()) return;

    const newCard = {
      id: Date.now(),
      last4: cardForm.cardNumber.slice(-4),
      cardHolder: cardForm.cardHolder,
      expiryDate: cardForm.expiryDate,
      type: 'Credit Card'
    };

    const updatedCards = [newCard, ...savedCards];
    setSavedCards(updatedCards);
    try {
      localStorage.setItem('talegig_saved_cards', JSON.stringify(updatedCards));
      localStorage.setItem('talegig_payment_verified', 'true');
    } catch (err) {}

    setShowVerifyModal(false);
    showToast('🎉 Card successfully verified and saved for auto-payments!','success');
    setCardForm({ cardNumber: '', cardHolder: '', expiryDate: '', cvc: '' });
    setFormErrors({});
  };

  return (
    <aside className="w-full space-y-4 text-black dark:text-white">
        <h2 className="text-2xl font-extrabold text-black dark:text-white">Hello, {userName ? userName.split(' ')[0] : 'User'}</h2>
        
        <div className="bg-white dark:bg-[#0b0f19] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Membership</span>
            <span className="text-pink-600 dark:text-pink-400 font-extrabold">Free trial</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Post 5 Projects available</p>
          <button onClick={() => navigate('/buyer-dashboard', { state: { activeTab: 'Membership' } })} className="w-full bg-pink-600 hover:bg-pink-700 transition-all py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-md cursor-pointer text-white">Upgrade</button>
        </div>

        <div className="bg-white dark:bg-[#0b0f19] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <span className="shrink-0">Balance</span>
            <div className="flex items-center gap-2">
              {isVerified ? (
                <span className="text-emerald-500 font-extrabold text-xs">✓ Verified</span>
              ) : (
                <button onClick={() => setShowVerifyModal(true)} className="text-amber-500 font-extrabold hover:underline cursor-pointer text-xs">Verify +</button>
              )}
              <span 
                onClick={() => setShowCheckout(true)}
                className="text-emerald-500 font-extrabold hover:underline cursor-pointer text-xs"
              >
                Add funds +
              </span>
            </div>
          </div>
          <div className="text-right font-mono text-2xl font-black text-pink-600 dark:text-pink-400">
            ${balance ? balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
          </div>
        </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-pink-600 dark:text-pink-400 font-black text-base sm:text-lg">
            ${financials?.totalSpent ? financials.totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
          </p>
          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-1">Total Spent</p>
        </div>
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-pink-600 dark:text-pink-400 font-black text-base sm:text-lg">
            ${financials?.last30 ? financials.last30.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
          </p>
          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-1">Spent in past 30 days</p>
        </div>
      </div>

      <button onClick={() => navigate('/createproject')} className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer">
        Post a Project
      </button>
      
      <button onClick={() => navigate('/buyer-dashboard', { state: { activeTab: 'Free Credit' } })} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer">
        Invite & Earn Rewards
      </button>

      <Checkout 
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        initialAmount={100}
        userRole="buyer"
        onPaymentSuccess={() => {
          window.location.reload();
        }}
      />

      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl text-black dark:text-white space-y-4 my-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black">Save & Verify Payment Method</h3>
              <button onClick={() => setShowVerifyModal(false)} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">✕</button>
            </div>
            <p className="text-xs text-slate-500">Enter your card details to save them securely for future instant project checkouts and auto-payments.</p>
            
            <form onSubmit={handleSaveCard} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Card number</label>
                <input 
                  type="text" 
                  required 
                  placeholder="4488 0000 0000 0000" 
                  maxLength="19"
                  value={cardForm.cardNumber}
                  onChange={handleVerifyCardNumberChange}
                  className={`w-full bg-slate-50 dark:bg-[#16171a] border ${formErrors.cardNumber ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-pink-600 font-mono text-black dark:text-white`}
                />
                {formErrors.cardNumber && <span className="text-[10px] text-red-500 font-bold mt-1 block">{formErrors.cardNumber}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Cardholder name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Md Saidur Rahman" 
                  value={cardForm.cardHolder}
                  onChange={(e) => {
                    setCardForm({...cardForm, cardHolder: e.target.value});
                    if (formErrors.cardHolder) setFormErrors({...formErrors, cardHolder: ''});
                  }}
                  className={`w-full bg-slate-50 dark:bg-[#16171a] border ${formErrors.cardHolder ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-pink-600 text-black dark:text-white`}
                />
                {formErrors.cardHolder && <span className="text-[10px] text-red-500 font-bold mt-1 block">{formErrors.cardHolder}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Expiry date</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="MM/YY" 
                    maxLength="5"
                    value={cardForm.expiryDate}
                    onChange={handleVerifyExpiryChange}
                    className={`w-full bg-slate-50 dark:bg-[#16171a] border ${formErrors.expiryDate ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-pink-600 font-mono text-center text-black dark:text-white`}
                  />
                  {formErrors.expiryDate && <span className="text-[10px] text-red-500 font-bold mt-1 block">{formErrors.expiryDate}</span>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">CVC / CVV</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required 
                      placeholder="CVC" 
                      maxLength="4"
                      value={cardForm.cvc}
                      onChange={(e) => {
                        setCardForm({...cardForm, cvc: e.target.value.replace(/\D/g, '')});
                        if (formErrors.cvc) setFormErrors({...formErrors, cvc: ''});
                      }}
                      style={{ WebkitTextSecurity: showVerifyCvc ? 'none' : 'disc' }}
                      className={`w-full bg-slate-50 dark:bg-[#16171a] border ${formErrors.cvc ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-pink-600 font-mono text-center pr-9 text-black dark:text-white`}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowVerifyCvc(!showVerifyCvc)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer z-10"
                    >
                      {showVerifyCvc ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                  {formErrors.cvc && <span className="text-[10px] text-red-500 font-bold mt-1 block">{formErrors.cvc}</span>}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-extrabold text-xs sm:text-sm shadow-lg shadow-pink-600/30 transition-all cursor-pointer mt-2"
              >
                Save & Verify Card
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default BuyerDashboard;