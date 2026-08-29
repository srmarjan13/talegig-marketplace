import React, { useState, useEffect, useRef } from 'react';
import PrivateNavbar from './PrivateNavbar';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules'; 
import 'swiper/css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import CommunityFeed from './CommunityFeed';
import Inbox from './Inbox';
import AccountAnalytics from './AccountAnalytics';
import Checkout from '../components/Checkout';
import Settings from './Settings';
import { useToast } from '../Home/ToastContext';

const SellerDashboard = () => {
  const { user, theme } = useAuth(); // 🟢 গ্লোবাল কনটেক্সট থেকে theme নেওয়া হলো
  
  // 🟢 গ্লোবাল থিম লাইট হলেই কেবল darkMode ফলস হবে
  const darkMode = theme === 'dark';

  const [showMenu, setShowMenu] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const { showToast } = useToast();

  const menuItems = ['Dashboard', 'All Project', 'All Contest', 'Proposal', 'All Gig', 'Favorites', 'Inbox', 'Free Credit', 'Membership', 'Account Analytics', 'Settings'];

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
        const savedTheme = localStorage.getItem('theme'); // শুধুমাত্র 'theme'
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
  }, [location.pathname, theme]);

  const [projects, setProjects] = useState(() => {
    try {
      const savedProjects = localStorage.getItem('talegig_projects');
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('talegig_projects');
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed)) setProjects(parsed);
      }
    } catch (e) {}
  }, [location, activeItem]);

  const [proposal, setProposal] = useState(() => {
    try {
      const savedProposals = localStorage.getItem('talegig_proposals');
      if (savedProposals) {
        const parsed = JSON.parse(savedProposals);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      const savedProposals = localStorage.getItem('talegig_proposals');
      if (savedProposals) {
        const parsed = JSON.parse(savedProposals);
        if (Array.isArray(parsed)) setProposal(parsed);
      }
    } catch (e) {}
  }, [location, activeItem]);

  const [contests, setContests] = useState(() => {
    try {
      const savedContests = localStorage.getItem('talegig_contests');
      if (savedContests) {
        const parsed = JSON.parse(savedContests);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      const savedContests = localStorage.getItem('talegig_contests');
      if (savedContests) {
        const parsed = JSON.parse(savedContests);
        if (Array.isArray(parsed)) setContests(parsed);
      }
    } catch (e) {}
  }, [location, activeItem]);
    
  const [gigs, setGigs] = useState([]);
    
  const [favorites, setFavorites] = useState(() => {
    try {
      const savedFavorites = localStorage.getItem('talegig_favorites');
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('talegig_favorites');
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) setFavorites(parsed);
      }
    } catch (e) {}
  }, [location, activeItem]);

  // 🟢 ডাইনামিক আর্নিং এবং ব্যালেন্স ক্যালকুলেশন
  const calculateFinancials = () => {
    let totalEarnings = 0;
    let last30DaysEarnings = 0;
    let currentBalance = 0;

    try {
      const savedOrders = localStorage.getItem('talegig_orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        orders.forEach(ord => {
          if (ord.status === 'complete') {
            const price = Number(ord.price || 0);
            totalEarnings += price;
            last30DaysEarnings += price;
            currentBalance += price;
          }
        });
      }

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('talegig_milestones_')) {
          const milestones = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(milestones)) {
            milestones.forEach(m => {
              const st = (m.status || '').toLowerCase();
              if (st === 'released' || st === 'paid' || st === 'completed') {
                const amt = Number(m.amount || 0);
                totalEarnings += amt;
                last30DaysEarnings += amt;
                currentBalance += amt;
              }
            });
          }
        }
      }

      const savedTransactions = localStorage.getItem('talegig_transactions');
      if (savedTransactions) {
        const transactions = JSON.parse(savedTransactions);
        transactions.forEach(tx => {
          const amt = Number(tx.amount || 0);
          if (tx.type === 'add') {
            currentBalance += amt;
          } else if (tx.type === 'withdraw') {
            currentBalance -= amt;
          }
        });
      }
    } catch (e) {}

    return {
      total: totalEarnings,
      last30: last30DaysEarnings,
      balance: Math.max(0, currentBalance)
    };
  };

  const financials = calculateFinancials();
  
  const profileData = { 
    fullName: user?.name || "Md Saidur Rahman Marjan Abdul Hasib",
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
              <h2 className="text-xl font-bold">Summary</h2>
              <button className="text-2xl cursor-pointer" onClick={() => setShowSummary(false)}>✕</button>
            </div>
            <SummaryContent balance={financials.balance} userName={user?.name || "Srmarjan"} financials={financials} />
          </div>
        </div>
      )}

      <div className="md:hidden flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19]">
        <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-3 font-bold text-base cursor-pointer">
          Dashboard <span className={`transform transition ${showMenu ? 'rotate-180' : ''}`}>▾</span>
        </button>
        <button onClick={() => setShowSummary(!showSummary)} className="text-2xl cursor-pointer">☰</button>
      </div>

      {showMenu && (
        <div className="md:hidden bg-white dark:bg-[#0b0f19] p-4 border-b border-slate-200 dark:border-slate-800 space-y-1">
          {menuItems.map(item => (
            <div 
              key={item} 
              onClick={() => { setActiveItem(item); setShowMenu(false); }} 
              className={`p-2.5 rounded-xl text-sm font-semibold cursor-pointer ${
                activeItem === item ? 'bg-pink-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 flex w-full pt-3 px-2 sm:px-4 md:px-8 max-w-[1600px] mx-auto gap-6 pb-3 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <aside className="hidden md:block w-64 shrink-0 pr-2 h-full overflow-y-auto space-y-1.5 custom-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {menuItems.map((item) => (
            <div 
              key={item} 
              onClick={() => setActiveItem(item)} 
              className={`p-3 rounded-2xl cursor-pointer font-bold text-sm transition-all ${
                activeItem === item 
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item}
            </div>
          ))}
        </aside>

        <main className="flex-1 h-full px-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                      { id: 1, title: 'TaleGig Banner Advertising 1', bg: 'from-emerald-600 to-teal-700', image: '' },
                      { id: 2, title: 'TaleGig Banner Advertising 2', bg: 'from-pink-600 to-purple-700', image: '' },
                      { id: 3, title: 'TaleGig Banner Advertising 3', bg: 'from-blue-600 to-indigo-700', image: '' }
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
                        <div className={`w-full h-full bg-gradient-to-r ${banner.bg || 'from-emerald-600 to-teal-700'} relative flex items-center justify-center overflow-hidden`}>
                          {banner.image ? (
                            <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center px-4">
                              <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white drop-shadow-md">
                                {banner.title || 'TaleGig Banner Advertising'}
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

              <CommunityFeed currentUser={user} userRole="seller" />
            </div>
          )}

          {activeItem === 'All Project' && (
            <div className="h-full pr-1">
              <SellerProjectTable projects={projects} setProjects={setProjects} />
            </div>
          )}
          {activeItem === 'All Contest' && (
            <div className="h-full pr-1">
              <ContestTable contests={contests} />
            </div>
          )}
          {activeItem === 'Proposal' && (
            <div className="h-full pr-1">
              <ProposalTable proposal={proposal} setProposal={setProposal} />
            </div>
          )}
          {activeItem === 'All Gig' && (
            <div className="h-full pr-1">
              <GigTable gigs={gigs} />
            </div>
          )}
          {activeItem === 'Favorites' && (
            <div className="h-full pr-1">
              <FavoritesTable favorites={favorites} />
            </div>
          )}
          {activeItem === 'Inbox' && (
            <div className="w-full h-full overflow-hidden">
              <Inbox location={location} hideNavbar={true} />
            </div>
          )}
          {activeItem === 'Free Credit' && (
            <div className="h-full pr-1">
              <FreeCredit userData={{name: profileData?.fullName || "User", referralCode: profileData?.fullName.toUpperCase().replace(/\s+/g, '') + '13', points: 400, shares: 1239, logins: 12, balance: 120}} />
            </div>
          )}
          {activeItem === 'Membership' && (
            <div className="h-full pr-1">
              <Membership userData={profileData} />
            </div>
          )}

          {activeItem === 'Account Analytics' && (
            <div className="h-full pr-1">
              <AccountAnalytics />
            </div>
          )}
        </main>

        {activeItem === 'Settings' && <Settings />}

        {activeItem !== 'Inbox' && (
          <aside className="hidden lg:block w-80 shrink-0 pl-2 space-y-6 overflow-y-auto h-full scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
             <SummaryContent balance={financials.balance} userName={user?.name || "Srmarjan"} financials={financials} />
          </aside>
        )}
      </div>
    </div>
  );
}; 

const SellerProjectTable = ({ projects, setProjects }) => {
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('talegig_projects');
      const savedProposals = localStorage.getItem('talegig_proposals');
      const savedEntries = localStorage.getItem('talegig_entry');
      const savedGigOrders = localStorage.getItem('talegig_orders');
      
      let proposalsParsed = [];
      if (savedProposals) {
        try { proposalsParsed = JSON.parse(savedProposals); } catch (e) {}
      }

      let projectsParsed = [];
      if (savedProjects) {
        try { projectsParsed = JSON.parse(savedProjects); } catch (e) {}
      }

      let entriesParsed = [];
      if (savedEntries) {
        try { entriesParsed = JSON.parse(savedEntries); } catch (e) {}
      }

      let ordersParsed = [];
      if (savedGigOrders) {
        try { ordersParsed = JSON.parse(savedGigOrders); } catch (e) {}
      }

      const determineWorkType = (item) => {
        const raw = item.workFrom || item.workType || item.type || item.source || '';
        const lower = String(raw).toLowerCase();
        
        if (lower.includes('contest') || item.contestId || item.isContest) return 'Contest';
        if (lower.includes('gig') || item.gigId) return 'Gig';
        if (lower.includes('custom')) return 'Custom';
        if (lower.includes('profile')) return 'Direct';
        return 'Project';
      };

      const checkProjectStatusAndMilestones = (projId, originalObj, proposalsList) => {
        const proposalMatch = proposalsList.find(p => p.id === projId);
        const isEndedExplicitly = localStorage.getItem(`talegig_project_ended_${projId}`) === 'true';

        const isContestItem = originalObj?.workType === 'Contest' || originalObj?.contestId || originalObj?.isContest;
        
        if (isContestItem) {
          const contestPrice = originalObj?.price || originalObj?.budget || proposalMatch?.budget || '$0 USD';
          const paymentState = originalObj?.paymentState || proposalMatch?.paymentState || 'unbilled';
          const isPaid = paymentState === 'paid' || paymentState === 'released' || isEndedExplicitly;

          return {
            isCompleted: isPaid,
            info: {
              line1: isPaid ? '1 Milestone Completed' : 'Unbilled',
              line2: contestPrice
            }
          };
        }

        if (isEndedExplicitly || originalObj?.status === 'complete' || proposalMatch?.isCompleted || proposalMatch?.status === 'complete') {
          let totalCount = 0;
          let totalSum = 0;
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith(`talegig_milestones_${projId}`)) {
                const mData = JSON.parse(localStorage.getItem(key));
                if (Array.isArray(mData) && mData.length > 0) {
                  totalCount = mData.length;
                  totalSum = mData.reduce((sum, m) => sum + Number(m.amount || 0), 0);
                }
              }
            }
          } catch (e) {}

          return { 
            isCompleted: true, 
            info: totalCount > 0 ? {
              line1: `${totalCount} Milestone${totalCount > 1 ? 's' : ''} Completed`,
              line2: `Total: $${totalSum.toLocaleString()} USD`
            } : null 
          };
        }

        let hasAnyMilestone = false;
        let activeCount = 0;
        let allReleased = true;

        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`talegig_milestones_${projId}`)) {
              const mData = JSON.parse(localStorage.getItem(key));
              if (Array.isArray(mData) && mData.length > 0) {
                hasAnyMilestone = true;
                
                const activeMilestones = mData.filter(m => {
                  const st = (m.status || '').toLowerCase();
                  return st === 'in progress' || st === 'active' || st === 'pending';
                });

                activeCount = activeMilestones.length;
                const totalSum = activeMilestones.reduce((sum, m) => sum + Number(m.amount || 0), 0);

                const unreleased = mData.some(m => {
                  const st = (m.status || '').toLowerCase();
                  return st !== 'released' && st !== 'paid' && st !== 'completed';
                });

                if (unreleased) {
                  allReleased = false;
                }

                if (activeCount > 0) {
                  return {
                    isCompleted: false,
                    info: {
                      line1: `${activeCount} Active Milestone${activeCount > 1 ? 's' : ''}`,
                      line2: `$${totalSum.toLocaleString()} USD`
                    }
                  };
                }
              }
            }
          }
        } catch (e) {}

        if (!hasAnyMilestone || !allReleased) {
          return { isCompleted: false, info: null };
        }

        return { isCompleted: true, info: null };
      };

      let combinedProjects = [];

      if (projectsParsed.length > 0) {
        combinedProjects = projectsParsed.map(proj => {
          const correctedWorkType = determineWorkType(proj);
          const milestoneCheck = checkProjectStatusAndMilestones(proj.id, { ...proj, workType: correctedWorkType }, proposalsParsed);
          const finalStatus = milestoneCheck.isCompleted ? 'complete' : 'active';

          return {
            ...proj,
            status: finalStatus,
            activeMilestoneInfo: milestoneCheck.info,
            workType: correctedWorkType
          };
        });
      }

      if (ordersParsed.length > 0) {
        ordersParsed.forEach(ord => {
          const exists = combinedProjects.some(cp => String(cp.id) === String(ord.id));
          const isOrderComplete = ord.status === 'complete';
          
          if (!exists) {
            combinedProjects.push({
              id: ord.id,
              title: ord.title,
              client: `@${ord.client}` || '@saidurbuyer',
              clientId: ord.client || 'buyer-1',
              workType: 'Gig',
              budget: `$${ord.price} USD`,
              paymentState: isOrderComplete ? 'paid' : 'unbilled',
              activeMilestoneInfo: {
                line1: isOrderComplete ? '1 Milestone Completed' : '1 Active Milestone',
                line2: `$${ord.price} USD`
              },
              status: isOrderComplete ? 'complete' : 'active'
            });
          } else {
            const target = combinedProjects.find(cp => String(cp.id) === String(ord.id));
            if (target) {
              target.workType = 'Gig';
              target.status = isOrderComplete ? 'complete' : 'active';
              target.budget = `$${ord.price} USD`;
              target.activeMilestoneInfo = {
                line1: isOrderComplete ? '1 Milestone Completed' : '1 Active Milestone',
                line2: `$${ord.price} USD`
              };
            }
          }
        });
      }

      if (proposalsParsed.length > 0) {
        proposalsParsed.filter(p => p.isAwarded).forEach(p => {
          const exists = combinedProjects.some(cp => String(cp.id) === String(p.id));
          const correctedWorkType = determineWorkType(p);
          const milestoneCheck = checkProjectStatusAndMilestones(p.id, { ...p, workType: correctedWorkType }, proposalsParsed);
          const finalStatus = milestoneCheck.isCompleted ? 'complete' : 'active';

          if (!exists) {
            combinedProjects.push({
              id: p.id,
              title: p.title,
              client: p.client || '@saidurbuyer',
              clientId: p.clientId || 'buyer-1',
              workType: correctedWorkType,
              budget: p.budget || p.myproposal,
              paymentState: p.paymentState || 'unbilled',
              activeMilestoneInfo: milestoneCheck.info,
              status: finalStatus
            });
          } else {
            const target = combinedProjects.find(cp => String(cp.id) === String(p.id));
            if (target) {
              target.workType = correctedWorkType;
              target.status = finalStatus;
              target.budget = p.budget || p.myproposal || target.budget;
              target.paymentState = p.paymentState || target.paymentState;
              target.activeMilestoneInfo = milestoneCheck.info;
            }
          }
        });
      }

      if (entriesParsed.length > 0) {
        entriesParsed.filter(e => e.isAwarded || e.status === 'awarded').forEach(e => {
          const eId = e.contestId || e.id;
          const propMatch = proposalsParsed.find(p => String(p.id) === String(eId));
          const finalPaymentState = e.paymentState || propMatch?.paymentState || 'unbilled';
          const milestoneCheck = checkProjectStatusAndMilestones(eId, { ...e, workType: 'Contest', paymentState: finalPaymentState }, proposalsParsed);
          const finalStatus = milestoneCheck.isCompleted ? 'complete' : 'active';

          const exists = combinedProjects.some(cp => String(cp.id) === String(eId));

          if (!exists) {
            combinedProjects.push({
              id: eId,
              title: e.title || 'Untitled Contest',
              client: e.client || '@saidurbuyer',
              clientId: e.clientId || 'buyer-1',
              workType: 'Contest',
              budget: e.price || e.budget,
              paymentState: finalPaymentState,
              activeMilestoneInfo: milestoneCheck.info,
              status: finalStatus
            });
          } else {
            const target = combinedProjects.find(cp => String(cp.id) === String(eId));
            if (target) {
              target.workType = 'Contest';
              target.status = finalStatus;
              target.budget = e.price || e.budget || target.budget;
              target.paymentState = finalPaymentState;
              target.activeMilestoneInfo = milestoneCheck.info;
            }
          }
        });
      }

      if (combinedProjects.length > 0) {
        setProjects(combinedProjects);
        localStorage.setItem('talegig_projects', JSON.stringify(combinedProjects));
      }
    } catch (e) {}
  }, []);

  const handleEndProject = (projectId) => {
    const updatedProjects = projects.map(p => {
      if (String(p.id) === String(projectId)) {
        let totalCount = 0;
        let totalSum = 0;
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`talegig_milestones_${projectId}`)) {
              const mData = JSON.parse(localStorage.getItem(key));
              if (Array.isArray(mData) && mData.length > 0) {
                totalCount = mData.length;
                totalSum = mData.reduce((sum, m) => sum + Number(m.amount || 0), 0);
              }
            }
          }
        } catch (e) {}

        const isContest = p.workType === 'Contest';

        return { 
          ...p, 
          status: 'complete', 
          activeMilestoneInfo: isContest ? { line1: '1 Milestone Completed', line2: p.budget || '$0 USD' } : (totalCount > 0 ? {
            line1: `${totalCount} Milestone${totalCount > 1 ? 's' : ''} Completed`,
            line2: `Total: $${totalSum.toLocaleString()} USD`
          } : { line1: '1 Milestone Completed', line2: p.budget || '$0 USD' })
        };
      }
      return p;
    });

    setProjects(updatedProjects);

    try {
      localStorage.setItem('talegig_projects', JSON.stringify(updatedProjects));
      localStorage.setItem(`talegig_project_ended_${projectId}`, 'true');

      const savedOrders = localStorage.getItem('talegig_orders');
      if (savedOrders) {
        let ordersParsed = JSON.parse(savedOrders);
        const updatedOrders = ordersParsed.map(ord => {
          if (String(ord.id) === String(projectId)) {
            return { ...ord, status: 'complete' };
          }
          return ord;
        });
        localStorage.setItem('talegig_orders', JSON.stringify(updatedOrders));
      }
    } catch (e) {}
  };

  const filteredProjects = projects.filter(p => p.status === activeTab);

  const getWorkFromLabel = (type) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('contest')) return 'Contest';
    if (t.includes('gig')) return 'Gig';
    if (t.includes('custom')) return 'Custom';
    if (t.includes('profile')) return 'Direct';
    return 'Project';
  };

  return (
    <div className="w-full bg-white dark:bg-[#0b0f19] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white">
      <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-[#16171a] p-1.5 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
        {['active', 'complete'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`px-6 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all capitalize cursor-pointer ${
              activeTab === tab ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="w-full overflow-x-auto sm:overflow-x-visible pb-2">
        <table className="w-full text-left border-collapse min-w-[700px] sm:min-w-full">
          <thead>
            <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider">
              <th className="pb-4 font-extrabold px-3 w-[35%]">Project Title</th>
              <th className="pb-4 font-extrabold px-3 w-[20%]">Client Name</th>
              <th className="pb-4 font-extrabold px-3 w-[15%]">Work From</th>
              <th className="pb-4 font-extrabold px-3 w-[20%]">Milestone</th>
              <th className="pb-4 font-extrabold px-3 w-[10%] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p) => {
                const workLabel = getWorkFromLabel(p.workType);
                const isContest = workLabel === 'Contest';
                
                const workBadgeStyles = {
                  Project: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
                  Contest: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
                  Gig: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                  Custom: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                  Direct: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                };

                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 font-bold px-3">
                      <span 
                        onClick={() => {
                          if (isContest) {
                            navigate(`/contest-details/${p.id}`);
                          } else {
                            navigate(`/project-details/${p.id}`);
                          }
                        }} 
                        className="cursor-pointer text-slate-900 dark:text-white hover:text-pink-600 transition block break-words"
                        title={p.title}
                      >
                        {p.title}
                      </span>
                    </td>

                    <td className="py-4 px-3 font-semibold whitespace-nowrap">
                      <span 
                        onClick={() => navigate(`/buyer-profile/${p.clientId || 'profile'}`)} 
                        className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {p.client || '@saidurbuyer'}
                      </span>
                    </td>

                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-block ${workBadgeStyles[workLabel] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                        {workLabel}
                      </span>
                    </td>

                    <td className="py-4 px-3 whitespace-nowrap">
                      {p.activeMilestoneInfo ? (
                        <div className="flex flex-col">
                          <span className="text-slate-900 dark:text-white font-bold text-xs" title={p.activeMilestoneInfo.line1}>
                            {p.activeMilestoneInfo.line1}
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 font-semibold text-xs" title={p.activeMilestoneInfo.line2}>
                            {p.activeMilestoneInfo.line2}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">
                          {isContest ? (p.budget || 'Unbilled') : 'No active milestone'}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-3 text-right relative whitespace-nowrap">
                      <ActionDropdown project={p} onEndProject={() => handleEndProject(p.id)} navigate={navigate} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400 text-sm font-medium">
                  No {activeTab} projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
      setPosition({ top: rect.bottom + 8, left: rect.right - 150 });
    }
    setIsOpen(!isOpen);
  };

  const isCompleted = project.status === 'complete';
  const workTypeLabel = String(project.workType || '').toLowerCase();
  const isContest = workTypeLabel.includes('contest') || project.contestId || project.isContest;
  const isGig = workTypeLabel.includes('gig');

  return (
    <div className="relative inline-block text-left">
      <button 
        ref={buttonRef}
        onClick={toggleDropdown}
        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ml-auto whitespace-nowrap"
      >
        Action <span className="text-[10px]">▾</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)}></div>
          <div 
            className="fixed z-[9999] w-44 bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden py-1 text-black dark:text-white"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
          >
            <button 
              onClick={() => { 
                setIsOpen(false); 
                if (isContest) {
                  navigate(`/contest-details/${project.id}`);
                } else if (isGig) {
                  localStorage.setItem('talegig_active_order_id', project.id);
                  navigate(`/gig-order/${project.id}`); 
                } else {
                  navigate(`/project-details/${project.id}`); 
                }
              }} 
              className="block w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer transition-colors"
            >
              {isContest ? 'View Contest' : isGig ? 'View Gig Order' : 'View Order'}
            </button>

            {!isContest && !isGig && !isCompleted && (
              <button 
                onClick={() => { setIsOpen(false); navigate(`/project-details/${project.id}?tab=payment`); }} 
                className="block w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer transition-colors"
              >
                Milestone
              </button>
            )}

            <button 
              onClick={() => { 
                setIsOpen(false); 
                navigate('/seller-dashboard', { state: { activeTab: 'Inbox', chatUser: project.client || 'Buyer' } }); 
              }} 
              className="block w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer transition-colors text-pink-600"
            >
              Chat
            </button>
            
            {!isContest && !isGig && project.status === 'active' && (
              <button 
                onClick={() => { 
                  onEndProject(); 
                  setIsOpen(false); 
                  navigate(`/project-details/${project.id}?tab=payment`); 
                }}
                className="block w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold text-red-500 border-t border-slate-100 dark:border-slate-800 cursor-pointer transition-colors"
              >
                End Project
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const ContestTable = ({ contests = [] }) => {
  const [activeTab, setActiveTab] = useState('active');

  const getDeadlineStyle = (deadline) => {
    if (deadline === "Time Over") return "bg-red-500/10 text-red-500 border border-red-500/20";
    return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
  };

  return (
    <div className="w-full bg-white dark:bg-[#0b0f19] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white">
      <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-[#16171a] p-1.5 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
        {['active', 'awarded'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`px-6 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all capitalize cursor-pointer ${
              activeTab === tab ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider">
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
            {contests.filter(c => c.status === activeTab).length > 0 ? (
              contests.filter(c => c.status === activeTab).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 font-bold px-3">{c.title}</td>
                  <td className="py-4 px-3 text-slate-600 dark:text-slate-400 font-medium">
                    {activeTab === 'active' ? c.entries : c.client}
                  </td>
                  <td className="py-4 font-extrabold px-3">{c.price}</td>
                  <td className="py-4 px-3">
                     {activeTab === 'active' ? (
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDeadlineStyle(c.deadline)}`}>
                         {c.deadline}
                       </span>
                     ) : (
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.hasReviewed ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                         {c.hasReviewed ? 'Complete' : 'Give review'}
                       </span>
                     )}
                  </td>
                  <td className="py-4 px-3">
                    <button className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-sm">
                      View Contest
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
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

const ProposalTable = ({ proposal = [], setProposal }) => {
  const [activeTab, setActiveTab] = useState('active'); 
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedProposals = localStorage.getItem('talegig_proposals');
      const savedProjects = localStorage.getItem('talegig_projects');
      
      let projectsParsed = [];
      if (savedProjects) {
        try { projectsParsed = JSON.parse(savedProjects); } catch (e) {}
      }

      if (savedProposals) {
        const parsed = JSON.parse(savedProposals);
        if (Array.isArray(parsed)) {
          const syncedProposals = parsed.map(prop => {
            const matchedProj = projectsParsed.find(pr => pr.id === prop.id);
            const isEndedExplicitly = localStorage.getItem(`talegig_project_ended_${prop.id}`) === 'true';
            
            if (isEndedExplicitly || matchedProj?.status === 'complete' || prop.isCompleted || prop.status === 'complete') {
              return { ...prop, isCompleted: true, status: 'complete' };
            }
            return prop;
          });

          setProposal(syncedProposals);
        }
      }
    } catch (e) {}
  }, []);

  const handleWithdrawProposal = (id) => {
    const updated = proposal.map(p => {
      if (p.id === id) {
        return {
          ...p,
          proposalsData: [],
          myproposal: '',
          bidAmount: '',
          proposedAmount: ''
        };
      }
      return p;
    });

    setProposal(updated);
    try {
      localStorage.setItem('talegig_proposals', JSON.stringify(updated));
    } catch (e) {}
  };

  const userProposals = proposal.filter(b => {
    const hasProposal = (b.proposalsData && b.proposalsData.length > 0 && b.proposalsData[0]?.amount) || b.myproposal;
    return hasProposal;
  });

  const filteredProposals = userProposals.filter(b => {
    if (activeTab === 'active') {
      return !b.isAwarded; 
    } else {
      return b.isAwarded; 
    }
  });

  return (
    <div className="w-full bg-white dark:bg-[#0b0f19] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white">
      <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-[#16171a] p-1.5 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
        {['active', 'awarded'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`px-5 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all capitalize cursor-pointer ${
              activeTab === tab ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab === 'active' ? 'Active' : 'Awarded'}
          </button>
        ))}
      </div>

      <div className="w-full overflow-x-auto pb-2">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider">
              <th className="pb-4 font-extrabold px-3 w-[38%]">Project Name</th>
              <th className="pb-4 font-extrabold px-3 w-[12%] text-center">Total</th>
              <th className="pb-4 font-extrabold px-3 w-[20%]">My Proposal</th>
              <th className="pb-4 font-extrabold px-3 w-[18%]">Status</th>
              <th className="pb-4 font-extrabold px-3 text-right w-[12%]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
            {filteredProposals.length > 0 ? (
              filteredProposals.map((b) => {
                const userAgreedAmount = b.proposalsData?.[0]?.amount || b.myproposal || b.budget;
                
                const isEndedExplicitly = localStorage.getItem(`talegig_project_ended_${b.id}`) === 'true';
                const isCompleted = b.isCompleted || b.status === 'complete' || isEndedExplicitly;

                return (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 font-bold px-3 max-w-[220px] sm:max-w-[280px]">
                      <span 
                        onClick={() => navigate(`/project-details/${b.id}`)} 
                        className="cursor-pointer text-slate-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 transition block break-words"
                      >
                        {b.title}
                      </span>
                    </td>
                    
                    <td className="py-4 px-3 font-semibold text-center">{b.totalProposal || 1}</td>
                    
                    <td className="py-4 px-3 font-extrabold text-pink-600 whitespace-nowrap">
                      {userAgreedAmount}
                    </td>
                    
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        b.isAwarded 
                          ? (isCompleted ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20')
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {b.isAwarded ? (isCompleted ? 'Complete' : 'In Complete') : (b.projectStatus || 'Open')}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-right relative whitespace-nowrap">
                      <ProposalActionDropdown 
                        proposal={b} 
                        onWithdraw={() => handleWithdrawProposal(b.id)} 
                        navigate={navigate} 
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400 text-sm font-medium">
                  No {activeTab === 'active' ? 'active' : 'awarded'} proposals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProposalActionDropdown = ({ proposal, onWithdraw, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, left: rect.right - 140 });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left">
      <button 
        ref={buttonRef}
        onClick={toggleDropdown} 
        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ml-auto whitespace-nowrap"
      >
        Action <span className="text-[10px]">▾</span>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)}></div>
          <div 
            className="fixed z-[9999] w-40 bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden py-1 text-black dark:text-white"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
          >
            {proposal.isAwarded ? (
              <>
                <button 
                  onClick={() => { setIsOpen(false); navigate(`/project-details/${proposal.id}`); }} 
                  className="block w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Preview
                </button>
                <button 
                  onClick={() => { 
                    setIsOpen(false); 
                    navigate('/seller-dashboard', { state: { activeTab: 'Inbox', chatUser: proposal.client || 'Buyer' } }); 
                  }} 
                  className="block w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer text-pink-600"
                >
                  Chat
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { setIsOpen(false); navigate(`/project-details/${proposal.id}`); }} 
                  className="block w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Preview
                </button>
                <button 
                  onClick={() => { setIsOpen(false); navigate(`/edit-proposal/${proposal.id}`); }} 
                  className="block w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button 
                  onClick={() => { onWithdraw(); setIsOpen(false); }} 
                  className="block w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold text-red-500 border-t border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                >
                  Withdraw Proposal
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const GigTable = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Gig list');
  const [gigs, setGigs] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [actionDropdownId, setActionDropdownId] = useState(null);

  useEffect(() => {
    const savedGigs = JSON.parse(localStorage.getItem('talegig_gigs') || '[]');
    setGigs(savedGigs);
    const savedOrders = JSON.parse(localStorage.getItem('talegig_orders') || '[]');
    setOrders(savedOrders);

    const handleOutsideClick = () => {
      setActionDropdownId(null);
      setOpenDropdownId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleDeleteGig = (id, e) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (window.confirm('Are you sure you want to delete this gig?')) {
      const updatedGigs = gigs.filter(gig => gig.id !== id);
      setGigs(updatedGigs);
      localStorage.setItem('talegig_gigs', JSON.stringify(updatedGigs));
    }
  };

  const handleShareGig = (gig, e) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    navigator.clipboard.writeText(`${window.location.origin}/gig/${gig.id}`);
    showToast('Gig link copied to clipboard!','success');
  };

  const handleOpenChat = (clientUsername, e) => {
    e.stopPropagation();
    setActionDropdownId(null);
    navigate(`/messages?user=${clientUsername}`);
  };

  return (
    <div className="w-full bg-white dark:bg-[#0b0f19] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white relative">
      
      <div className="flex gap-2 mb-6 sm:mb-8 bg-slate-100 dark:bg-[#16171a] p-1.5 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
        {['Gig list', 'Gig Order'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`px-5 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all capitalize cursor-pointer ${
              activeTab === tab ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Gig list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {gigs.map((gig) => {
            const currentImg = gig.image || (gig.images && gig.images[0]) || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";
            const startingPrice = gig.price ? gig.price.toString().replace(/[^0-9]/g, '') : '10';
            const viewsCount = gig.views || 0;

            return (
              <div 
                key={gig.id}
                onClick={() => navigate(`/gig/${gig.id}`)}
                className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between hover:border-pink-600 transition cursor-pointer group relative overflow-visible"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-slate-100 dark:bg-[#0b0f19] rounded-t-2xl overflow-visible">
                    <div className="w-full h-full overflow-hidden rounded-t-2xl">
                      <img 
                        src={currentImg} 
                        alt={gig.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                      />
                    </div>

                    <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow pointer-events-none">
                      <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {viewsCount}
                    </div>

                    <div className="absolute top-3 right-3 z-50">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === gig.id ? null : gig.id);
                        }}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-extrabold shadow-md transition cursor-pointer"
                      >
                        Edit
                      </button>

                      {openDropdownId === gig.id && (
                        <div 
                          className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 text-xs text-slate-900 dark:text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button 
                            onClick={() => { setOpenDropdownId(null); navigate(`/gig/${gig.id}`); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer font-bold"
                          >
                            Preview
                          </button>
                          <button 
                            onClick={() => { setOpenDropdownId(null); navigate(`/create-gig?edit=${gig.id}`); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer font-bold"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={(e) => handleShareGig(gig, e)}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer font-bold"
                          >
                            Share
                          </button>
                          <button 
                            onClick={(e) => handleDeleteGig(gig.id, e)}
                            className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-red-500 transition cursor-pointer font-bold border-t border-slate-200 dark:border-slate-800"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                      <img src={gig.sellerImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} alt="Seller" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[11px] leading-tight">
                      <span className="font-extrabold text-slate-900 dark:text-white">{gig.sellerName || "Saidur R."}</span>
                      <span className="text-slate-400 block">@{gig.sellerUsername || "srmarjan"} • <span className="text-emerald-500 font-bold">Online</span></span>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                    I will {gig.title}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-amber-400">★★★★★</span>
                    <span className="text-slate-400 font-bold">({gig.reviewsCount || 8})</span>
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 dark:bg-[#0b0f19]/60 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs rounded-b-2xl">
                  <span className="font-bold text-slate-500">Starting at</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">${startingPrice}</span>
                </div>
              </div>
            );
          })}

          <button 
            onClick={() => navigate('/create-gig')} 
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center min-h-[320px] hover:border-pink-600 transition-all text-slate-400 cursor-pointer group bg-white dark:bg-[#16171a] shadow-sm"
          >
            <span className="text-3xl font-extrabold text-pink-600 bg-pink-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition">+</span>
            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Create new gig</span>
          </button>

        </div>
      )}

      {activeTab === 'Gig Order' && (
        <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-visible">
          <div className="w-full overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0b0f19]/60 text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider">
                  <th className="p-4 font-extrabold">Gig</th>
                  <th className="p-4 font-extrabold">Client</th>
                  <th className="p-4 font-extrabold">Package</th>
                  <th className="p-4 font-extrabold">Status</th>
                  <th className="p-4 font-extrabold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                {(orders || []).length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-400 font-bold">
                      No orders received yet.
                    </td>
                  </tr>
                ) : (
                  (orders || []).map((o) => {
                    const allGigs = JSON.parse(localStorage.getItem('talegig_gigs') || '[]');
                    const relatedGig = allGigs.find(g => g.id.toString() === o.gigId?.toString()) || allGigs[0];
                    const gigImg = relatedGig?.image || (relatedGig?.images && relatedGig?.images[0]) || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";

                    return (
                      <tr key={o.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition relative">
                        
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div 
                              onClick={() => navigate(`/gig/${o.gigId || 1}`)}
                              className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition"
                            >
                              <img src={gigImg} alt="Gig" className="w-full h-full object-cover" />
                            </div>
                            <span 
                              onClick={() => navigate(`/gig/${o.gigId || 1}`)} 
                              className="font-bold text-slate-900 dark:text-white hover:text-pink-600 cursor-pointer whitespace-normal break-words leading-snug max-w-xs"
                            >
                              {o.title}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                          <span 
                            onClick={() => navigate(`/profile/${o.client}`)}
                            className="hover:underline cursor-pointer"
                          >
                            @{o.client}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold uppercase text-slate-800 dark:text-slate-200 text-xs">
                              {o.packageName || 'Basic'}
                            </span>
                            <span className="font-extrabold text-slate-900 dark:text-white text-xs mt-0.5">
                              ${o.price}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            o.status === 'complete' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                            o.status === 'delivered' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          }`}>
                            {o.status || 'Pending'}
                          </span>
                        </td>

                        <td className="p-4 relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionDropdownId(actionDropdownId === o.id ? null : o.id);
                            }}
                            className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-sm inline-flex items-center gap-1.5 whitespace-nowrap"
                          >
                            Action <span className="text-[10px]">▼</span>
                          </button>

                          {actionDropdownId === o.id && (
                            <div 
                              className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 z-50 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                onClick={() => { 
                                  setActionDropdownId(null); 
                                  localStorage.setItem('talegig_active_order_id', o.id);
                                  navigate(`/gig-order/${o.id}`); 
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer font-bold text-slate-900 dark:text-white"
                              >
                                View Order
                              </button>
                              <button 
                                onClick={(e) => handleOpenChat(o.client, e)}
                                className="w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer font-bold text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800"
                              >
                                Chat
                              </button>
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

const FavoritesTable = ({ favorites }) => {
  const subTabs = ['Client', 'Gig'];
  const [activeSubTab, setActiveSubTab] = useState(subTabs[0]);

  return (
    <div className="w-full bg-white dark:bg-[#0b0f19] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white">
      <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-[#16171a] p-1.5 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
        {subTabs.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveSubTab(tab)} 
            className={`px-6 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all capitalize cursor-pointer ${
              activeSubTab === tab 
                ? 'bg-pink-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="w-full overflow-x-auto pb-4 space-y-4">
        {favorites.filter(f => f.type === activeSubTab.toLowerCase()).length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm font-medium">
            You haven't added any favorite {activeSubTab.toLowerCase()}s yet.
          </div>
        ) : (
          favorites.filter(f => f.type === activeSubTab.toLowerCase()).map((item) => (
            <div 
              key={item.id} 
              className="bg-slate-50 dark:bg-[#16171a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start gap-6 transition-all w-full min-w-[700px] md:min-w-0"
            >
              <img src={item.image} className="w-28 h-28 rounded-2xl object-cover flex-shrink-0 border border-slate-300 dark:border-slate-700 shadow-sm" alt="" />

              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{item.name}</h3>
                  <span className="text-xs font-semibold text-slate-500">@{item.username}</span>
                  <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">● online</span>
                </div>
                
                <h4 className="text-slate-800 dark:text-slate-200 font-bold text-sm sm:text-base">{item.tagline}</h4>
                
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  <span>⭐ {item.rating}</span>
                  <span>💬 {item.reviews} reviews</span>
                  <span>☑ {item.completedProjects}% Complete</span>
                  <span>📍 {item.location}</span>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-1 mt-0.5">
                  {item.bio}
                </p>

                <div className="flex flex-wrap gap-2 mt-1">
                  {item.skills.map((skill, index) => (
                    <span key={index} className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 w-full md:w-36 pt-4 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800">
                <div className="text-left md:text-right">
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">${item.price}</p>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase">Per hour</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xl hover:scale-110 transition-transform cursor-pointer p-1">❤️</button>
                  <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shadow-md cursor-pointer">
                    Contact
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
    <div className="p-6 bg-white dark:bg-[#0b0f19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all text-slate-900 dark:text-white">
      <h2 className="text-2xl font-extrabold mb-1">Hello, {firstName}</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Your Referral code is <span className="text-pink-600 font-bold">{generatedCode}</span></p>

      <div className="bg-pink-500/15 border border-pink-500/20 p-4 rounded-2xl mb-6">
        <h4 className="font-extrabold text-pink-600 dark:text-pink-400 text-sm">Invite & Earn Together!</h4>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
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
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-sm shadow-2xl text-slate-900 dark:text-white space-y-4">
        <h3 className="text-lg font-extrabold">Select Payment Method</h3>
        <div className="space-y-2">
          {methods.map(m => (
            <button key={m} className="w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition font-bold text-sm cursor-pointer">
              {m}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer text-xs sm:text-sm">
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
    { name: "Free", price: 0, features: ["10 Proposal", "Custom Cover Photo","Daily Withdraw Requests", "10 Skills","2 Gig Upload"] },
    { name: "Basic", price: 4.99, features: ["30 Proposal", "Custom Cover Photo", "Fast Withdraw (48h)", "15 Skills", "4 Gig Upload", "Preferred Freelancer"] },
    { name: "Standard", price: 9.99, features: ["50 Proposal", "Custom Cover Photo", "Fast Withdraw (24h)", "20 Skills", "6 Gig Upload", "Preferred Freelancer", "1 Gig Promote"] },
    { name: "Premium", price: 19.99, features: ["100 Proposal", "Custom Cover Photo", "Fast Withdraw (12h)", "40 Skills", "10 Gig Upload", "Preferred Freelancer", "2 Gig Promote","Verified Freelancer"] }
  ];

  return (
    <div className="p-2 text-slate-900 dark:text-white">
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 p-1.5 rounded-full flex shadow-sm">
          <button onClick={() => setIsYearly(false)} className={`px-6 py-2.5 rounded-full font-extrabold text-xs sm:text-sm cursor-pointer transition ${!isYearly ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500'}`}>Monthly</button>
          <button onClick={() => setIsYearly(true)} className={`px-6 py-2.5 rounded-full font-extrabold text-xs sm:text-sm cursor-pointer transition ${isYearly ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500'}`}>Yearly (Save 20%)</button>
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
              <h2 className="text-3xl sm:text-4xl font-black">
                ${isYearly ? (plan.price * 10 * 12 / 10).toFixed(2) : plan.price.toFixed(2)}
              </h2>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-extrabold mt-1">Per {isYearly ? 'Year' : 'Month'}</p>
            </div>

            <ul className="text-xs sm:text-sm space-y-3 px-6 mb-8 text-slate-600 dark:text-slate-300 font-medium flex-grow">
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
    <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl text-slate-900 dark:text-white space-y-4">
      <h2 className="text-xl font-extrabold">Pay for {plan.name} Plan</h2>
      <div className="space-y-2.5">
        {['Credit / Debit Card', 'Visa / Mastercard', 'Bkash / Nagad'].map(m => (
          <button key={m} className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer text-left">
            {m}
          </button>
        ))}
      </div>
      <button onClick={onClose} className="mt-4 w-full py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-extrabold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer">Cancel</button>
    </div>
  </div>
);

const SummaryContent = ({ balance, userName, financials }) => {
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);

  return (
    <aside className="w-full space-y-4">
        <h2 className="text-2xl font-extrabold">Hello, {userName ? userName.split(' ')[0] : 'User'}</h2>
        
        <div className="bg-white dark:bg-[#0b0f19] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Membership</span>
            <span className="text-pink-600 dark:text-pink-400 font-extrabold">Free trial</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">Today 12 Proposal available</p>
          <button className="w-full bg-pink-600 hover:bg-pink-700 transition-all py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-md cursor-pointer text-white">Upgrade</button>
        </div>

        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Balance</span>
            {/* 🟢 "Add funds +" বাটনে ক্লিক করলে Checkout মডাল ওপেন হবে */}
            <span 
              onClick={() => setShowAddFundsModal(true)}
              className="text-emerald-500 font-extrabold cursor-pointer hover:underline"
            >
              Add funds +
            </span>
          </div>
          <div className="text-right font-mono text-2xl font-black text-pink-600 dark:text-pink-400">
            ${balance ? balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
          </div>
        </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-pink-600 dark:text-pink-400 font-black text-base sm:text-lg">
            ${financials?.total ? financials.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
          </p>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">Total earnings since joining</p>
        </div>
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-pink-600 dark:text-pink-400 font-black text-base sm:text-lg">
            ${financials?.last30 ? financials.last30.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
          </p>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">Earnings from past 30 days</p>
        </div>
      </div>

      <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer">
        Share & Earn
      </button>
      
      <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer">
        Earn 10$ refer a Client
      </button>

      {/* 💳 চেকআউট মডাল ইন্টিগ্রেশন */}
      <Checkout 
        isOpen={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
        initialAmount={50}
        userRole="buyer"
        onPaymentSuccess={() => {
          window.location.reload(); // পেমেন্ট সফল হলে পেজ রিলোড হয়ে ব্যালেন্স আপডেট হয়ে যাবে
        }}
      />
    </aside>
  );
};

export default SellerDashboard;