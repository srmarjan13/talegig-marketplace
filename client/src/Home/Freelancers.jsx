import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PrivateNavbar from './PrivateNavbar';
import PublicNavbar from './PublicNavbar';

const Freelancers = () => {
  const navigate = useNavigate();

  const [freelancers, setFreelancers] = useState(() => {
    try {
      const savedUsers = localStorage.getItem('talegig_users');
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u, index) => ({
            id: u.id || index + 1,
            name: u.name || 'Saidur Rahman',
            username: u.username || 'srmarjan',
            tagline: u.tagline || 'Experience and Skill are Results You’ll Love',
            image: u.avatar || u.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            rating: u.rating || 5,
            reviews: u.reviews || 34,
            completedProjects: u.completedProjects || 80,
            location: u.location || 'United Kingdom',
            bio: u.bio || 'TaleGig – Elevate Your Digital Presence with Expert Solutions.',
            skills: u.skills || ['Logo Designer', 'Banner Design', 'Web Design', 'React JS', 'Tailwind CSS'],
            hourlyRate: u.hourlyRate || 15,
            isOnline: true,
            timestamp: u.timestamp || Date.now()
          }));
        }
      }
    } catch (e) {}

    return [
      {
        id: 1,
        name: 'Saidur Rahman',
        username: 'srmarjan',
        tagline: 'Experience and Skill are Results You’ll Love',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        rating: 5,
        reviews: 34,
        completedProjects: 80,
        location: 'United Kingdom',
        bio: 'TaleGig – Elevate Your Digital Presence with Expert Solutions. Welcome to TaleGig, where creativity meets technology to deliver outstanding digital solutions!',
        skills: ['Logo Designer', 'Banner design', 'Web design', 'React', 'Tailwind'],
        hourlyRate: 15,
        isOnline: true,
        timestamp: Date.now() - 3600000
      },
      {
        id: 2,
        name: 'Labiba Tarannum',
        username: 'labiba',
        tagline: 'Professional UI/UX Designer & Frontend Expert',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        rating: 4.8,
        reviews: 28,
        completedProjects: 92,
        location: 'United Arab Emirates',
        bio: 'Creating intuitive user interfaces and seamless web experiences using React and Tailwind CSS for modern digital storefronts.',
        skills: ['Figma', 'React', 'UI/UX', 'NodeJS'],
        hourlyRate: 20,
        isOnline: true,
        timestamp: Date.now() - 7200000
      }
    ];
  });

  const getCountryCode = (locationStr) => {
    if (!locationStr) return 'gb';
    const lower = locationStr.toLowerCase();
    if (lower.includes('united kingdom') || lower.includes('uk') || lower.includes('angless')) return 'gb';
    if (lower.includes('united arab emirates') || lower.includes('uae') || lower.includes('dubai')) return 'ae';
    if (lower.includes('bangladesh') || lower.includes('bd')) return 'bd';
    if (lower.includes('united states') || lower.includes('usa')) return 'us';
    if (lower.includes('canada')) return 'ca';
    if (lower.includes('australia')) return 'au';
    if (lower.includes('india')) return 'in';
    return 'gb';
  };

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('talegig_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleFavorite = (freelancer, e) => {
    e.stopPropagation();
    const isAlreadyFav = favorites.some(f => f.username === freelancer.username);
    let updated;
    if (isAlreadyFav) {
      updated = favorites.filter(f => f.username !== freelancer.username);
    } else {
      const favItem = {
        id: freelancer.id,
        type: 'client',
        image: freelancer.image,
        name: freelancer.name,
        username: freelancer.username,
        tagline: freelancer.tagline,
        rating: freelancer.rating,
        reviews: freelancer.reviews,
        completedProjects: freelancer.completedProjects,
        location: freelancer.location,
        bio: freelancer.bio,
        skills: freelancer.skills,
        price: freelancer.hourlyRate
      };
      updated = [...favorites, favItem];
    }
    setFavorites(updated);
    try {
      localStorage.setItem('talegig_favorites', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleContactChat = (freelancer) => {
    try {
      const existingChats = JSON.parse(localStorage.getItem('talegig_chats') || '[]');
      const chatExists = existingChats.some(c => c.username === freelancer.username);
      if (!chatExists) {
        const newChat = {
          id: Date.now(),
          name: freelancer.name,
          username: freelancer.username,
          avatar: freelancer.image,
          lastMessage: "Hello, let's discuss the project.",
          time: "Just now",
          unread: 0,
          messages: [{ sender: freelancer.username, text: "Hello! How can I help you today?", time: "Just now" }]
        };
        localStorage.setItem('talegig_chats', JSON.stringify([newChat, ...existingChats]));
      }
    } catch (e) {}
    navigate('/buyer-dashboard', { state: { activeTab: 'Inbox', targetUser: freelancer.username } });
  };

  const [skillSearch, setSkillSearch] = useState('');
  const [hourlyRange, setHourlyRange] = useState({ min: '', max: '' });
  const [countrySearch, setCountrySearch] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);

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

  const clearSkills = () => setSkillSearch('');
  const clearHourlyRate = () => setHourlyRange({ min: '', max: '' });
  const clearCountries = () => setCountrySearch('');
  const clearRating = () => setSelectedRating(0);

  const filteredAndSortedFreelancers = useMemo(() => {
    let result = [...freelancers];

    if (skillSearch.trim() !== '') {
      const query = skillSearch.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(query) || 
        f.tagline.toLowerCase().includes(query) ||
        f.skills.some(s => s.toLowerCase().includes(query))
      );
    }

    if (hourlyRange.min !== '') {
      result = result.filter(f => f.hourlyRate >= Number(hourlyRange.min));
    }
    if (hourlyRange.max !== '') {
      result = result.filter(f => f.hourlyRate <= Number(hourlyRange.max));
    }

    if (countrySearch.trim() !== '') {
      const query = countrySearch.toLowerCase();
      result = result.filter(f => f.location.toLowerCase().includes(query));
    }

    if (onlineOnly) {
      result = result.filter(f => f.isOnline);
    }

    if (selectedRating > 0) {
      result = result.filter(f => f.rating >= selectedRating);
    }

    result.sort((a, b) => {
      if (sortBy === 'Newest' || sortBy === 'New freelancer') return b.timestamp - a.timestamp;
      if (sortBy === 'Most reviews') return b.reviews - a.reviews;
      if (sortBy === 'Least reviews') return a.reviews - b.reviews;
      if (sortBy === 'Highest rate') return b.hourlyRate - a.hourlyRate;
      if (sortBy === 'Lowest rate') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'Highest rating' || sortBy === 'Hight rating') return b.rating - a.rating;
      return 0;
    });

    return result;
  }, [freelancers, skillSearch, hourlyRange, countrySearch, onlineOnly, selectedRating, sortBy]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050b1a] text-slate-900 dark:text-white transition-colors duration-300">
      {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        
        {/* Top Header & Sort Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Top results</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
              1-20 of {filteredAndSortedFreelancers.length} results
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button 
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)} 
              className="lg:hidden bg-pink-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              {mobileFilterOpen ? 'Hide Filter' : 'Filter'}
            </button>

            <div className="relative" ref={sortDropdownRef}>
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="bg-white dark:bg-[#111622] text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-4 w-48 shadow-sm cursor-pointer"
              >
                <span>Sort by: {sortBy}</span>
                <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 py-2">
                  {['Most reviews', 'Least reviews', 'Highest rate', 'Lowest rate', 'Hight rating', 'New freelancer'].map((option) => (
                    <button
                      key={option}
                      onClick={() => { setSortBy(option); setIsSortOpen(false); }}
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

        {/* Main Grid: Left Sidebar Filter + Right Freelancer Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Filter */}
          <div className={`lg:col-span-4 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            
            {/* Skills Filter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Skills</h3>
                <button onClick={clearSkills} className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Clear</button>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Search skills"
                  className="w-full bg-slate-100 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 placeholder-slate-400"
                />
                <svg className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
            </div>

            {/* Hourly Rate Filter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Hourly rate</h3>
                <button onClick={clearHourlyRate} className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Clear</button>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="$ Min" 
                  value={hourlyRange.min}
                  onChange={(e) => setHourlyRange({...hourlyRange, min: e.target.value})}
                  className="w-full bg-slate-100 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2.5 py-2 rounded-lg text-xs text-center placeholder-slate-400 focus:outline-none" 
                />
                <input 
                  type="number" 
                  placeholder="$ Max" 
                  value={hourlyRange.max}
                  onChange={(e) => setHourlyRange({...hourlyRange, max: e.target.value})}
                  className="w-full bg-slate-100 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2.5 py-2 rounded-lg text-xs text-center placeholder-slate-400 focus:outline-none" 
                />
              </div>
            </div>

            {/* Countries Filter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Countries</h3>
                <button onClick={clearCountries} className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Clear</button>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search countries"
                  className="w-full bg-slate-100 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 placeholder-slate-400"
                />
                <svg className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
            </div>

            {/* Online Only Toggle */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Online</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={onlineOnly} 
                    onChange={(e) => setOnlineOnly(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>
              <p className="text-xs text-slate-500">Online freelancer only</p>
            </div>

            {/* Rating Filter with Clear Button & 2xl Size */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Rating</h3>
                <button onClick={clearRating} className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Clear</button>
              </div>
              <div className="flex items-center gap-1.5 text-2xl cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    onClick={() => setSelectedRating(star === selectedRating ? 0 : star)}
                    className={`${star <= selectedRating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'} hover:scale-110 transition`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Right Freelancer Cards List */}
          <div className="lg:col-span-8 space-y-6">
            {filteredAndSortedFreelancers.length > 0 ? (
              filteredAndSortedFreelancers.map((freelancer) => {
                const isFav = favorites.some(f => f.username === freelancer.username);
                const countryCode = getCountryCode(freelancer.location);
                const topSkills = freelancer.skills ? freelancer.skills.slice(0, 3) : [];

                return (
                  <div 
                    key={freelancer.id}
                    className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row gap-6 relative"
                  >
                    {/* Left Avatar / Image fixed square with strict aspect-square and max-w for mobile protection */}
                    <div className="w-full sm:w-48 aspect-square bg-amber-400 rounded-2xl overflow-hidden shrink-0 relative flex items-center justify-center">
                      <img 
                        src={freelancer.image} 
                        alt={freelancer.name} 
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    {/* Middle Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 
                          onClick={() => navigate(`/profile/${freelancer.username}`)}
                          className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white hover:text-pink-600 cursor-pointer transition-colors"
                        >
                          {freelancer.name}. <span className="text-slate-500 dark:text-slate-400 font-medium">@{freelancer.username}</span>
                        </h2>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> online
                        </span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                        {freelancer.tagline}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                        <span className="flex items-center gap-1 text-amber-500 text-base">
                          <svg className="w-4 h-4 fill-current inline" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.2-1.192-5.934 5.787 1.399 8.168-7.333-3.854-7.333 3.854 1.399-8.168-5.934-5.787 8.2 1.192z"/></svg>
                          {freelancer.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                          {freelancer.reviews} reviews
                        </span>
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          {freelancer.completedProjects}% Complete Project
                        </span>
                        <span className="flex items-center gap-1.5">
                          <img 
                            src={`https://flagcdn.com/w40/${countryCode}.png`} 
                            alt="flag" 
                            className="w-4 h-3 object-cover rounded-xs shadow-xs"
                          />
                          {freelancer.location}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {freelancer.bio}{' '}
                        <span 
                          onClick={() => navigate(`/profile/${freelancer.username}`)}
                          className="text-pink-600 dark:text-pink-400 font-bold cursor-pointer hover:underline"
                        >
                          More...
                        </span>
                      </p>

                      {topSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {topSkills.map((skill, index) => (
                            <span key={index} className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                              {skill} {index < topSkills.length - 1 ? '•' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Price & Actions */}
                    <div className="flex sm:flex-col justify-between items-center sm:items-end shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left sm:text-right">
                        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">${freelancer.hourlyRate}</p>
                        <p className="text-[11px] text-slate-400 uppercase font-bold">Per hour</p>
                      </div>

                      <div className="flex sm:flex-col items-center gap-3 mt-auto">
                        <button 
                          onClick={(e) => toggleFavorite(freelancer, e)}
                          className={`p-2.5 rounded-xl transition-all cursor-pointer border ${isFav ? 'bg-pink-500/10 border-pink-500/30 text-pink-600 scale-105' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-pink-600'}`}
                          title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </button>
                        
                        <button 
                          onClick={() => handleContactChat(freelancer)}
                          className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
                        >
                          Contact
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-10 rounded-2xl text-center space-y-3">
                <p className="text-lg font-bold text-slate-700 dark:text-gray-300">No freelancers found</p>
                <p className="text-xs text-slate-500">Try adjusting your filter criteria to see more results.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Freelancers;