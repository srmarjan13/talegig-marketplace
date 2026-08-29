import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PublicNavbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // মোবাইল মেনু স্টেট
  const [isHireDropdownOpen, setIsHireDropdownOpen] = useState(false); // ডেস্কটপ Hire ড্রপডাউন স্টেট
  const [isFindWorkDropdownOpen, setIsFindWorkDropdownOpen] = useState(false); // ডেস্কটপ Find Work ড্রপডাউন স্টেট
  
  // 📱 মোবাইল অ্যাকর্ডিয়ন স্টেট
  const [mobileActiveTab, setMobileActiveTab] = useState(null);
  
  const dropdownRef = useRef(null);

  // ড্রপডাউন বা মোবাইল মেনুর বাইরে স্ক্রিনে ক্লিক করলে মেনু বন্ধ করার লজিক
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsHireDropdownOpen(false);
        setIsFindWorkDropdownOpen(false);
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🎯 নেভিগেশন হ্যান্ডলার
  const handleSelect = (categoryName, type = 'hire') => {
    setIsHireDropdownOpen(false);
    setIsFindWorkDropdownOpen(false);
    setIsOpen(false);
    setMobileActiveTab(null);

    if (type === 'find-work') {
      navigate(`/search?category=${encodeURIComponent(categoryName)}&tab=projects`);
    } else {
      navigate(`/search?category=${encodeURIComponent(categoryName)}&tab=top-talents`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#1a1c20]/95 backdrop-blur-md border-b border-white/10 text-white" ref={dropdownRef}>
      {/* 💻 পিসি / বড় স্ক্রিন ভার্সন (Desktop Version) */}
      <div className="hidden md:flex justify-between items-center px-8 h-20 max-w-[1400px] mx-auto relative">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center group cursor-pointer">
            <img 
              src="/taleGig2.png" 
              alt="TaleGig Logo" 
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" 
            />
          </Link>

          <div className="flex gap-8 font-medium relative">
            
            {/* 1️⃣ Hire Freelancers ড্রপডাউন */}
            <div 
              onMouseEnter={() => { setIsHireDropdownOpen(true); setIsFindWorkDropdownOpen(false); }}
              className="relative py-7"
            >
              <button 
                onClick={() => { setIsHireDropdownOpen(!isHireDropdownOpen); setIsFindWorkDropdownOpen(false); }}
                className="flex items-center gap-1 hover:text-blue-400 cursor-pointer font-semibold"
              >
                Hire Freelancer <span className={`transition-transform duration-300 ${isHireDropdownOpen ? 'rotate-180' : ''}`}>⌄</span>
              </button>

              {isHireDropdownOpen && (
                <div 
                  onMouseLeave={() => setIsHireDropdownOpen(false)}
                  className="absolute top-full left-[-50px] w-[850px] bg-[#16181d] border border-white/15 rounded-2xl shadow-2xl p-6 grid grid-cols-12 gap-6 animate-fadeIn z-50 backdrop-blur-xl"
                >
                  <div className="col-span-5 space-y-3 border-r border-white/10 pr-4 flex flex-col justify-center">
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 hover:bg-white/5 hover:border-blue-400 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between font-bold text-sm text-white">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          By skill
                        </span>
                        <span className="text-gray-400 group-hover:translate-x-1 transition-transform">›</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Looking for a freelancer with a specific skill? Start here.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 hover:bg-white/5 hover:border-blue-400 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between font-bold text-sm text-white">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          By location
                        </span>
                        <span className="text-gray-400 group-hover:translate-x-1 transition-transform">›</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Search for freelancers based on their location and timezone.</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 hover:bg-white/5 hover:border-blue-400 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between font-bold text-sm text-white">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          By category
                        </span>
                        <span className="text-gray-400 group-hover:translate-x-1 transition-transform">›</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Find freelancers that suit a certain project category.</p>
                    </div>
                  </div>

                  <div className="col-span-7 grid grid-cols-3 gap-3">
                    {[
                      { title: "Graphic designers", img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=60" },
                      { title: "Website designers", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60" },
                      { title: "Mobile app developers", img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format&fit=crop&q=60" },
                      { title: "Software developers", img: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&auto=format&fit=crop&q=60" },
                      { title: "3D artists", img: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=500&auto=format&fit=crop&q=60" },
                      { title: "Illustration", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=60" }
                    ].map((card, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleSelect(card.title, 'hire')}
                        className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition-all group flex flex-col justify-between"
                      >
                        <div className="h-24 overflow-hidden bg-slate-800">
                          <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="p-2.5 text-center">
                          <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">{card.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2️⃣ Find work ড্রপডাউন */}
            <div 
              onMouseEnter={() => { setIsFindWorkDropdownOpen(true); setIsHireDropdownOpen(false); }}
              className="relative py-7"
            >
              <button 
                onClick={() => { setIsFindWorkDropdownOpen(!isFindWorkDropdownOpen); setIsHireDropdownOpen(false); }}
                className="flex items-center gap-1 hover:text-blue-400 cursor-pointer font-semibold"
              >
                Find work <span className={`transition-transform duration-300 ${isFindWorkDropdownOpen ? 'rotate-180' : ''}`}>⌄</span>
              </button>

              {isFindWorkDropdownOpen && (
                <div 
                  onMouseLeave={() => setIsFindWorkDropdownOpen(false)}
                  className="absolute top-full left-[-100px] w-[850px] bg-[#16181d] border border-white/15 rounded-2xl shadow-2xl p-6 grid grid-cols-12 gap-6 animate-fadeIn z-50 backdrop-blur-xl"
                >
                  <div className="col-span-5 space-y-3 border-r border-white/10 pr-4 flex flex-col justify-center">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 hover:bg-white/5 hover:border-blue-400 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between font-bold text-xs text-white">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          By skill
                        </span>
                        <span className="text-gray-400 group-hover:translate-x-1 transition-transform">›</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">Search for work that requires a particular skill.</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 hover:bg-white/5 hover:border-blue-400 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between font-bold text-xs text-white">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                          By language
                        </span>
                        <span className="text-gray-400 group-hover:translate-x-1 transition-transform">›</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">Find projects that are in your language.</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 hover:bg-white/5 hover:border-blue-400 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between font-bold text-xs text-white">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Featured jobs
                        </span>
                        <span className="text-gray-400 group-hover:translate-x-1 transition-transform">›</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">Explore our current list of excited top featured projects.</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 hover:bg-white/5 hover:border-blue-400 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between font-bold text-xs text-white">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          Find contests
                        </span>
                        <span className="text-gray-400 group-hover:translate-x-1 transition-transform">›</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">Unleash your talent and find freelancer contests to enter.</p>
                    </div>
                  </div>

                  <div className="col-span-7 grid grid-cols-3 gap-3">
                    {[
                      { title: "Website jobs", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60" },
                      { title: "Graphic design jobs", img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=60" },
                      { title: "Data entry jobs", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60" },
                      { title: "Mobile app development jobs", img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format&fit=crop&q=60" },
                      { title: "Internet marketing jobs", img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=500&auto=format&fit=crop&q=60" },
                      { title: "Local jobs", img: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&auto=format&fit=crop&q=60" }
                    ].map((card, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleSelect(card.title, 'find-work')}
                        className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition-all group flex flex-col justify-between"
                      >
                        <div className="h-24 overflow-hidden bg-slate-800">
                          <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="p-2 text-center">
                          <h4 className="text-[11px] font-bold text-white group-hover:text-blue-400 transition-colors truncate">{card.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 🟢 ডানপাশে বাটন */}
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/signup?role=seller')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] cursor-pointer"
          >
            I'm Seller
          </button>
          <button 
            onClick={() => navigate('/signup?role=buyer')}
            className="bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg font-semibold transition-all shadow-[0_0_15px_rgba(219,39,119,0.4)] cursor-pointer"
          >
            I'm Buyer
          </button>
        </div>
      </div>

      {/* 📱 ফোন / ছোট স্ক্রিন ভার্সন (Mobile Version) */}
      <div className="md:hidden px-3 py-2.5">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2.5">
            {/* 🌟 পারফেক্ট টেস্টিড ক্লিকযোগ্য ক্লোজ ও হ্যামবার্গার বাটন */}
            <button 
              type="button"
              onClick={() => { 
                setIsOpen(!isOpen); 
                setMobileActiveTab(null); 
              }} 
              className="relative w-9 h-9 flex items-center justify-center focus:outline-none cursor-pointer bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                /* খোলার পর স্পষ্ট 'X' বাটন */
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                /* ৩ লাইন মেনু আইকন */
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <Link to="/" className="flex items-center cursor-pointer">
              <img src="/taleGig2.png" alt="TaleGig Logo" className="h-8 w-auto object-contain" />
            </Link>
          </div>

          {/* 🟢 "I'm Seller" এবং "I'm Buyer" বাটন */}
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => navigate('/signup?role=seller')}
              className="bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg text-xs font-black shadow-md transition-all whitespace-nowrap cursor-pointer"
            >
              I'm Seller
            </button>
            <button 
              type="button"
              onClick={() => navigate('/signup?role=buyer')}
              className="bg-pink-600 hover:bg-pink-700 px-3.5 py-2 rounded-lg text-xs font-black shadow-md transition-all whitespace-nowrap cursor-pointer"
            >
              I'm Buyer
            </button>
          </div>
        </div>
        
        {/* 📱 মোবাইল অ্যাকর্ডিয়ন মেনু */}
        {isOpen && (
          <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-white/10 font-medium animate-fadeIn bg-slate-900/95 backdrop-blur-2xl p-3.5 rounded-2xl shadow-2xl border border-white/10">
            
            {/* 1️⃣ Hire Freelancers ড্রপডাউন কার্ড */}
            <div className="group">
              <div 
                onClick={() => setMobileActiveTab(mobileActiveTab === 'hire' ? null : 'hire')}
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-white/[0.08] to-white/[0.03] backdrop-blur-xl border border-white/15 hover:border-blue-500/50 cursor-pointer shadow-md transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-white">Hire Freelancers</span>
                </div>
                <span className={`transition-transform duration-300 text-sm font-bold text-blue-400 ${mobileActiveTab === 'hire' ? 'rotate-180 text-pink-400' : ''}`}>⌄</span>
              </div>

              {mobileActiveTab === 'hire' && (
                <div className="grid grid-cols-2 gap-2 mt-2 pl-1 animate-fadeIn pb-1">
                  {[
                    { title: "Graphic designers", img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=300&auto=format&fit=crop&q=60" },
                    { title: "Website designers", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&auto=format&fit=crop&q=60" },
                    { title: "Mobile app devs", img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&auto=format&fit=crop&q=60" },
                    { title: "Software devs", img: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=300&auto=format&fit=crop&q=60" },
                    { title: "3D artists", img: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=300&auto=format&fit=crop&q=60" },
                    { title: "Illustration", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=60" }
                  ].map((item, i) => (
                    <div 
                      key={i}
                      onClick={() => handleSelect(item.title, 'hire')}
                      className="flex items-center gap-2 bg-slate-950/80 border border-white/10 p-2 rounded-xl cursor-pointer hover:border-blue-400 transition-all shadow-sm"
                    >
                      <img src={item.img} alt={item.title} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                      <span className="text-[11px] font-bold text-gray-200 truncate">{item.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2️⃣ Find Work ড্রপডাউন কার্ড */}
            <div className="group">
              <div 
                onClick={() => setMobileActiveTab(mobileActiveTab === 'find' ? null : 'find')}
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-white/[0.08] to-white/[0.03] backdrop-blur-xl border border-white/15 hover:border-pink-500/50 cursor-pointer shadow-md transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-pink-600/20 flex items-center justify-center text-pink-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-white">Find Work</span>
                </div>
                <span className={`transition-transform duration-300 text-sm font-bold text-pink-400 ${mobileActiveTab === 'find' ? 'rotate-180 text-blue-400' : ''}`}>⌄</span>
              </div>

              {mobileActiveTab === 'find' && (
                <div className="grid grid-cols-2 gap-2 mt-2 pl-1 animate-fadeIn pb-1">
                  {[
                    { title: "Website jobs", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&auto=format&fit=crop&q=60" },
                    { title: "Graphic design jobs", img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=300&auto=format&fit=crop&q=60" },
                    { title: "Data entry jobs", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&auto=format&fit=crop&q=60" },
                    { title: "Mobile app jobs", img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&auto=format&fit=crop&q=60" },
                    { title: "Marketing jobs", img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=300&auto=format&fit=crop&q=60" },
                    { title: "Local jobs", img: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=300&auto=format&fit=crop&q=60" }
                  ].map((item, i) => (
                    <button 
                      key={i}
                      type="button"
                      onClick={() => handleSelect(item.title, 'find-work')}
                      className="flex items-center gap-2 bg-slate-950/80 border border-white/10 p-2 rounded-xl cursor-pointer hover:border-pink-400 transition-all shadow-sm w-full text-left"
                    >
                      <img src={item.img} alt={item.title} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                      <span className="text-[11px] font-bold text-gray-200 truncate">{item.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;