import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PrivateNavbar from './PrivateNavbar';
import PublicNavbar from './PublicNavbar';

const Gigs = () => {
  const navigate = useNavigate();

  // লোকালস্টোরেজ বা ডিফল্ট ডাটা থেকে গিগগুলো লোড করা
  const [gigs, setGigs] = useState(() => {
    try {
      const savedGigs = localStorage.getItem('talegig_gigs') || localStorage.getItem('talegig_proposals');
      if (savedGigs) {
        const parsed = JSON.parse(savedGigs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((g, index) => {
            const rawPrice = g.price !== undefined ? g.price : (g.budgetNum !== undefined ? g.budgetNum : 30);
            const basePrice = Number(rawPrice) || 30;

            const basicPrice = Number(g.packages?.basic?.price) || basePrice;
            const standardPrice = Number(g.packages?.standard?.price) || basePrice * 2;
            const premiumPrice = Number(g.packages?.premium?.price) || basePrice * 4;

            return {
              id: g.id || index + 1,
              title: g.title || 'Professional Graphic Design & Web Development Services',
              category: g.category || 'Graphics & Design',
              images: g.images || [g.image || g.avatar || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=1120', 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=1120', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1120'],
              price: basePrice,
              packages: {
                basic: { name: 'Basic', price: basicPrice, desc: g.packages?.basic?.desc || 'Essential features with standard delivery.' },
                standard: { name: 'Standard', price: standardPrice, desc: g.packages?.standard?.desc || 'Advanced features with source files.' },
                premium: { name: 'Premium', price: premiumPrice, desc: g.packages?.premium?.desc || 'Full package with VIP support & commercial use.' }
              },
              rating: Number(g.rating) || 5,
              reviews: Number(g.reviews) || 24,
              sellerName: g.sellerName || g.freelancerName || 'Saidur R.',
              username: g.username || 'srmarjan',
              sellerAvatar: g.sellerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
              country: g.country || 'Bangladesh',
              skills: g.skills || ['Logo Design', 'UI/UX', 'React'],
              isBoosted: index === 0,
              isTrending: index === 0 || index === 2,
              isOnline: true,
              timestamp: g.timestamp || g.id || Date.now()
            };
          });
        }
      }
    } catch (e) {}

    return [
      {
        id: 1,
        title: 'I will design custom business logo design and unique brand identity',
        category: 'Graphics & Design',
        images: [
          'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=1120',
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1120',
          'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=1120'
        ],
        price: 30,
        packages: {
          basic: { name: 'Basic', price: 30, desc: '1 Initial Logo Concept + High-Res JPEG.' },
          standard: { name: 'Standard', price: 60, desc: '3 Concepts + Vector & Source Files.' },
          premium: { name: 'Premium', price: 120, desc: 'Complete Brand Identity + VIP Support.' }
        },
        rating: 5,
        reviews: 24,
        sellerName: 'Saidur R.',
        username: 'srmarjan',
        sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        country: 'Bangladesh',
        skills: ['Logo Design', 'Vector', 'Branding'],
        isBoosted: true,
        isTrending: true,
        isOnline: true,
        timestamp: Date.now() - 3600000
      },
      {
        id: 2,
        title: 'I will do website UI design, mobile app UI UX, UI UX design',
        category: 'Graphics & Design',
        images: [
          'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=1120',
          'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1120'
        ],
        price: 25,
        packages: {
          basic: { name: 'Basic', price: 25, desc: 'Landing Page UI Design (Figma).' },
          standard: { name: 'Standard', price: 50, desc: 'Multi-page Web App UI/UX.' },
          premium: { name: 'Premium', price: 100, desc: 'Full Mobile + Web UI/UX Design System.' }
        },
        rating: 5,
        reviews: 14,
        sellerName: 'Najmul H.',
        username: 'najmul',
        sellerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
        country: 'Bangladesh',
        skills: ['Figma', 'UI/UX', 'Web Design'],
        isBoosted: false,
        isTrending: false,
        isOnline: true,
        timestamp: Date.now() - 7200000
      },
      {
        id: 3,
        title: 'I will design and develop android and ios mobile application',
        category: 'Programming & Tech',
        images: [
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1120',
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1120'
        ],
        price: 40,
        packages: {
          basic: { name: 'Basic', price: 40, desc: 'Simple React Native Component.' },
          standard: { name: 'Standard', price: 80, desc: 'Cross-platform Mobile App MVP.' },
          premium: { name: 'Premium', price: 160, desc: 'Full App Development with Backend & API.' }
        },
        rating: 5,
        reviews: 2,
        sellerName: 'Saidur R.',
        username: 'srmarjan',
        sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        country: 'Bangladesh',
        skills: ['React', 'NodeJS', 'Mobile App'],
        isBoosted: true,
        isTrending: true,
        isOnline: true,
        timestamp: Date.now() - 10800000
      },
      {
        id: 4,
        title: 'I will do professional content writing and copywriting services',
        category: 'Writing & Translation',
        images: [
          'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1120'
        ],
        price: 20,
        packages: {
          basic: { name: 'Basic', price: 20, desc: '500 Words Blog Post.' },
          standard: { name: 'Standard', price: 40, desc: '1500 Words SEO Optimized Article.' },
          premium: { name: 'Premium', price: 80, desc: 'Full Website Copywriting Package.' }
        },
        rating: 4.9,
        reviews: 21,
        sellerName: 'Sarah M.',
        username: 'sarah',
        sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        country: 'USA',
        skills: ['Copywriting', 'SEO', 'Content Writing'],
        isBoosted: false,
        isTrending: false,
        isOnline: true,
        timestamp: Date.now() - 14400000
      }
    ];
  });

  // ফেভারিট স্টেট ম্যানেজমেন্ট
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('talegig_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleFavorite = (gig, e) => {
    e.stopPropagation();
    const isAlreadyFav = favorites.some(f => f.id === gig.id);
    let updated;
    if (isAlreadyFav) {
      updated = favorites.filter(f => f.id !== gig.id);
    } else {
      const favItem = {
        id: gig.id,
        type: 'gig',
        image: gig.images?.[0] || gig.image,
        title: gig.title,
        price: gig.price,
        rating: gig.rating,
        reviews: gig.reviews,
        sellerName: gig.sellerName,
        username: gig.username
      };
      updated = [...favorites, favItem];
    }
    setFavorites(updated);
    try {
      localStorage.setItem('talegig_favorites', JSON.stringify(updated));
    } catch (e) {}
  };

  // ফিল্টার ও সার্চ স্টেটসমূহ
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [skillSearch, setSkillSearch] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [countrySearch, setCountrySearch] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);

  // কুইক ভিউ মডাল ও ইমেজ গ্যালারি স্টেট
  const [quickViewGig, setQuickViewGig] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedPackageTab, setSelectedPackageTab] = useState('basic');

  // ফিল্টার ড্রপডাউন টগল স্টেট (Click Based with Outside Click Close)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearSkills = () => setSkillSearch('');
  const clearPrice = () => setPriceRange({ min: '', max: '' });
  const clearCountries = () => setCountrySearch('');
  const clearRating = () => setSelectedRating(0);
  const clearAllFilters = () => {
    setSkillSearch('');
    setPriceRange({ min: '', max: '' });
    setCountrySearch('');
    setOnlineOnly(false);
    setSelectedRating(0);
  };

  const categories = ['All', 'Graphics & Design', 'Programming & Tech', 'Writing & Translation', 'Video & Audio'];

  // ফিল্টারিং ও সর্টিং লজিক
  const { boostedGigs, regularGigs } = useMemo(() => {
    let result = [...gigs];

    if (selectedCategory !== 'All') {
      result = result.filter(g => g.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim());
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(g => 
        g.title.toLowerCase().includes(query) || 
        g.category.toLowerCase().includes(query) ||
        g.sellerName.toLowerCase().includes(query)
      );
    }

    if (skillSearch.trim() !== '') {
      const query = skillSearch.toLowerCase().trim();
      result = result.filter(g => 
        g.skills?.some(s => s.toLowerCase().includes(query)) ||
        g.title.toLowerCase().includes(query)
      );
    }

    if (priceRange.min !== '') {
      result = result.filter(g => g.price >= Number(priceRange.min));
    }
    if (priceRange.max !== '') {
      result = result.filter(g => g.price <= Number(priceRange.max));
    }

    if (countrySearch.trim() !== '') {
      const query = countrySearch.toLowerCase().trim();
      result = result.filter(g => g.country.toLowerCase().includes(query));
    }

    if (onlineOnly) {
      result = result.filter(g => g.isOnline);
    }

    if (selectedRating > 0) {
      result = result.filter(g => g.rating >= selectedRating);
    }

    result.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);

    const boosted = result.filter(g => g.isBoosted);
    const regular = result.filter(g => !g.isBoosted);

    return { boostedGigs: boosted, regularGigs: regular };
  }, [gigs, searchQuery, selectedCategory, skillSearch, priceRange, countrySearch, onlineOnly, selectedRating]);

  // চ্যাট হ্যান্ডলার
  const handleContactChat = (gig) => {
    try {
      const existingChats = JSON.parse(localStorage.getItem('talegig_chats') || '[]');
      const chatExists = existingChats.some(c => c.username === gig.username);
      if (!chatExists) {
        const newChat = {
          id: Date.now(),
          name: gig.sellerName,
          username: gig.username,
          avatar: gig.sellerAvatar,
          lastMessage: "Hello, let's discuss this project.",
          time: "Just now",
          unread: 0,
          messages: [{ sender: gig.username, text: `Hello! How can I help you with "${gig.title}"?`, time: "Just now" }]
        };
        localStorage.setItem('talegig_chats', JSON.stringify([newChat, ...existingChats]));
      }
    } catch (e) {}
    navigate('/buyer-dashboard', { state: { activeTab: 'Inbox', targetUser: gig.username } });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050b1a] text-slate-900 dark:text-white transition-colors duration-300">
      {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6 relative">
        
        {/* Top Header & Search Bar Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0b0f19] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Project Catalog</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-0.5">
              Browse and buy predefined professional projects in just a few clicks.
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Try 'logo design' or 'web development'"
              className="w-full bg-slate-100 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 placeholder-slate-400 shadow-inner"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>

        {/* Category Pills & Left Filter SVG Icon Bar */}
        <div className="flex items-center gap-3 w-full pb-2 relative z-40">
          
          {/* Left Filter SVG Button with Click Toggle & Ref */}
          <div className="relative shrink-0" ref={filterRef}>
            <button 
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="bg-white dark:bg-[#111622] border border-slate-300 dark:border-slate-700 p-2.5 rounded-xl text-slate-700 dark:text-white hover:border-blue-500 transition cursor-pointer shadow-md flex items-center justify-center relative z-30"
              title="Advanced Filters"
            >
              <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
            </button>

            {/* Advanced Filter Popover */}
            {isFilterDropdownOpen && (
              <div 
                className="absolute left-0 top-12 w-80 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-5 space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filters</h3>
                  <button type="button" onClick={clearAllFilters} className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-semibold">Clear All</button>
                </div>

                {/* Skills Search */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide">Skills</h4>
                    <button type="button" onClick={clearSkills} className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Clear</button>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search skills"
                      className="w-full bg-slate-100 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 placeholder-slate-400"
                    />
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide">Budget</h4>
                    <button type="button" onClick={clearPrice} className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Clear</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="$ Min" 
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2.5 py-2 rounded-lg text-xs text-center placeholder-slate-400 focus:outline-none" 
                    />
                    <input 
                      type="number" 
                      placeholder="$ Max" 
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2.5 py-2 rounded-lg text-xs text-center placeholder-slate-400 focus:outline-none" 
                    />
                  </div>
                </div>

                {/* Countries Search */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide">Countries</h4>
                    <button type="button" onClick={clearCountries} className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Clear</button>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Search countries"
                      className="w-full bg-slate-100 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 placeholder-slate-400"
                    />
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                </div>

                {/* Online Toggle */}
                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase">Online</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={onlineOnly} 
                        onChange={(e) => setOnlineOnly(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400">Online freelancer only</p>
                </div>

                {/* Rating Filter */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide">Rating</h4>
                    <button type="button" onClick={clearRating} className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Clear</button>
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
            )}
          </div>

          {/* Category Horizontal Scroll Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  selectedCategory === cat
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                    : 'bg-white dark:bg-[#111622] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-gray-300 hover:border-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 1: TALEGIG RECOMMENDED (ADMIN BOOSTED GIGS) */}
        {boostedGigs.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-wider">Featured</span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                TaleGig <span className="text-blue-600 dark:text-blue-400">Recommended</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {boostedGigs.map((gig) => {
                const isFav = favorites.some(f => f.id === gig.id);
                const thumbnail = gig.images?.[0] || gig.image;

                return (
                  <div 
                    key={`boosted-${gig.id}`}
                    onClick={() => { setQuickViewGig(gig); setActiveImageIndex(0); setSelectedPackageTab('basic'); }}
                    className="bg-white dark:bg-[#0b0f19] border-2 border-blue-500/50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col justify-between cursor-pointer hover:-translate-y-1 relative"
                  >
                    <div>
                      <div className="relative w-full aspect-[1120/720] overflow-hidden bg-slate-200 dark:bg-slate-800">
                        <img src={thumbnail} alt={gig.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                          ⭐ Boosted
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img src={gig.sellerAvatar} alt={gig.sellerName} className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700" />
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{gig.sellerName}</h4>
                              <p className="text-[10px] text-slate-500 dark:text-gray-400">Online • {gig.country}</p>
                            </div>
                          </div>

                          <button 
                            onClick={(e) => toggleFavorite(gig, e)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isFav ? 'text-pink-500 scale-110' : 'text-slate-400 hover:text-pink-500'}`}
                          >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-200 line-clamp-2 font-medium leading-snug">
                          {gig.title}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-blue-50/50 dark:bg-[#111622]/80 border-t border-blue-100 dark:border-blue-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-xs font-bold">
                        <svg className="w-3.5 h-3.5 fill-current inline" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.2-1.192-5.934 5.787 1.399 8.168-7.333-3.854-7.333 3.854 1.399-8.168-5.934-5.787 8.2 1.192z"/></svg>
                        <span>{gig.rating}</span>
                        <span className="text-slate-400 font-normal">({gig.reviews})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Starting at</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">${gig.price}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: ALL REGULAR GIGS */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Explore All Gigs & Services
          </h2>

          {regularGigs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {regularGigs.map((gig) => {
                const isFav = favorites.some(f => f.id === gig.id);
                const thumbnail = gig.images?.[0] || gig.image;

                return (
                  <div 
                    key={gig.id}
                    onClick={() => { setQuickViewGig(gig); setActiveImageIndex(0); setSelectedPackageTab('basic'); }}
                    className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-blue-500/50 transition-all duration-300 group flex flex-col justify-between cursor-pointer hover:shadow-xl hover:-translate-y-1 relative"
                  >
                    <div>
                      <div className="relative w-full aspect-[1120/720] overflow-hidden bg-slate-200 dark:bg-slate-800">
                        <img src={thumbnail} alt={gig.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {gig.isTrending && (
                          <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-pink-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                            🔥 Trending
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img src={gig.sellerAvatar} alt={gig.sellerName} className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700" />
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{gig.sellerName}</h4>
                              <p className="text-[10px] text-slate-500 dark:text-gray-400">Online • {gig.country}</p>
                            </div>
                          </div>

                          <button 
                            onClick={(e) => toggleFavorite(gig, e)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isFav ? 'text-pink-500 scale-110' : 'text-slate-400 hover:text-pink-500'}`}
                          >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-200 line-clamp-2 font-medium leading-snug">
                          {gig.title}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-slate-50 dark:bg-[#111622]/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-xs font-bold">
                        <svg className="w-3.5 h-3.5 fill-current inline" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.2-1.192-5.934 5.787 1.399 8.168-7.333-3.854-7.333 3.854 1.399-8.168-5.934-5.787 8.2 1.192z"/></svg>
                        <span>{gig.rating}</span>
                        <span className="text-slate-400 font-normal">({gig.reviews})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Starting at</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">${gig.price}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : boostedGigs.length === 0 && (
            <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-12 rounded-2xl text-center space-y-3">
              <p className="text-lg font-bold text-slate-700 dark:text-gray-300">No projects found</p>
              <p className="text-xs text-slate-500">Try adjusting your search query or filter criteria.</p>
            </div>
          )}
        </div>

      </div>

      {/* QUICK VIEW MODAL */}
      {quickViewGig && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col md:flex-row text-slate-900 dark:text-white">
            
            <button 
              onClick={() => setQuickViewGig(null)}
              className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-pink-600 hover:text-white transition z-10 shadow-sm"
            >
              ✕
            </button>

            {/* Left Column: Image Gallery */}
            <div className="w-full md:w-1/2 bg-slate-100 dark:bg-slate-900/50 p-4 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800">
              <div className="aspect-[1120/720] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900 relative shadow-inner">
                <img 
                  src={quickViewGig.images?.[activeImageIndex] || quickViewGig.image} 
                  alt="Gig Preview" 
                  className="w-full h-full object-cover" 
                />
              </div>

              {quickViewGig.images && quickViewGig.images.length > 1 && (
                <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                  {quickViewGig.images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 transition ${activeImageIndex === idx ? 'border-blue-500 scale-105' : 'border-transparent opacity-60'}`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Details, 3 Packages & 2 Action Buttons */}
            <div className="w-full md:w-1/2 p-6 space-y-4 flex flex-col justify-between max-h-[85vh] overflow-y-auto bg-white dark:bg-[#0b0f19]">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <img src={quickViewGig.sellerAvatar} alt={quickViewGig.sellerName} className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-slate-700" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{quickViewGig.sellerName}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">@{quickViewGig.username} • {quickViewGig.country}</p>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-extrabold leading-snug text-slate-900 dark:text-white">
                  {quickViewGig.title}
                </h3>

                <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                  <span>⭐ {quickViewGig.rating}</span>
                  <span className="text-slate-400 font-normal">({quickViewGig.reviews} reviews)</span>
                </div>

                {/* 3 Packages Selector Tabs */}
                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    {['basic', 'standard', 'premium'].map((pkgKey) => {
                      const pkg = quickViewGig.packages?.[pkgKey];
                      if (!pkg) return null;
                      return (
                        <button
                          key={pkgKey}
                          onClick={() => setSelectedPackageTab(pkgKey)}
                          className={`py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${selectedPackageTab === pkgKey ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                        >
                          {pkg.name} (${pkg.price})
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-slate-50 dark:bg-[#111622] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <p className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      {quickViewGig.packages?.[selectedPackageTab]?.name} Package
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      {quickViewGig.packages?.[selectedPackageTab]?.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Footer with 2 Buttons: Chat with Seller & View Full Details */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <button 
                  onClick={() => handleContactChat(quickViewGig)}
                  className="flex-1 bg-slate-100 dark:bg-[#111622] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xs py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  Chat with Seller
                </button>

                <button 
                  onClick={() => {
                    const gigId = quickViewGig.id;
                    setQuickViewGig(null);
                    navigate(`/gig-details/${gigId}`, { state: { gig: quickViewGig } });
                  }}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs py-3 rounded-xl transition cursor-pointer shadow-lg text-center"
                >
                  View Full Details
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Gigs;