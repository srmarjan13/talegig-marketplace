import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PrivateNavbar from './PrivateNavbar';
import { useToast } from '../Home/ToastContext'; // 🟢 টোস্ট ইমপোর্ট করা হলো

const AllContests = () => {
  const navigate = useNavigate();
  const { showToast } = useToast(); // 🟢 টোস্ট হুক ইনিশিয়ালাইজ করা হলো

  // সময় ক্যালকুলেট করার লাইভ ফাংশন (Time Ago)
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const [contests, setContests] = useState([]);

  // 🟢 লোকালস্টোরেজ বাদ দিয়ে সরাসরি ব্যাকএন্ড থেকে কন্টেস্ট ফেচ করার লজিক
  const fetchContestsFromBackend = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/projects');
      if (response.ok) {
        const data = await response.json();
        
        const contestItems = data.filter(item => 
          item.type === 'contest' || 
          item.type === 'Contest' || 
          (item.category && item.category.toLowerCase().includes('contest'))
        );

        const formattedContests = contestItems.map(item => {
          const rawBudget = item.budget || '50';
          const extractedNum = parseFloat(String(rawBudget).replace(/[^0-9.]/g, '')) || 50;

          return {
            id: item.id || Date.now(),
            title: item.title || 'Untitled Contest',
            description: item.description || 'No description provided.',
            category: item.category || 'logo design',
            type: item.type || 'Contest',
            budgetNum: extractedNum,
            budget: typeof rawBudget === 'string' && rawBudget.includes('$') ? rawBudget : `$${rawBudget} USD`,
            entriesCount: item.entriesCount || 0,
            timeLeft: item.deadline ? `${item.deadline} left` : '3 days left',
            client: item.authorName ? `@${item.authorName.toLowerCase().replace(/\s+/g, '')}` : '@saidurbuyer',
            rating: 5,
            commentsCount: 0,
            timestamp: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
            time: getTimeAgo(item.createdAt ? new Date(item.createdAt).getTime() : Date.now()),
            badges: item.badges && item.badges.length > 0 ? item.badges : ['FEATURED', 'CONTEST'],
            skills: item.skills && item.skills.length > 0 ? item.skills : ['Logo Design', 'Branding'],
          };
        });

        setContests(formattedContests);
        showToast('Contests loaded successfully from database!', 'success'); // 🟢 টোস্ট মেসেজ
      } else {
        showToast('Failed to load contests from server.', 'error');
      }
    } catch (error) {
      console.error("Error fetching contests from backend:", error);
      showToast('Server connection error!', 'error');
    }
  };

  useEffect(() => {
    fetchContestsFromBackend();
  }, []);

  // লাইভ টাইম কাউন্ট আপডেট করার জন্য
  useEffect(() => {
    const interval = setInterval(() => {
      setContests(prev => prev.map(c => ({
        ...c,
        time: getTimeAgo(c.timestamp)
      })));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // ফিল্টার ও সর্ট স্টেটসমূহ
  const [categorySearch, setCategorySearch] = useState('');
  const [fixedRanges, setFixedRanges] = useState({
    under20: false,
    under100: false,
    under1k: false,
    under5k: false,
    over5k: false,
  });
  const [minMaxBudget, setMinMaxBudget] = useState({ min: '', max: '' });
  
  const [sortBy, setSortBy] = useState('Newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearCategories = () => {
    setCategorySearch('');
    showToast('Category filter cleared', 'info');
  };

  const clearProjectTypes = () => {
    setFixedRanges({ under20: false, under100: false, under1k: false, under5k: false, over5k: false });
    setMinMaxBudget({ min: '', max: '' });
    showToast('Budget filters cleared', 'info');
  };

  const filteredAndSortedContests = useMemo(() => {
    let result = [...contests];

    if (categorySearch.trim() !== '') {
      const query = categorySearch.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.category.toLowerCase().includes(query) ||
        c.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    const isAnyFixedRangeChecked = Object.values(fixedRanges).some(val => val);
    if (isAnyFixedRangeChecked || minMaxBudget.min !== '' || minMaxBudget.max !== '') {
      result = result.filter(c => {
        let matchesRange = false;

        if (fixedRanges.under20 && c.budgetNum < 20) matchesRange = true;
        if (fixedRanges.under100 && c.budgetNum < 100) matchesRange = true;
        if (fixedRanges.under1k && c.budgetNum < 1000) matchesRange = true;
        if (fixedRanges.under5k && c.budgetNum < 5000) matchesRange = true;
        if (fixedRanges.over5k && c.budgetNum >= 5000) matchesRange = true;

        if (!isAnyFixedRangeChecked) matchesRange = true;

        let matchesCustom = true;
        if (minMaxBudget.min !== '' && c.budgetNum < Number(minMaxBudget.min)) matchesCustom = false;
        if (minMaxBudget.max !== '' && c.budgetNum > Number(minMaxBudget.max)) matchesCustom = false;

        return matchesRange && matchesCustom;
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'Newest') return b.timestamp - a.timestamp;
      if (sortBy === 'Oldest') return a.timestamp - b.timestamp;
      if (sortBy === 'Lowest Price') return a.budgetNum - b.budgetNum;
      if (sortBy === 'Highest Price') return b.budgetNum - a.budgetNum;
      if (sortBy === 'Fewest Entries') return a.entriesCount - b.entriesCount;
      if (sortBy === 'Most Entries') return b.entriesCount - a.entriesCount;
      return 0;
    });

    return result;
  }, [contests, categorySearch, fixedRanges, minMaxBudget, sortBy]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050b1a] text-slate-900 dark:text-white transition-colors duration-300">
      <PrivateNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Top results</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
              Showing {filteredAndSortedContests.length} of {contests.length} results
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button 
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)} 
              className="lg:hidden bg-pink-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2"
            >
              <span>🔍</span> {mobileFilterOpen ? 'Hide Filter' : 'Filter'}
            </button>

            <div className="relative" ref={sortDropdownRef}>
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="bg-white dark:bg-[#111622] text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-4 w-48 shadow-sm cursor-pointer"
              >
                <span>Sort by: {sortBy}</span>
                <span>▼</span>
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 py-2">
                  {['Newest', 'Oldest', 'Lowest Price', 'Highest Price', 'Fewest Entries', 'Most Entries'].map((option) => (
                    <button
                      key={option}
                      onClick={() => { setSortBy(option); setIsSortOpen(false); showToast(`Sorted by ${option}`, 'info'); }}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className={`lg:col-span-4 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Category</h3>
                <button onClick={clearCategories} className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Clear</button>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search Categories or Skills"
                  className="w-full bg-slate-100 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500"
                />
                <span className="absolute right-3.5 top-3 text-xs text-slate-400">🔍</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Contest type</h3>
                <button onClick={clearProjectTypes} className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Clear</button>
              </div>

              <div className="space-y-3 pt-1">
                <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm text-slate-700 dark:text-gray-200 font-medium">
                  <input 
                    type="checkbox" 
                    defaultChecked
                    className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                  />
                  Fixed
                </label>
                
                <div className="space-y-2.5 pl-7 text-xs text-slate-600 dark:text-gray-300">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={fixedRanges.under20}
                      onChange={(e) => setFixedRanges({...fixedRanges, under20: e.target.checked})}
                      className="w-3.5 h-3.5 accent-pink-600 rounded cursor-pointer" 
                    /> Less than $20
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={fixedRanges.under100}
                      onChange={(e) => setFixedRanges({...fixedRanges, under100: e.target.checked})}
                      className="w-3.5 h-3.5 accent-pink-600 rounded cursor-pointer" 
                    /> Less than $100
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={fixedRanges.under1k}
                      onChange={(e) => setFixedRanges({...fixedRanges, under1k: e.target.checked})}
                      className="w-3.5 h-3.5 accent-pink-600 rounded cursor-pointer" 
                    /> Less than $1K
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={fixedRanges.under5k}
                      onChange={(e) => setFixedRanges({...fixedRanges, under5k: e.target.checked})}
                      className="w-3.5 h-3.5 accent-pink-600 rounded cursor-pointer" 
                    /> Less than $5K
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={fixedRanges.over5k}
                      onChange={(e) => setFixedRanges({...fixedRanges, over5k: e.target.checked})}
                      className="w-3.5 h-3.5 accent-pink-600 rounded cursor-pointer" 
                    /> $5K+
                  </label>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="number" 
                      placeholder="$ Min" 
                      value={minMaxBudget.min}
                      onChange={(e) => setMinMaxBudget({...minMaxBudget, min: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-lg text-xs text-center placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none" 
                    />
                    <input 
                      type="number" 
                      placeholder="$ Max" 
                      value={minMaxBudget.max}
                      onChange={(e) => setMinMaxBudget({...minMaxBudget, max: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-lg text-xs text-center placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none" 
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>

          <div className="lg:col-span-8 space-y-6">
            {filteredAndSortedContests.length > 0 ? (
              filteredAndSortedContests.map((contest) => (
                <div 
                  key={contest.id}
                  className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <h2 
                        onClick={() => navigate(`/contest-details/${contest.id}`, { state: { contest } })}
                        className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                      >
                        {contest.title}
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {contest.badges && contest.badges.map((badge, idx) => {
                          const bLower = badge.toLowerCase();
                          let badgeBgColor = 'bg-pink-600';
                          if (bLower.includes('featured')) badgeBgColor = 'bg-amber-600';
                          else if (bLower.includes('guranteed') || bLower.includes('guaranteed')) badgeBgColor = 'bg-green-600';
                          else if (bLower.includes('urgent')) badgeBgColor = 'bg-red-600';
                          else if (bLower.includes('nda')) badgeBgColor = 'bg-blue-600';
                          else if (bLower.includes('recruiter')) badgeBgColor = 'bg-purple-600';
                          else if (bLower.includes('sealed')) badgeBgColor = 'bg-sky-500';

                          return (
                            <span 
                              key={idx} 
                              className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded text-white ${badgeBgColor}`}
                            >
                              {badge}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto text-left sm:text-right shrink-0 flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <p className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{contest.budget}</p>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0.5">
                        <p className="text-xs text-pink-500 font-bold">🎯 {contest.entriesCount} Entries</p>
                        <p className="text-[11px] text-slate-400">⏳ {contest.timeLeft}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {contest.description.slice(0, 220)}... <span onClick={() => navigate(`/contest-details/${contest.id}`, { state: { contest } })} className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">View All</span>
                  </p>

                  {contest.skills && contest.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {contest.skills.map((skill, index) => (
                        <span key={index} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs px-3 py-1 rounded-full font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex text-amber-500 text-sm">
                        {'⭐'.repeat(Math.floor(contest.rating || 5))}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{contest.rating || 5}</span>
                      <span className="flex items-center gap-1">💬 {contest.commentsCount || 0}</span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                      <span className="text-slate-400 dark:text-slate-500">{contest.time}</span>
                      <button 
                        onClick={() => navigate(`/contest-details/${contest.id}`, { state: { contest } })}
                        className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
                      >
                        View Contest & Submit
                      </button>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-10 rounded-2xl text-center space-y-3">
                <p className="text-lg font-bold text-slate-700 dark:text-gray-300">No contests found</p>
                <p className="text-xs text-slate-500">Post a new contest to see it appear here instantly!</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AllContests;