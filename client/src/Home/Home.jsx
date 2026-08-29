import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PrivateNavbar from './PrivateNavbar';
import { useToast } from '../Home/ToastContext';
import Footer from '../Home/Footer';
import { SiGmail } from 'react-icons/si';

const Home = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const iconClass = "w-4 h-4";
  
  // 🟢 ইউজারের লগইন স্ট্যাটাস চেক করার জন্য
  const isAuthenticated = localStorage.getItem('user') || localStorage.getItem('token');
  
  // 🌙 ডার্ক/লাইট মোড স্টেট
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 🌙 ডার্ক/লাইট মোড রুট এলিমেন্টে সিঙ্ক করার লজিক
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 🔄 ৫টি অ্যানিমেটেড হিরো টাইটেল
  const heroHeadings = [
    "Expert Freelancer",
    "Top UI/UX Designers",
    "Full-Stack Developers",
    "Creative Brand Specialists",
    "Professional Video Editors"
  ];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // 🔍 সার্চ বার স্টেট
  const [searchQuery, setSearchQuery] = useState('');

  // 📂 মাউস হোভার ও ক্লিকের জন্য ড্রপডাউন স্টেট (সেকশন ৩)
  const [activeDropdown, setActiveDropdown] = useState(null);

  // 📱 মোবাইলে 'More' বাটন ক্লিক করে এক্সপ্যান্ড করার স্টেট
  const [showAllCategories, setShowAllCategories] = useState({});

  // 💼 সেকশন ৪: প্রজেক্ট রিকুয়েস্ট ফর্ম স্টেট
  const [projectDetails, setProjectDetails] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedBudget, setSelectedBudget] = useState('');
  
  // ড্রপডাউন ওপেন/ক্লোজ স্টেট
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);

  // 🌟 কাস্টম বাজেট পপ-আপ স্টেট
  const [isCustomBudgetOpen, setIsCustomBudgetOpen] = useState(false);
  const [customBudgetInput, setCustomBudgetInput] = useState('');

  // 🖱️ ড্রপডাউনের বাইরে ক্লিক করলে বন্ধ করার জন্য রেফ (Ref)
  const currencyRef = useRef(null);
  const budgetRef = useRef(null);

  // 🎯 সেকশন ৫: মোস্ট পপুলার সার্ভিস ট্যাব ফিল্টার স্টেট
  const [activeServiceTab, setActiveServiceTab] = useState('All');

  // 📊 সেকশন ৮: লাইভ কাউন্টার স্টেট (প্রতি ৫ সেকেন্ডে মান বাড়ার জন্য)
  const [stats, setStats] = useState({
    completeProjects: 3289,
    satisfiedClients: 1802,
    availableJobs: 5000,
    buyerSpend: 125400
  });

  // প্রতি ৫ সেকেন্ডে কাউন্টার বাড়ানোর লজিক
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        completeProjects: prev.completeProjects + Math.floor(Math.random() * 3) + 1,
        satisfiedClients: prev.satisfiedClients + (Math.random() > 0.5 ? 1 : 0),
        availableJobs: prev.availableJobs + Math.floor(Math.random() * 5) + 1,
        buyerSpend: prev.buyerSpend + Math.floor(Math.random() * 150) + 50
      }));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // কারেন্সি লিস্ট
  const currencies = ["USD", "GBP", "EUR", "CAD", "NZD", "AUD", "HKD", "AED", "SDG", "INR", "BDT"];
  
  // বাজেট রেঞ্জ লিস্ট
  const getBudgetOptions = (curr) => [
    `Micro project (10 - 30 ${curr})`,
    `Simple project (30 - 250 ${curr})`,
    `Very simple project (250 - 750 ${curr})`,
    `Small Project (750 - 1500 ${curr})`,
    `Medium Project (1500 - 3000 ${curr})`,
    `Large Project (3000 - 5000 ${curr})`,
    `Larger Project (5000-10,000 ${curr})`,
    `Very Large Project (10,000 - 20,000 ${curr})`,
    `Huge project (20,000 - 50,000 ${curr})`,
    `Major Project (50,000+ ${curr})`,
    "Customize Budget"
  ];

  // অ্যানিমেশন টাইমার
  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % heroHeadings.length);
    }, 3500);
    return () => clearInterval(textInterval);
  }, [heroHeadings.length]);

  // 🖱️ স্ক্রিনের বাইরে ক্লিক করলে ড্রপডাউন অটো ক্লোজ করার লজিক
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setIsCurrencyOpen(false);
      }
      if (budgetRef.current && !budgetRef.current.contains(event.target)) {
        setIsBudgetOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // সার্চ হ্যান্ডলার
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}&tab=gigs`);
    }
  };

  // সাব-ক্যাটাগরি ক্লিক হ্যান্ডলার
  const handleSubCategoryClick = (subCategoryName) => {
    setActiveDropdown(null);
    navigate(`/search?category=${encodeURIComponent(subCategoryName)}`);
  };

  // 📱 'More' টগল হ্যান্ডলার
  const toggleShowMore = (catId) => {
    setShowAllCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // 🎯 বাজেট অপশন সিলেকশন হ্যান্ডলার
  const handleBudgetSelect = (option) => {
    if (option === "Customize Budget") {
      setIsBudgetOpen(false);
      setIsCustomBudgetOpen(true);
    } else {
      setSelectedBudget(option);
      setIsBudgetOpen(false);
    }
  };

  // 💾 কাস্টম বাজেট সেভ হ্যান্ডলার
  const handleCustomBudgetSave = (e) => {
    e.preventDefault();
    if (customBudgetInput.trim()) {
      setSelectedBudget(`Custom: ${customBudgetInput} ${selectedCurrency}`);
      setCustomBudgetInput('');
      setIsCustomBudgetOpen(false);
    } else {
      showToast("Please enter a valid budget amount!",'error');
    }
  };

  const handleProjectSubmit = async (e) => {
  e.preventDefault();
  if (!projectDetails.trim()) {
    showToast("Please enter your project details!", 'error');
    return;
  }

  const budgetVal = selectedBudget ? selectedBudget.replace(/[^0-9]/g, '') : '50';
  
  const projectPayload = {
    title: projectDetails.length > 50 ? projectDetails.substring(0, 47) + '...' : projectDetails,
    description: projectDetails,
    budget: parseFloat(budgetVal) || 50,
    category: 'General',
    currency: selectedCurrency,
    authorName: isAuthenticated ? (JSON.parse(localStorage.getItem('user'))?.username || 'Client') : 'Guest Client'
  };

  // যদি ইউজার লগইন করা না থাকে
  if (!isAuthenticated) {
    // সিকিউরড সেশনের জন্য টেম্পোরারি ব্যাকএন্ড টোকেন বা রিডাইরেক্ট হ্যান্ডেল করা
    navigate('/login');
    return;
  }

  // সরাসরি ব্যাকএন্ড ডাটাবেজে সাবমিট
  try {
    const response = await fetch('http://localhost:3001/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectPayload)
    });

    if (response.ok) {
      showToast("Project successfully sent to database and admin panel!", 'success');
      setProjectDetails('');
      navigate('/allproject');
    } else {
      showToast("Failed to submit project to server.", 'error');
    }
  } catch (error) {
    console.error("Server connection error:", error);
    showToast("Server connection error!", 'error');
  }
  };

  // 🖱️ গিগ ডিটেইলস পেজে যাওয়ার ফাংশন
  const handleGigClick = (gigId) => {
    navigate(`/gig/${gigId}`);
  };

  // 🎯 সেকশন ৭: পপুলার সার্ভিস কার্ড ক্লিক
  const handlePopularServiceClick = (serviceName) => {
    navigate(`/search?category=${encodeURIComponent(serviceName)}`);
  };
  
  // 📁 ক্যাটাগরি ডেটা (সেকশন ৩)
  const categoriesData = [
    {
      id: 1,
      name: "Graphics & Designing",
      items: [
        {
          title: "Logo & Brand Identity",
          subItems: ["Logo Design", "Brand Style Guides", "Business Cards & Stationery", "Fonts & Typography", "Logo Maker Tool"]
        },
        {
          title: "Art & Illustration",
          subItems: ["Illustration", "AI Art", "Children's Book Illustration", "Cartoons & Comics"]
        },
        {
          title: "Web & App Design",
          subItems: ["Website Design", "App Design", "UX/UI", "Landing Page Design"]
        },
        {
          title: "Print Design",
          subItems: ["Flyer Design", "Brochure Design", "Poster Design", "Catalog Design"]
        },
        {
          title: "3D Design",
          subItems: ["3D Modeling", "3D Architecture", "3D Printing", "3D Product Animation"]
        },
        {
          title: "Visual Design",
          subItems: ["Image Editing", "Presentation Design", "Infographic Design"]
        },
        {
          title: "Marketing Design",
          subItems: ["Social Media Design", "Email Design", "Web Banners", "Signage Design"]
        },
        {
          title: "Packaging & Covers",
          subItems: ["Packaging Design", "Book Design", "Album Cover Design"]
        },
        {
          title: "Architecture & Building",
          subItems: ["Architectural Design", "Interior Design", "Landscape Design"]
        },
        {
          title: "Fashion & Merchandise",
          subItems: ["Fashion Design", "T-Shirts & Merchandise", "Jewelry Design"]
        },
        {
          title: "Miscellaneous",
          subItems: ["Streamers & Twitch", "NFT Art", "Scrapbooking"]
        }
      ]
    },
    {
      id: 2,
      name: "Programming & Teach",
      items: [
        {
          title: "Website Development",
          subItems: ["E-Commerce Development", "Business Websites", "Landing Pages", "Custom Websites"]
        },
        {
          title: "Website Platforms",
          subItems: ["WordPress", "Shopify", "Wix", "Squarespace", "Webflow"]
        },
        {
          title: "Website Maintenance",
          subItems: ["Website Optimization", "Security & Malware Fix", "Bug Fixing"]
        },
        {
          title: "Software Development",
          subItems: ["Desktop Applications", "SaaS Development", "APIs & Integrations"]
        },
        {
          title: "AI Development",
          subItems: ["Machine Learning", "Data Science", "AI Chatbots & Integration"]
        },
        {
          title: "Software Developers",
          subItems: ["Full-Stack", "Frontend", "Backend", "DevOps"]
        },
        {
          title: "QA & Review",
          subItems: ["Manual Testing", "Automated Testing", "Code Review"]
        },
        {
          title: "Mobile App Development",
          subItems: ["iOS Apps", "Android Apps", "Cross-Platform Apps", "Flutter / React Native"]
        },
        {
          title: "Game Development",
          subItems: ["PC Games", "Mobile Games", "VR/AR Games", "Game Assets"]
        },
        {
          title: "Chatbots",
          subItems: ["Discord Bots", "Telegram Bots", "WhatsApp Bots", "Custom AI Bots"]
        }
      ]
    }
  ];

  // 🌟 সেকশন ৭: পপুলার সার্ভিস ডেটা
  const popularServicesData = [
    {
      id: 1,
      title: "Logo design",
      bgColor: "bg-gradient-to-b from-[#831843] to-[#500724]",
      borderColor: "border-pink-500/40",
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      title: "Web development",
      bgColor: "bg-gradient-to-b from-[#1e1b4b] to-[#0f172a]",
      borderColor: "border-indigo-500/40",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 3,
      title: "Digital marketing",
      bgColor: "bg-gradient-to-b from-[#14532d] to-[#052e16]",
      borderColor: "border-green-500/40",
      image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 4,
      title: "Data Entry",
      bgColor: "bg-gradient-to-b from-[#581c87] to-[#3b0764]",
      borderColor: "border-purple-500/40",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 5,
      title: "SEO",
      bgColor: "bg-gradient-to-b from-[#c2410c] to-[#7c2d12]",
      borderColor: "border-orange-500/40",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 6,
      title: "Video Editing",
      bgColor: "bg-gradient-to-b from-[#881337] to-[#4c0519]",
      borderColor: "border-red-500/40",
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 7,
      title: "Mobile apps Development",
      bgColor: "bg-gradient-to-b from-[#065f46] to-[#022c22]",
      borderColor: "border-teal-500/40",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format&fit=crop&q=60"
    }
  ];

  // 🌟 সেকশন ৫ এর ডেমো গিগ ডেটা
  const sampleGigs = [
    {
      id: 1,
      category: "Graphics & Design",
      title: "I will design custom business logo design and unique brand identity",
      freelancerName: "Alessandro G.",
      username: "@alessandro_G",
      country: "Italy",
      rating: 5.0,
      reviews: 8,
      price: 15,
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      category: "Programming & Tech",
      title: "I will do website UI design, mobile app UI UX, UI UX design",
      freelancerName: "Najmul H.",
      username: "@najmulhoque",
      country: "Bangladesh",
      rating: 5.0,
      reviews: 14,
      price: 25,
      image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 3,
      category: "Programming & Tech",
      title: "I will design and develop android and ios mobile application",
      freelancerName: "Saidur R.",
      username: "@saidurrahman",
      country: "Bangladesh",
      rating: 5.0,
      reviews: 2,
      price: 25,
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 4,
      category: "Writing & Translation",
      title: "I will do professional content writing and copywriting services",
      freelancerName: "Sarah M.",
      username: "@sarah_writer",
      country: "USA",
      rating: 4.9,
      reviews: 21,
      price: 20,
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&auto=format&fit=crop&q=60"
    }
  ];

  const filteredGigs = activeServiceTab === 'All' 
    ? sampleGigs 
    : sampleGigs.filter(g => g.category.toLowerCase() === activeServiceTab.toLowerCase());

  return (
    <div className={`relative w-full overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white dark' : 'bg-white text-slate-900'}`}>

