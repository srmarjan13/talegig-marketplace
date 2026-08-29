import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PrivateNavbar from './PrivateNavbar';
import { useToast } from '../Home/ToastContext';

const AllProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // সময় ক্যালকুলেট করার লাইভ ফাংশন (Time Ago)
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const timeValue = new Date(timestamp).getTime();
    if (isNaN(timeValue)) return 'Just now';
    
    const seconds = Math.floor((Date.now() - timeValue) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

const [projects, setProjects] = useState([]);

  // 🟢 প্রজেক্ট ফেচ করার ফাংশনটি আলাদা করা হলো যাতে যেকোনো সময় কল করা যায়
  const fetchBackendProjects = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/projects');
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        const formatted = data.map(item => {
          let parsedBadges = ['VERIFIED'];
          let parsedSkills = ['Web Development'];
          let displayBudget = `$${item.budget || 50} USD`;

          try {
            if (item.category && item.category.startsWith('{')) {
              const parsedObj = JSON.parse(item.category);
              parsedBadges = parsedObj.badges || ['VERIFIED'];
              parsedSkills = parsedObj.skills || ['Web Development'];
              displayBudget = parsedObj.budgetFormatted || `$${item.budget} USD`;
            }
          } catch (e) {
            if (item.category) {
              parsedSkills = item.category.split(',').map(s => s.trim());
            }
          }

          return {
            id: item.id,
            title: item.title || 'Untitled Project',
            description: item.description || 'No description provided.',
            category: item.category || 'General',
            type: item.type || 'project',
            budgetNum: Number(item.budget) || 50,
            budget: displayBudget,
            proposal: item.proposal || 0,
            rating: item.rating || 5,
            commentsCount: item.commentsCount || 0,
            timestamp: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
            time: getTimeAgo(item.createdAt),
            badges: parsedBadges,
            skills: parsedSkills,
          };
        });

        const onlyProjects = formatted.filter(p => p.type.toLowerCase() === 'project' || !p.type);
        setProjects(onlyProjects);
      }
    } catch (err) {
      console.error("Backend fetch error:", err);
    }
  };

  // 🟢 পেজ লোড হলে এবং লোকেশন চেঞ্জ হলে (প্রজেক্ট পোস্ট করে আসলে) অটোমেটিক ডেটা ফেচ হবে
  useEffect(() => {
    fetchBackendProjects();
  }, [location]);

  // লাইভ টাইম কাউন্ট আপডেট করার জন্য
  useEffect(() => {
    const interval = setInterval(() => {
      setProjects(prev => prev.map(p => ({
        ...p,
        time: getTimeAgo(p.timestamp)
      })));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // ফিল্টার ও সর্ট স্টেটসমূহ
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState({ hourly: false, fixed: false });
  const [fixedRanges, setFixedRanges] = useState({ under20: false, under100: false, under1k: false, under5k: false, over5k: false });
  const [minMaxBudget, setMinMaxBudget] = useState({ min: '', max: '' });
  const [hourlyMinMax, setHourlyMinMax] = useState({ min: '', max: '' });
  
  const [sortBy, setSortBy] = useState('Newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // ফিল্টার রিসেট ফাংশন (Toast সহ)
  const clearCategories = () => {
    setCategorySearch('');
    showToast('Category filter cleared', 'info');
  };

  const clearProjectTypes = () => {
    setSelectedTypes({ hourly: false, fixed: false });
    setFixedRanges({ under20: false, under100: false, under1k: false, under5k: false, over5k: false });
    setMinMaxBudget({ min: '', max: '' });
    setHourlyMinMax({ min: '', max: '' });
    showToast('Project filters cleared', 'info');
  };

  // ডাইনামিক ফিল্টারিং এবং সর্টিং লজিক
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    if (categorySearch.trim() !== '') {
      const query = categorySearch.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        p.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    if (selectedTypes.hourly || selectedTypes.fixed) {
      result = result.filter(p => {
        if (selectedTypes.hourly && String(p.type).toLowerCase() === 'hourly') return true;
        if (selectedTypes.fixed && String(p.type).toLowerCase() === 'fixed') return true;
        return false;
      });
    }

    const isAnyFixedRangeChecked = Object.values(fixedRanges).some(val => val);
    if (isAnyFixedRangeChecked || minMaxBudget.min !== '' || minMaxBudget.max !== '') {
      result = result.filter(p => {
        let matchesRange = false;

        if (fixedRanges.under20 && p.budgetNum < 20) matchesRange = true;
        if (fixedRanges.under100 && p.budgetNum < 100) matchesRange = true;
        if (fixedRanges.under1k && p.budgetNum < 1000) matchesRange = true;
        if (fixedRanges.under5k && p.budgetNum < 5000) matchesRange = true;
        if (fixedRanges.over5k && p.budgetNum >= 5000) matchesRange = true;

        if (!isAnyFixedRangeChecked) matchesRange = true;

        let matchesCustom = true;
        if (minMaxBudget.min !== '' && p.budgetNum < Number(minMaxBudget.min)) matchesCustom = false;
        if (minMaxBudget.max !== '' && p.budgetNum > Number(minMaxBudget.max)) matchesCustom = false;

        return matchesRange && matchesCustom;
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'Newest') return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortBy === 'Oldest') return new Date(a.timestamp) - new Date(b.timestamp);
      if (sortBy === 'Lowest Price') return a.budgetNum - b.budgetNum;
      if (sortBy === 'Highest Price') return b.budgetNum - a.budgetNum;
      if (sortBy === 'Fewest Proposal') return (a.proposal || 0) - (b.proposal || 0);
      if (sortBy === 'Most Proposal') return (b.proposal || 0) - (a.proposal || 0);
      return 0;
    });

    return result;
  }, [projects, categorySearch, selectedTypes, fixedRanges, minMaxBudget, sortBy]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050b1a] text-slate-900 dark:text-white transition-colors duration-300">
      <PrivateNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Top results</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
              Showing {filteredAndSortedProjects.length} of {projects.length} results
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button 
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)} 
              className="lg:hidden bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Filters ☰
            </button>

            {/* সর্ট বাই ড্রপডাউন */}
            <div className="relative">
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="bg-white dark:bg-[#111622] text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-3 min-w-[200px] w-auto shadow-sm dark:shadow-lg cursor-pointer"
              >
                <span className="truncate">Sort by: {sortBy}</span>
                <span className="shrink-0">▼</span>
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 py-2">
                  {['Newest', 'Oldest', 'Lowest Price', 'Highest Price', 'Fewest Proposal', 'Most Proposal'].map((option) => (
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
          
          {/* বাম পাশ: ফিল্টার সাইডবার */}
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
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Project type</h3>
                <button onClick={clearProjectTypes} className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Clear</button>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm text-slate-700 dark:text-gray-200 font-medium">
                  <input 
                    type="checkbox" 
                    checked={selectedTypes.hourly}
                    onChange={(e) => setSelectedTypes({...selectedTypes, hourly: e.target.checked})}
                    className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                  />
                  Hourly
                </label>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm text-slate-700 dark:text-gray-200 font-medium">
                  <input 
                    type="checkbox" 
                    checked={selectedTypes.fixed}
                    onChange={(e) => setSelectedTypes({...selectedTypes, fixed: e.target.checked})}
                    className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                  />
                  Fixed
                </label>
                
                <div className="space-y-2.5 pl-7 text-xs text-slate-600 dark:text-gray-300">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={fixedRanges.under20} onChange={(e) => setFixedRanges({...fixedRanges, under20: e.target.checked})} className="w-3.5 h-3.5 accent-pink-600 rounded cursor-pointer" /> Less than $20
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={fixedRanges.under100} onChange={(e) => setFixedRanges({...fixedRanges, under100: e.target.checked})} className="w-3.5 h-3.5 accent-pink-600 rounded cursor-pointer" /> Less than $100
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={fixedRanges.under1k} onChange={(e) => setFixedRanges({...fixedRanges, under1k: e.target.checked})} className="w-3.5 h-3.5 accent-pink-600 rounded cursor-pointer" /> Less than $1K
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={fixedRanges.under5k} onChange={(e) => setFixedRanges({...fixedRanges, under5k: e.target.checked})} className="w-3.5 h-3.5 accent-pink-600 rounded cursor-pointer" /> Less than $5K
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={fixedRanges.over5k} onChange={(e) => setFixedRanges({...fixedRanges, over5k: e.target.checked})} className="w-3.5 h-3.5 accent-pink-600 rounded cursor-pointer" /> $5K+
                  </label>
                </div>
              </div>

            </div>

          </div>

          {/* ডান পাশ: প্রজেক্ট কার্ড লিস্ট */}
          <div className="lg:col-span-8 space-y-6">
            {filteredAndSortedProjects.length > 0 ? (
              filteredAndSortedProjects.map((project) => (
                <div 
                  key={project.id}
                  className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <h2 
                        onClick={() => navigate(`/project-details/${project.id}`, { state: { project } })}
                        className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                      >
                        {project.title}
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {project.badges && project.badges.map((badge, idx) => {
                          const bLower = String(badge).toLowerCase();
                          let badgeBgColor = 'bg-pink-600';
                          if (bLower.includes('featured')) badgeBgColor = 'bg-amber-600';
                          else if (bLower.includes('guranteed') || bLower.includes('guaranteed')) badgeBgColor = 'bg-green-600';
                          else if (bLower.includes('urgent')) badgeBgColor = 'bg-red-600';
                          else if (bLower.includes('nda')) badgeBgColor = 'bg-blue-600';
                          else if (bLower.includes('recruiter')) badgeBgColor = 'bg-purple-600';
                          else if (bLower.includes('sealed')) badgeBgColor = 'bg-sky-500';
                          else if (bLower.includes('ip agreement')) badgeBgColor = 'bg-pink-700';

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
                      {project.proposal !== undefined && (
                        <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {project.proposal} Proposal
                        </p>
                      )}
                      <p className="text-xs sm:text-sm font-extrabold text-emerald-500 dark:text-emerald-400 mt-0.5">{project.budget}</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {project.description.slice(0, 220)}... <span onClick={() => navigate(`/project-details/${project.id}`, { state: { project } })} className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">View All</span>
                  </p>

                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {project.skills.map((skill, index) => (
                        <span key={index} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs px-3 py-1 rounded-full font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-slate-100 dark:border-slate-800 gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <div className="flex text-amber-500 text-sm">
                        {'⭐'.repeat(Math.floor(project.rating || 5))}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{project.rating || 5}</span>
                      <span className="flex items-center gap-1">💬 {project.commentsCount || 0}</span>
                      <span className="text-slate-400">| ID: #{project.id}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 dark:text-slate-500">{project.time}</span>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-10 rounded-2xl text-center space-y-3">
                <p className="text-lg font-bold text-slate-700 dark:text-gray-300">No projects found</p>
                <p className="text-xs text-slate-500">Post a new project to see it appear here instantly!</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AllProject;