{/* ==========================================
          🎬 SECTION 1: HERO SECTION (Final Balanced Layout with Badge)
          ========================================== */}
      <div className="relative w-full min-h-[83vh] sm:min-h-[90vh] flex items-center overflow-hidden bg-slate-50 dark:bg-[#070a12] text-slate-900 dark:text-white transition-colors duration-300 font-sans">
        
        {/* ব্যাকগ্রাউন্ড ভিডিও */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover scale-105 filter brightness-75 contrast-110"
          style={{ zIndex: 0 }}
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>

        {/* গ্রেডিয়েন্ট ওভারলে */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/95 via-white/80 to-white/40 dark:from-[#070a12]/95 dark:via-[#070a12]/85 dark:to-[#070a12]/40 sm:to-transparent" style={{ zIndex: 1 }}></div>
        <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-slate-50 dark:from-[#070a12] via-transparent to-black/40" style={{ zIndex: 1 }}></div>

        {/* নেভবার */}
        <div className="absolute top-0 left-0 w-full z-30">
          {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}
        </div>

        {/* হিরো কন্টেন্ট (pt-20 এর জায়গায় pt-6 দেওয়া হয়েছে এবং my-auto সরিয়ে নেওয়া হয়েছে) */}
        <section className="relative z-10 max-w-[1400px] w-full mx-auto px-4 sm:px-6 md:px-10 pt-6 sm:pt-32 pb-8 sm:pb-16 flex flex-col items-center lg:items-start justify-center text-center lg:text-left">
          
          <div className="max-w-3xl space-y-4 sm:space-y-6 w-full flex flex-col items-center lg:items-start">
            
            {/* 1. সবার উপরে ট্রাস্ট ব্যাজ এবং হেডিং */}
            <div className="space-y-3.5 w-full flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.06] backdrop-blur-2xl border border-slate-200 dark:border-white/15 shadow-sm">
                <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span className="text-[10px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-wider uppercase">THE WORLD'S LEADING TALENT ECOSYSTEM</span>
              </div>

              <div className="space-y-1 w-full">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-slate-900 dark:text-white drop-shadow-md">
                  DISCOVER EXPERTS.
                </h1>
                
                <div className="min-h-[40px] sm:min-h-[70px] flex items-center justify-center lg:justify-start px-1 sm:px-0">
                  <span 
                    key={currentTextIndex}
                    className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300 animate-fadeIn drop-shadow-sm leading-tight flex items-center gap-2 whitespace-nowrap overflow-visible"
                  >
                    <svg className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{heroHeadings[currentTextIndex]}</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* 2. মাঝখানে: ৪টি স্লিম ও গোছালো কার্ড */}
            <div className="grid grid-cols-2 gap-2.5 w-full max-w-lg">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm text-slate-900 dark:text-white text-[11px] sm:text-sm font-bold text-left">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span className="truncate">Verified Professionals</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm text-slate-900 dark:text-white text-[11px] sm:text-sm font-bold text-left">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span className="truncate">Cost-effective pricing</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm text-slate-900 dark:text-white text-[11px] sm:text-sm font-bold text-left">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span className="truncate">Milestone secure pay</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm text-slate-900 dark:text-white text-[11px] sm:text-sm font-bold text-left">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span className="truncate">24/7 Dedicated Support</span>
              </div>
            </div>

            {/* 3. সবার নিচে: দুটি সিটিএ বাটন */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 pt-2 w-full max-w-sm sm:max-w-none">
              <button 
                onClick={() => navigate('/createproject')}
                className="w-full sm:w-auto bg-pink-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-pink-600/30 cursor-pointer flex items-center justify-center gap-2 group border border-blue-400/30"
              >
                <span>Post a New Project</span>
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <button 
                onClick={() => navigate('/signup', { state: { role: 'seller' } })}
                className="w-full sm:w-auto bg-white/80 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white px-7 py-3.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 hover:scale-[1.02] shadow-md dark:shadow-xl cursor-pointer backdrop-blur-2xl flex items-center justify-center"
              >
                Join as a Professional
              </button>
            </div>

          </div>
        </section>
      </div>


      {/* ==========================================
          🔍 SECTION 2: DYNAMIC SEARCH SECTION
          ========================================== */}
      <section className="w-full bg-gradient-to-r from-blue-700 via-blue-900 to-slate-950 dark:from-blue-800 dark:via-blue-950 dark:to-slate-900 py-6 sm:py-8 px-4 sm:px-6 shadow-xl border-y border-white/10">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              What are you looking for......
            </h2>
            <p className="text-[11px] sm:text-xs text-cyan-300 font-bold tracking-wide animate-pulse">
              🎉 1st order 50% Discount!
            </p>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1 shadow-lg max-w-lg mx-auto transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/50">
            <input 
              type="text" 
              placeholder="Find your needs...." 
              className="w-full px-3.5 py-1.5 text-white placeholder-gray-300 bg-transparent rounded-full outline-none text-xs sm:text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 sm:px-5 sm:py-2 rounded-full font-bold text-xs transition-all shadow-md shadow-blue-600/40 cursor-pointer flex items-center justify-center"
              title="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      </section>

{/* ==========================================
    📂 SECTION 3: CATEGORY SECTION (Ultra Compact Spacing)
    ========================================== */}
<section 
  className="relative w-full bg-slate-50 dark:bg-[#070a12] text-slate-900 dark:text-white py-6 sm:py-8 px-4 sm:px-6 transition-colors overflow-visible"
  onClick={() => setActiveDropdown(null)}
>
  
  {/* বাম পাশের প্রিমিয়াম গ্লোয়িং কালারফুল স্ট্রাইপ */}
  <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-blue-600 via-pink-500 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>

  <div className="max-w-[1400px] mx-auto space-y-4 sm:space-y-6 pl-2 sm:pl-4">
    
    {/* হেডার */}
    <div className="flex items-center gap-3">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-md shadow-blue-600/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </div>
      <div>
        <h2 className="text-lg sm:text-2xl font-black tracking-tight">Explore Categories</h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Find professional services tailored to your needs</p>
      </div>
    </div>

    <div className="space-y-4 sm:space-y-6">
      {categoriesData.map((cat) => {
        const isExpanded = showAllCategories[cat.id];

        return (
          <div key={cat.id} className="space-y-2.5">
            <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white border-l-4 border-blue-600 pl-3">
              {cat.name}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {cat.items.map((item, index) => {
                const dropdownKey = `${cat.id}-${index}`;
                const isOpen = activeDropdown === dropdownKey;
                const isHiddenOnMobile = index >= 4 && !isExpanded;

                return (
                  <div 
                    key={index} 
                    className={`relative ${isHiddenOnMobile ? 'hidden sm:block' : 'block'}`}
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={() => { if (window.innerWidth >= 640) setActiveDropdown(dropdownKey); }}
                    onMouseLeave={() => { if (window.innerWidth >= 640) setActiveDropdown(null); }}
                  >
                    {/* কার্ড ডিজাইন */}
                    <div
                      onClick={() => setActiveDropdown(isOpen ? null : dropdownKey)}
                      className={`group flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-xl border ${
                        isOpen 
                          ? 'bg-blue-600 text-white border-blue-400 shadow-[0_4px_20px_rgba(37,99,235,0.3)] ring-2 ring-blue-500/40 rounded-b-none z-50 relative' 
                          : 'bg-white/80 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.08] border-slate-200/80 dark:border-white/[0.1] hover:border-blue-400/50 shadow-sm'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-bold truncate pl-1">{item.title}</span>
                      <svg className={`h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* ড্রপডাউন মেনু */}
                    {isOpen && (
                      <div className="absolute left-0 right-0 z-[9999] bg-white/95 dark:bg-[#0c101d]/95 backdrop-blur-3xl border-x border-b border-slate-200 dark:border-blue-500/30 rounded-b-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] py-1.5 overflow-hidden animate-in fade-in duration-150">
                        {item.subItems.map((sub, subIdx) => (
                          <button
                            key={subIdx}
                            onClick={() => {
                              setActiveDropdown(null);
                              handleSubCategoryClick(sub);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-gray-300 hover:text-white hover:bg-blue-600 transition-all flex items-center justify-between group/sub cursor-pointer"
                          >
                            <span>{sub}</span>
                            <span className="opacity-0 group-hover/sub:opacity-100 text-white transition-opacity font-bold">›</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* মোবাইলের জন্য See More বাটন */}
            {cat.items.length > 4 && (
              <div className="flex justify-start pt-0.5 sm:hidden">
                <button
                  onClick={() => toggleShowMore(cat.id)}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1 cursor-pointer bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm transition"
                >
                  {isExpanded ? 'Show Less ▲' : `See More (${cat.items.length - 4} more) ▼`}
                </button>
              </div>
            )}

          </div>
        );
      })}
    </div>

    {/* সেকশনের নিচে প্রিমিয়াম 'See All Skills' বাটন */}
    <div className="flex justify-center pt-4">
      <button
        onClick={() => navigate('/skills')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 shadow-md shadow-blue-600/30 cursor-pointer flex items-center gap-2 group"
      >
        <span>See All Skills</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </button>
    </div>

  </div>
</section>

      {/* ==========================================
          💼 SECTION 4: PROJECT BUDGET & REQUEST FORM
          ========================================== */}
      <section className="w-full bg-gradient-to-r from-blue-600 via-blue-900 to-slate-950 dark:from-blue-800 dark:via-blue-950 dark:to-slate-900 py-12 sm:py-16 px-4 sm:px-6 md:px-10 shadow-2xl border-b border-white/15 transition-colors">
        <div className="max-w-[1200px] mx-auto space-y-6">
          
          <div className="space-y-2">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-md">
              Describe the project according to the budget
            </h2>
            <p className="text-xs sm:text-sm text-gray-100 font-medium max-w-3xl leading-relaxed">
              Contact skilled freelancers within minutes. View profiles, ratings, portfolios and chat with me. Pay me only when you are 100% satisfied with my work.
            </p>
          </div>

          <form onSubmit={handleProjectSubmit} className="space-y-5">
            
            <div className="relative">
              <textarea
                rows="7"
                placeholder="Enter your Project Details..."
                className="w-full bg-black/30 dark:bg-slate-950/70 backdrop-blur-md border border-white/30 rounded-2xl p-4 sm:p-5 text-white placeholder-gray-300 text-xs sm:text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 resize-y shadow-inner min-h-[160px] transition-all"
                value={projectDetails}
                onChange={(e) => setProjectDetails(e.target.value)}
              ></textarea>
            </div>

            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                
                {/* প্রিমিয়াম কারেন্সি ড্রপডাউন */}
                <div className="relative" ref={currencyRef}>
                  <button
                    type="button"
                    onClick={() => { setIsCurrencyOpen(!isCurrencyOpen); setIsBudgetOpen(false); }}
                    className="bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 hover:border-pink-500 text-white px-5 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-between gap-6 cursor-pointer w-full sm:w-[130px] transition-all shadow-md"
                  >
                    <span>{selectedCurrency}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isCurrencyOpen ? 'rotate-180 text-pink-400' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isCurrencyOpen && (
                    <div className="absolute left-0 bottom-full mb-2 w-full bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 rounded-2xl shadow-2xl z-50 max-h-52 overflow-y-auto py-1.5 divide-y divide-white/5">
                      {currencies.map((curr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { 
                            setSelectedCurrency(curr); 
                            setSelectedBudget(''); 
                            setIsCurrencyOpen(false); 
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-gray-200 hover:text-white hover:bg-pink-600/30 transition-colors font-bold"
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* প্রিমিয়াম বাজেট রেঞ্জ ড্রপডাউন */}
                <div className="relative flex-1" ref={budgetRef}>
                  <button
                    type="button"
                    onClick={() => { setIsBudgetOpen(!isBudgetOpen); setIsCurrencyOpen(false); }}
                    className="bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 hover:border-pink-500 text-white px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between gap-6 cursor-pointer w-full lg:w-[380px] transition-all shadow-md"
                  >
                    <span className="truncate">{selectedBudget || `Share your budget (1 - 100000 ${selectedCurrency})`}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isBudgetOpen ? 'rotate-180 text-pink-400' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isBudgetOpen && (
                    <div className="absolute left-0 bottom-full mb-2 w-full bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto py-1.5 divide-y divide-white/5">
                      {getBudgetOptions(selectedCurrency).map((budgetOpt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleBudgetSelect(budgetOpt)}
                          className="w-full text-left px-4 py-3 text-xs sm:text-sm text-gray-200 hover:text-white hover:bg-pink-600/30 transition-colors font-medium flex items-center justify-between group"
                        >
                          <span>{budgetOpt}</span>
                          <span className="text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity">✓</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* সেন্ড বাটন */}
              <button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white px-9 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(219,39,119,0.5)] cursor-pointer flex items-center justify-center w-full lg:w-auto hover:scale-105"
              >
                Send
              </button>

            </div>

          </form>

        </div>
      </section>


      {/* ==========================================
          🌟 SECTION 5: MOST POPULAR SERVICE & RECOMMENDED GIGS
          ========================================== */}
      <section className="relative w-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white py-12 sm:py-16 px-4 sm:px-6 md:px-10 border-b border-slate-200 dark:border-white/10 transition-colors">
        <div className="max-w-[1400px] mx-auto space-y-10">
          
          <div className="text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow-md">
              Most popular Service
            </h2>

            <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
              {['All', 'Graphics & Design', 'Programming & Tech', 'Writing & Translation'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveServiceTab(tab)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                    activeServiceTab === tab
                      ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-blue-500/30 text-slate-700 dark:text-gray-300 hover:border-blue-400 dark:hover:text-white shadow-sm'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-blue-500/30 rounded-3xl p-4 sm:p-8 shadow-xl space-y-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  TaleGig <span className="text-slate-900 dark:text-white font-normal">Recommended</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">Customers give them repeat orders</p>
              </div>
            </div>

            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 snap-x">
              {filteredGigs.map((gig) => (
                <div 
                  key={gig.id} 
                  onClick={() => handleGigClick(gig.id)}
                  className="min-w-[280px] sm:min-w-0 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-blue-500/30 rounded-2xl overflow-hidden shadow-lg hover:border-blue-400 transition-all duration-300 group flex flex-col justify-between snap-start cursor-pointer hover:scale-[1.02]"
                >
                  <div>
                    <div className="relative h-40 sm:h-48 overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <img 
                        src={gig.image} 
                        alt={gig.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                            {gig.freelancerName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{gig.freelancerName}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-gray-400">Online • {gig.country}</p>
                          </div>
                        </div>
                        <button className="text-slate-400 hover:text-pink-500 transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                          🤍
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-200 line-clamp-2 font-medium">
                        {gig.title}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-xs font-bold">
                      <span>⭐</span>
                      <span>{gig.rating}</span>
                      <span className="text-slate-400 font-normal">({gig.reviews})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Starting at</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">${gig.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Explore these in-demand freelancers
              </h3>
            </div>

            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 snap-x">
              {filteredGigs.map((gig) => (
                <div 
                  key={`demand-${gig.id}`} 
                  onClick={() => handleGigClick(gig.id)}
                  className="min-w-[280px] sm:min-w-0 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-blue-500/30 rounded-2xl overflow-hidden shadow-lg hover:border-blue-400 transition-all duration-300 group flex flex-col justify-between snap-start cursor-pointer hover:scale-[1.02]"
                >
                  <div>
                    <div className="relative h-40 sm:h-48 overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <img 
                        src={gig.image} 
                        alt={gig.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                            {gig.freelancerName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{gig.freelancerName}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-gray-400">Online • {gig.country}</p>
                          </div>
                        </div>
                        <button className="text-slate-400 hover:text-pink-500 transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                          🤍
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-200 line-clamp-2 font-medium">
                        {gig.title}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-xs font-bold">
                      <span>⭐</span>
                      <span>{gig.rating}</span>
                      <span className="text-slate-400 font-normal">({gig.reviews})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Starting at</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">${gig.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <button
              onClick={() => navigate('/skills')}
              className="border border-blue-500 text-blue-600 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-600/20 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm cursor-pointer backdrop-blur-sm bg-white dark:bg-transparent"
            >
              See All Skills
            </button>
          </div>

        </div>
      </section>


      {/* ==========================================
          🌟 SECTION 6: WHY CHOOSE US / PLATFORM BENEFITS
          ========================================== */}
      <section className="w-full bg-gradient-to-r from-blue-700 via-blue-900 to-slate-950 dark:from-blue-800 dark:via-blue-950 dark:to-slate-900 py-8 sm:py-16 px-4 sm:px-6 md:px-10 shadow-2xl border-b border-white/10 text-center">
        <div className="max-w-[1200px] mx-auto space-y-6 sm:space-y-10">
          
          <h2 className="text-xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
            Make it all happen with freelancers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            
            <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-3 text-left sm:text-center group">
              <div className="w-10 h-10 shrink-0 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-400 font-bold text-sm sm:text-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">
                ⌘
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-200 leading-snug sm:leading-relaxed">
                Access a pool of talent across 700 categories
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-3 text-left sm:text-center group">
              <div className="w-10 h-10 shrink-0 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-400 font-bold text-sm sm:text-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-200 leading-snug sm:leading-relaxed">
                Enjoy a simple, easy to use matching experience
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-3 text-left sm:text-center group">
              <div className="w-10 h-10 shrink-0 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-400 font-bold text-sm sm:text-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">
                ✨
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-200 leading-snug sm:leading-relaxed">
                Get quality work done quickly and within budget
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-3 text-left sm:text-center group">
              <div className="w-10 h-10 shrink-0 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-400 font-bold text-sm sm:text-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">
                🛡️
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-200 leading-snug sm:leading-relaxed">
                Only pay when you're happy
              </p>
            </div>

          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/register')}
              className="bg-slate-900 hover:bg-slate-800 border border-blue-500 text-white px-8 py-3 sm:px-10 sm:py-3.5 rounded-xl font-bold text-xs sm:text-base transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] cursor-pointer hover:scale-105"
            >
              Join Now
            </button>
          </div>

        </div>
      </section>


      {/* ==========================================
          🌟 SECTION 7: POPULAR SERVICES
          ========================================== */}
      <section className="relative w-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white py-12 sm:py-16 px-4 sm:px-6 md:px-10 border-b border-slate-200 dark:border-white/10 transition-colors">
        <div className="max-w-[1400px] mx-auto space-y-8">
          
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow-md">
              Popular Services
            </h2>
          </div>

          <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 snap-x">
            {popularServicesData.map((service) => (
              <div
                key={service.id}
                onClick={() => handlePopularServiceClick(service.title)}
                className={`min-w-[180px] sm:min-w-0 h-[220px] sm:h-[250px] rounded-2xl p-4 flex flex-col justify-between cursor-pointer border ${service.bgColor} ${service.borderColor} shadow-xl hover:scale-105 transition-all duration-300 group snap-start relative overflow-hidden`}
              >
                <h3 className="text-sm sm:text-base font-bold text-white z-10 leading-snug drop-shadow-md">
                  {service.title}
                </h3>

                <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-slate-900/60 border border-white/10 shadow-inner group-hover:border-blue-400 transition-colors">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ==========================================
          📊 SECTION 8: PLATFORM STATISTICS
          ========================================== */}
      <section className="w-full bg-gradient-to-r from-blue-700 via-blue-900 to-slate-950 dark:from-blue-800 dark:via-blue-950 dark:to-slate-900 py-10 sm:py-14 px-4 sm:px-6 md:px-10 shadow-2xl border-b border-white/10 text-white">
        <div className="max-w-[1300px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
          
          <div className="space-y-1.5 p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg flex flex-col justify-center items-center">
            <h3 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] whitespace-nowrap">
              [ {stats.completeProjects.toLocaleString()}+ ]
            </h3>
            <p className="text-[11px] sm:text-xs font-bold tracking-wider text-cyan-300 uppercase">
              Complete Project
            </p>
          </div>

          <div className="space-y-1.5 p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg flex flex-col justify-center items-center">
            <h3 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] whitespace-nowrap">
              [ {stats.satisfiedClients.toLocaleString()}+ ]
            </h3>
            <p className="text-[11px] sm:text-xs font-bold tracking-wider text-cyan-300 uppercase">
              Satisfied Clients
            </p>
          </div>

          <div className="space-y-1.5 p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg flex flex-col justify-center items-center">
            <h3 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] whitespace-nowrap">
              [ {stats.availableJobs.toLocaleString()}+ ]
            </h3>
            <p className="text-[11px] sm:text-xs font-bold tracking-wider text-cyan-300 uppercase">
              Worker & Available Jobs
            </p>
          </div>

          <div className="space-y-1.5 p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg flex flex-col justify-center items-center">
            <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] whitespace-nowrap">
              [ ${stats.buyerSpend.toLocaleString()} ]
            </h3>
            <p className="text-[11px] sm:text-xs font-bold tracking-wider text-cyan-300 uppercase">
              Verified Buyer Spend
            </p>
          </div>

        </div>
      </section>


      {/* ==========================================
          🌟 FLOATING QUICK ACTION BUTTONS (DARK/LIGHT & WHATSAPP)
          ========================================== */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {/* ডার্ক/লাইট মোড টগল বাটন */}
        <button 
          onClick={() => setIsDarkMode(prev => !prev)}
          className="w-12 h-12 bg-white dark:bg-[#16171a] text-slate-900 dark:text-white rounded-full shadow-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-all"
          title="Toggle Dark/Light Mode"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

       {/* হোয়াটসঅ্যাপ চ্যাট বাটন */}
      <a 
        href="https://wa.me/+971568264122" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group w-12 h-12 bg-white dark:bg-[#16171a] hover:bg-[#25D366] border border-slate-200 dark:border-slate-800 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300"
        title="Chat on WhatsApp"
      >
        <svg className="w-6 h-6 text-emerald-500 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>
      </div>


      {/* ==========================================
          🌟 CUSTOM BUDGET POP-UP (MODAL)
          ========================================== */}
      {isCustomBudgetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-500/50 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-slate-900 dark:text-white">
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold">Enter Custom Budget</h3>
              <button 
                onClick={() => setIsCustomBudgetOpen(false)}
                className="text-slate-400 hover:text-black dark:hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomBudgetSave} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm text-slate-600 dark:text-gray-300 mb-1.5 font-medium">
                  Your Custom Budget ({selectedCurrency})
                </label>
                <input 
                  type="number"
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-blue-400 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  value={customBudgetInput}
                  onChange={(e) => setCustomBudgetInput(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomBudgetOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-pink-600/40 cursor-pointer transition-all"
                >
                  Set Budget
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Home;