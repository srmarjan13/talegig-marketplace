import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PrivateNavbar from './PrivateNavbar';
import PublicNavbar from './PublicNavbar';
import { useToast } from '../Home/ToastContext'; 

const CreateProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const isAuthenticated = localStorage.getItem('user') || localStorage.getItem('token');

  const [isEditing, setIsEditing] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);

  const [tabType, setTabType] = useState(location.state?.defaultType === 'contest' ? 'contest' : 'project');

  const [budgetType, setBudgetType] = useState('fixed');
  const [hourlyRateMin, setHourlyRateMin] = useState('15');
  const [hourlyRateMax, setHourlyRateMax] = useState('35');

  const [currency, setCurrency] = useState('USD');
  const [usdBudget, setUsdBudget] = useState('20');
  const [projectBudgetLevel, setProjectBudgetLevel] = useState('micro');
  
  const [deadlineValue, setDeadlineValue] = useState('2');

  // 🟢 নতুন ইউজারের জন্য মোট ২টি ফ্রি পোস্ট ট্র্যাক করার কাউন্টার
  const [freePostsCount, setFreePostsCount] = useState(() => {
    return Number(localStorage.getItem('talegig_free_posts_used') || '0');
  });
  
  const [isPayLater, setIsPayLater] = useState(false);

  // 🟢 পেমেন্ট সোর্স স্টেট (ব্যালেন্স থেকে কাটবে নাকি নতুন ব্যালেন্স অ্যাড করবে)
  const [paymentSource, setPaymentSource] = useState('balance');
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    // ইউজারের কারেন্ট ব্যালেন্স ফেচ করা (লোকালস্টোরেজ থেকে)
    const currentBal = Number(localStorage.getItem('talegig_user_balance') || '420.00');
    setUserBalance(currentBal);

    try {
      const editData = location.state?.editProject || JSON.parse(localStorage.getItem('talegig_edit_project_data') || 'null');
      if (editData) {
        setIsEditing(true);
        setEditingProjectId(editData.id);
        setProjectName(editData.title || editData.projectName || '');
        setDescription(editData.description || '');
        setSkills(Array.isArray(editData.skills) ? editData.skills : []);
        if (editData.subType) setBudgetType(editData.subType.toLowerCase());
        if (editData.type && editData.type.toLowerCase().includes('contest')) {
          setTabType('contest');
        }
      }
    } catch (e) {}
  }, [location]);

  const exchangeRates = {
    USD: 1,
    GBP: 0.79,
    EUR: 0.92,
    CAD: 1.37,
    AUD: 1.52,
    AED: 3.67,
    INR: 83.3,
    BDT: 117.5
  };

  const currencySymbols = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    CAD: 'CA$',
    AUD: 'A$',
    AED: 'AED ',
    INR: '₹',
    BDT: '৳'
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    const rate = exchangeRates[newCurrency] || 1;
    const minAllowed = Math.round(2 * rate);
    if (Number(hourlyRateMin) < minAllowed) {
      setHourlyRateMin(minAllowed.toString());
    }
    if (Number(hourlyRateMax) < minAllowed) {
      setHourlyRateMax((minAllowed + 10).toString());
    }
  };

  const handleProjectLevelChange = (level) => {
    setProjectBudgetLevel(level);
    if (level === 'micro') setUsdBudget('20');
    else if (level === 'simple') setUsdBudget('100');
    else if (level === 'very_simple') setUsdBudget('500');
    else if (level === 'small') setUsdBudget('1000');
  };

  const getProjectRangeText = (level) => {
    const rate = exchangeRates[currency] || 1;
    const sym = currencySymbols[currency];
    
    let low = 10, high = 30;
    if (level === 'simple') { low = 30; high = 250; }
    else if (level === 'very_simple') { low = 250; high = 750; }
    else if (level === 'small') { low = 750; high = 1500; }

    const convertedLow = Math.round(low * rate);
    const convertedHigh = Math.round(high * rate);

    return `${sym}${convertedLow} - ${sym}${convertedHigh} ${currency}`;
  };

  const handleBudgetInputChange = (e) => {
    const val = e.target.value;
    const rate = exchangeRates[currency] || 1;
    const inUsd = Number(val) / rate;
    setUsdBudget(inUsd >= 0 ? inUsd.toString() : '0');
  };

  const getCurrentDisplayBudget = () => {
    const rate = exchangeRates[currency] || 1;
    return (Number(usdBudget || 0) * rate).toFixed(0);
  };

  const getEstimatedEntries = () => {
    const currentUsd = Number(usdBudget) || 5;
    return Math.max(50, Math.round((currentUsd / 5) * 50));
  };

  const handleTabSwitch = (type) => {
    setTabType(type);
    setIsPayLater(false);
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, index) => index !== indexToRemove));
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (skills.length >= 5) {
        showToast('You can add up to 5 skills only.');
        return;
      }
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 25 * 1024 * 1024) {
        showToast(`${file.name} is too large. Max size is 25 MB.`);
        return false;
      }
      return true;
    });
    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (indexToRemove) => {
    setAttachedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const [projectAddons, setProjectAddons] = useState({
    recruiter: false,
    nda: false,
    ipAgreement: false,
    featured: false,
    urgent: false,
    sealed: false,
  });

  const [contestAddons, setContestAddons] = useState({
    guaranteed: true,
    featured: false,
    sealed: false,
    urgent: false,
    topContest: false,
  });

  const baseProjectPrices = {
    recruiter: 10.99,
    nda: 20.99,
    ipAgreement: 20.99,
    featured: 5.99,
    urgent: 9.99,
    sealed: 4.99,
  };

  const baseContestPrices = {
    guaranteed: 10.00,
    featured: 4.99,
    sealed: 15.99,
    urgent: 20.99,
    topContest: 5.99,
  };

  const getConvertedPrice = (basePrice) => {
    const rate = exchangeRates[currency] || 1;
    return (basePrice * rate).toFixed(2);
  };

  const isUrgentSelected = tabType === 'project' ? projectAddons.urgent : contestAddons.urgent;
  
  // ফ্রি কোটা এভেলেবল আছে কি না (২টির কম হলে ফ্রি)
  const isFreeAvailable = freePostsCount < 2;

  const calculateTotal = () => {
    const isProject = tabType === 'project';

    if (isPayLater && isFreeAvailable) return '0.00';

    let totalUsd = 0;
    const rate = exchangeRates[currency] || 1;
    
    if (isProject) {
      Object.keys(projectAddons).forEach(key => {
        if (projectAddons[key]) totalUsd += baseProjectPrices[key];
      });
    } else {
      totalUsd += Number(usdBudget) || 0;
      Object.keys(contestAddons).forEach(key => {
        if (contestAddons[key]) totalUsd += baseContestPrices[key];
      });
    }
    return (totalUsd * rate).toFixed(2);
  };

  const handleProjectToggle = (key) => {
    setProjectAddons(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContestToggle = (key) => {
    setContestAddons(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const rate = exchangeRates[currency] || 1;
  const minAllowedRate = Math.round(2 * rate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showToast('Please login first to post a project or contest!', 'error');
      navigate('/login'); 
      return;
    }
    
    if (!projectName.trim()) {
      showToast('Please enter a Project Name!', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('Please enter a Project Description!', 'error');
      return;
    }
    if (skills.length === 0) {
      showToast('Please add at least 1 required skill tag!', 'error');
      return;
    }

    const activeBadges = [];
    if (tabType === 'project') {
      if (projectAddons.recruiter) activeBadges.push('RECRUITER');
      if (projectAddons.nda) activeBadges.push('NDA');
      if (projectAddons.ipAgreement) activeBadges.push('IP AGREEMENT');
      if (projectAddons.featured) activeBadges.push('FEATURED');
      if (projectAddons.urgent) activeBadges.push('URGENT');
      if (projectAddons.sealed) activeBadges.push('SEALED');
    } else {
      if (contestAddons.guaranteed) activeBadges.push('GUARANTEED');
      if (contestAddons.featured) activeBadges.push('FEATURED');
      if (contestAddons.sealed) activeBadges.push('SEALED');
      if (contestAddons.urgent) activeBadges.push('URGENT');
      if (contestAddons.topContest) activeBadges.push('TOP CONTEST');
    }

    const finalBudgetText = tabType === 'project' 
      ? (budgetType === 'hourly' 
          ? `${currencySymbols[currency]}${hourlyRateMin} - ${currencySymbols[currency]}${hourlyRateMax} ${currency} /hr` 
          : getProjectRangeText(projectBudgetLevel))
      : `${currencySymbols[currency]}${getCurrentDisplayBudget()} ${currency}`;
    
    const numericBudgetNum = budgetType === 'hourly' 
      ? Number(hourlyRateMin) 
      : Number(getCurrentDisplayBudget() || 20);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const totalCost = Number(calculateTotal());

    const projectPayload = {
      title: projectName.trim(),
      description: description.trim(),
      budget: isNaN(numericBudgetNum) ? 20 : numericBudgetNum,
      category: skills[0] || 'General',
      type: tabType === 'project' ? 'project' : 'contest',
      subType: tabType === 'project' ? budgetType : 'Fixed',
      authorName: currentUser.name || currentUser.firstName || 'Saidur Buyer',
      userId: currentUser.id && !isNaN(parseInt(currentUser.id)) ? parseInt(currentUser.id) : 1,
      badges: activeBadges,
      skills: [...skills],
      budgetFormatted: finalBudgetText,
      totalAmount: totalCost,
      currency: currency
    };

    // 🟢 পেমেন্ট এবং ব্যালেন্স কাটার লজিক
    if (totalCost > 0 && !(isPayLater && isFreeAvailable)) {
      if (paymentSource === 'balance') {
        if (userBalance >= totalCost) {
          const newBalance = userBalance - totalCost;
          localStorage.setItem('talegig_user_balance', newBalance.toFixed(2));
          setUserBalance(newBalance);
          showToast(`Paid $${totalCost.toFixed(2)} from your balance successfully!`, 'success');
        } else {
          showToast('Insufficient balance! Please select "Add New Balance / Checkout" to pay securely.', 'error');
          return;
        }
      } else {
        // নতুন ব্যালেন্স অ্যাড করতে চাইলে চেকআউট পেজে রিডাইরেক্ট হবে
        navigate('/checkout', { state: { projectData: projectPayload, totalAmount: totalCost, currency: currency } });
        return;
      }
    } else if (isPayLater && isFreeAvailable) {
      const updatedCount = freePostsCount + 1;
      setFreePostsCount(updatedCount);
      localStorage.setItem('talegig_free_posts_used', updatedCount.toString());
      showToast(`Free post used successfully! (${updatedCount}/2 used)`, 'success');
    }

    try {
      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectPayload)
      });

      const data = await response.json();

      if (response.ok) {
        const isProject = tabType === 'project';
        const postTypeText = isProject ? 'Project' : 'Contest';

        showToast(`${postTypeText} Posted Successfully and is now live!`, 'success');

        if (isProject) {
          navigate('/allproject');
        } else {
          navigate('/allcontest');
        }
      } else {
        showToast(data.error || 'Failed to post project to database.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server connection error. Make sure backend is running.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050b1a] text-black dark:text-white transition-colors duration-300">
      {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}
      
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-start">
        
        <div className="lg:col-span-7 space-y-6 md:space-y-8 order-1 w-full overflow-hidden">
          
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-snug md:leading-tight">
              {isEditing ? 'Update your project details' : 'Tell us what you need'} <span className="text-blue-600 dark:text-blue-500">done.</span>
            </h1>
            <p className="text-slate-700 dark:text-gray-300 text-sm md:text-base mt-2.5 md:mt-3 leading-relaxed">
              Contact skilled freelancers within minutes. View profiles, ratings, portfolios and chat with me. Pay me only when you are 100% satisfied with my work.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm md:text-base font-bold text-slate-800 dark:text-gray-200">
                Project Name <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{projectName.length}/100 characters</span>
            </div>
            <textarea 
              rows="2"
              maxLength={100}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter your Project Details (Max 100 characters)"
              className="w-full bg-slate-50 dark:bg-[#111622] border border-slate-300 dark:border-gray-800 px-4 py-3.5 rounded-xl text-sm md:text-base focus:outline-none focus:border-blue-500 transition-colors resize-none text-slate-900 dark:text-white shadow-sm"
            ></textarea>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm md:text-base font-bold text-slate-800 dark:text-gray-200">
                Description <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{description.length}/5000 characters</span>
            </div>
            <textarea 
              rows="8"
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter your Project Details (Describe your project in detail...)"
              className="w-full bg-slate-50 dark:bg-[#111622] border border-slate-300 dark:border-gray-800 px-4 py-3.5 rounded-xl text-sm md:text-base focus:outline-none focus:border-blue-500 transition-colors resize-y text-slate-900 dark:text-white shadow-sm"
            ></textarea>
          </div>

          <div className="space-y-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />

            <div 
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files);
                setAttachedFiles(prev => [...prev, ...files]);
              }}
              className="border-2 border-dashed border-slate-300 dark:border-gray-700 p-5 md:p-7 rounded-2xl flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50 dark:bg-[#111622]/40 cursor-pointer hover:border-blue-500 transition-colors text-center sm:text-left"
            >
              <div className="p-3.5 bg-slate-200 dark:bg-gray-800 rounded-xl text-2xl shrink-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </div>
              <div className="flex-1">
                <p className="text-sm md:text-base text-slate-800 dark:text-gray-200 font-medium">
                  Drag and Drop any image or documents here, or <span className="text-blue-500 underline">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">(Max 25 MB)</p>
              </div>
            </div>

            {attachedFiles.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-sm font-semibold text-slate-500">Attached Files ({attachedFiles.length}):</p>
                <div className="space-y-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-100 dark:bg-[#111622] border border-slate-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-sm">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        <span className="truncate font-medium text-slate-800 dark:text-gray-200">{file.name}</span>
                      </div>
                      <button type="button" onClick={() => removeFile(index)} className="text-red-500 font-bold text-xs shrink-0 hover:underline">✕ Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-base md:text-lg font-bold">What skills are required? <span className="text-red-500">*</span></h3>
            <p className="text-sm text-slate-600 dark:text-gray-400">Add at least 1 required skill for your project (up to 5 skills).</p>

            <div className="border border-slate-300 dark:border-gray-800 p-3.5 rounded-xl bg-slate-50 dark:bg-[#111622] flex flex-wrap gap-2 items-center">
              {Array.isArray(skills) && skills.map((skill, index) => (
                <span key={index} className="bg-slate-200 dark:bg-gray-800 text-slate-800 dark:text-gray-200 text-sm px-3.5 py-2 rounded-full flex items-center gap-2 font-medium">
                  {skill} 
                  <button type="button" onClick={() => removeSkill(index)} className="hover:text-red-500 font-bold text-base">×</button>
                </span>
              ))}
              
              {skills.length < 5 && (
                <input 
                  type="text"
                  placeholder="Type a skill & press Enter"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleAddSkill}
                  className="bg-transparent text-sm focus:outline-none flex-1 min-w-[160px] py-2 text-slate-900 dark:text-white placeholder-slate-400"
                />
              )}
            </div>
          </div>

          <div className="pt-2 sm:pt-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">How would you like to get it done?</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div onClick={() => handleTabSwitch('project')} className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${tabType === 'project' ? 'border-pink-500 bg-slate-50 dark:bg-[#111622] shadow-md shadow-pink-500/10' : 'border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0b0f19] opacity-70'}`}>
                <h3 className="font-bold text-base md:text-lg mb-1.5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  Post a Project
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">Receive free quotes. Best for when you have a specific idea.</p>
              </div>

              <div onClick={() => handleTabSwitch('contest')} className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${tabType === 'contest' ? 'border-pink-500 bg-slate-50 dark:bg-[#111622] shadow-md shadow-pink-500/10' : 'border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0b0f19] opacity-70'}`}>
                <h3 className="font-bold text-base md:text-lg mb-1.5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                  Start a Contest
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">Crowdsource ideas. Post a prize and get competing entries.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-2xl md:text-3xl font-bold">Set your budget <span className="text-red-500">*</span></h3>
              
              {tabType === 'project' && (
                <div className="flex bg-slate-100 dark:bg-[#111622] p-1 rounded-xl border border-slate-300 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setBudgetType('fixed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${budgetType === 'fixed' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400'}`}
                  >
                    Fixed Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetType('hourly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${budgetType === 'hourly' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400'}`}
                  >
                    Hourly Rate
                  </button>
                </div>
              )}
            </div>

            {tabType === 'contest' && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-center shadow-sm">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10">
                    <h4 className="text-xs md:text-sm font-bold tracking-wider text-white mb-1">RESULT ACCORDING TO YOUR BUDGET</h4>
                    <p className="text-sm text-gray-200">Expect around {getEstimatedEntries()} entries</p>
                  </div>
                </div>

                <input 
                  type="range" 
                  min={exchangeRates[currency] * 5} 
                  max={exchangeRates[currency] * 500} 
                  value={getCurrentDisplayBudget()} 
                  onChange={(e) => {
                    const rate = exchangeRates[currency] || 1;
                    setUsdBudget((Number(e.target.value) / rate).toString());
                  }} 
                  className="w-full accent-pink-600 cursor-pointer h-2.5 bg-gray-700 rounded-lg" 
                />
                <div className="text-2xl font-bold">{currencySymbols[currency]}{getCurrentDisplayBudget()} {currency}</div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              
              <div className="relative sm:col-span-3">
                <select 
                  value={currency} 
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#111622] border border-slate-300 dark:border-gray-800 px-4 py-3.5 rounded-xl text-sm md:text-base focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="CAD">CAD (CA$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="BDT">BDT (৳)</option>
                </select>
                <span className="absolute right-4 top-4 text-sm pointer-events-none">▼</span>
              </div>

              {tabType === 'project' && budgetType === 'hourly' ? (
                <div className="sm:col-span-5 space-y-1">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#111622] border border-slate-300 dark:border-gray-800 px-3.5 py-3 rounded-xl">
                    <input 
                      type="number"
                      min={minAllowedRate}
                      value={hourlyRateMin}
                      onChange={(e) => setHourlyRateMin(e.target.value)}
                      placeholder="Min"
                      className="w-full bg-transparent text-sm focus:outline-none text-center font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-slate-400 text-xs">to</span>
                    <input 
                      type="number"
                      min={minAllowedRate}
                      value={hourlyRateMax}
                      onChange={(e) => setHourlyRateMax(e.target.value)}
                      placeholder="Max"
                      className="w-full bg-transparent text-sm focus:outline-none text-center font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">/ hr</span>
                  </div>
                </div>
              ) : tabType === 'project' ? (
                <div className="relative sm:col-span-5">
                  <select 
                    value={projectBudgetLevel} 
                    onChange={(e) => handleProjectLevelChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#111622] border border-slate-300 dark:border-gray-800 px-4 py-3.5 rounded-xl text-sm md:text-base focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="micro">{getProjectRangeText('micro')}</option>
                    <option value="simple">{getProjectRangeText('simple')}</option>
                    <option value="very_simple">{getProjectRangeText('very_simple')}</option>
                    <option value="small">{getProjectRangeText('small')}</option>
                  </select>
                  <span className="absolute right-4 top-4 text-sm pointer-events-none">▼</span>
                </div>
              ) : (
                <div className="relative sm:col-span-5">
                  <input 
                    type="number"
                    min={Math.round(5 * (exchangeRates[currency] || 1))}
                    value={getCurrentDisplayBudget()}
                    onChange={handleBudgetInputChange}
                    placeholder="Budget"
                    className="w-full bg-slate-50 dark:bg-[#111622] border border-slate-300 dark:border-gray-800 px-4 py-3.5 rounded-xl text-sm md:text-base focus:outline-none placeholder:text-slate-400 dark:placeholder:text-gray-500"
                  />
                </div>
              )}

              <div className="sm:col-span-4 relative">
                <input 
                  type="number"
                  min={isUrgentSelected ? 1 : 2}
                  value={deadlineValue}
                  onChange={(e) => setDeadlineValue(e.target.value)}
                  placeholder={isUrgentSelected ? "Deadline (Hours)" : "Deadline (Min 2 Days)"}
                  className="w-full bg-slate-50 dark:bg-[#111622] border border-slate-300 dark:border-gray-800 px-4 py-3.5 rounded-xl text-sm md:text-base focus:outline-none placeholder:text-slate-400"
                />
                <span className="absolute right-4 top-4 text-xs font-bold text-slate-400 pointer-events-none">
                  {isUrgentSelected ? 'Hours' : 'Days'}
                </span>
              </div>

            </div>

            <div className="space-y-3 pt-2">
              {tabType === 'project' && (
                <>
                  <AddonRow checked={projectAddons.recruiter} onChange={() => handleProjectToggle('recruiter')} badge="RECRUITER" badgeBg="bg-purple-600" desc="One of our experts will find and recommend the perfect freelancer." price={`${currencySymbols[currency]}${getConvertedPrice(baseProjectPrices.recruiter)} ${currency}`} />
                  <AddonRow checked={projectAddons.nda} onChange={() => handleProjectToggle('nda')} badge="NDA" badgeBg="bg-blue-600" desc="Freelancers must sign a Non-disclosure Agreement." price={`${currencySymbols[currency]}${getConvertedPrice(baseProjectPrices.nda)} ${currency}`} />
                  <AddonRow checked={projectAddons.ipAgreement} onChange={() => handleProjectToggle('ipAgreement')} badge="IP AGREEMENT" badgeBg="bg-pink-700" desc="Require your Freelancer to sign an Intellectual Property Agreement." price={`${currencySymbols[currency]}${getConvertedPrice(baseProjectPrices.ipAgreement)} ${currency}`} />
                  <AddonRow checked={projectAddons.featured} onChange={() => handleProjectToggle('featured')} badge="FEATURED" badgeBg="bg-amber-600" desc="Attract more freelancers with prominent placement." price={`${currencySymbols[currency]}${getConvertedPrice(baseProjectPrices.featured)} ${currency}`} />
                  <AddonRow checked={projectAddons.urgent} onChange={() => handleProjectToggle('urgent')} badge="URGENT" badgeBg="bg-red-600" desc="Make your project stand out as time sensitive." price={`${currencySymbols[currency]}${getConvertedPrice(baseProjectPrices.urgent)} ${currency}`} />
                  <AddonRow checked={projectAddons.sealed} onChange={() => handleProjectToggle('sealed')} badge="SEALED" badgeBg="bg-sky-500" desc="Hide proposal from other freelancers for unique proposals." price={`${currencySymbols[currency]}${getConvertedPrice(baseProjectPrices.sealed)} ${currency}`} />
                </>
              )}

              {tabType === 'contest' && (
                <>
                  <AddonRow checked={contestAddons.guaranteed} onChange={() => handleContestToggle('guaranteed')} badge="GUARANTEED" badgeBg="bg-green-600" desc="Guarantee freelancers that a winner will be chosen." price={`${currencySymbols[currency]}${getConvertedPrice(baseContestPrices.guaranteed)} ${currency}`} />
                  <AddonRow checked={contestAddons.featured} onChange={() => handleContestToggle('featured')} badge="FEATURED" badgeBg="bg-amber-600" desc="Freelancers must sign NDA to see details." price={`${currencySymbols[currency]}${getConvertedPrice(baseContestPrices.featured)} ${currency}`} />
                  <AddonRow checked={contestAddons.sealed} onChange={() => handleContestToggle('sealed')} badge="SEALED" badgeBg="bg-sky-500" desc="Only you can see individual entries." price={`${currencySymbols[currency]}${getConvertedPrice(baseContestPrices.sealed)} ${currency}`} />
                  <AddonRow checked={contestAddons.urgent} onChange={() => handleContestToggle('urgent')} badge="URGENT" badgeBg="bg-red-600" desc="Receive faster response in 1 day." price={`${currencySymbols[currency]}${getConvertedPrice(baseContestPrices.urgent)} ${currency}`} />
                  <AddonRow checked={contestAddons.topContest} onChange={() => handleContestToggle('topContest')} badge="TOP CONTEST" badgeBg="bg-purple-700" desc="We will contact top freelancers to join." price={`${currencySymbols[currency]}${getConvertedPrice(baseContestPrices.topContest)} ${currency}`} />
                </>
              )}
            </div>

            {/* ফ্রি কোটা অপশন */}
            <div className={`p-4 rounded-xl bg-slate-100 dark:bg-[#111622] border border-slate-200 dark:border-gray-800 flex items-center justify-between gap-3 ${!isFreeAvailable ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="payLater"
                  checked={isPayLater}
                  onChange={(e) => setIsPayLater(e.target.checked)}
                  disabled={!isFreeAvailable}
                  className={`w-5 h-5 accent-pink-600 rounded shrink-0 ${!isFreeAvailable ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                />
                <label htmlFor="payLater" className={`text-sm sm:text-base font-medium leading-snug ${!isFreeAvailable ? 'cursor-not-allowed text-slate-500' : 'cursor-pointer text-slate-800 dark:text-gray-200'}`}>
                  Post Free / Pay Later <span className="inline-block mt-1 sm:mt-0 text-xs text-pink-600 font-bold bg-pink-500/10 px-2.5 py-0.5 rounded sm:ml-2">
                    {isFreeAvailable ? `Free quota available (${freePostsCount}/2 used)` : 'All 2 free posts used'}
                  </span>
                </label>
              </div>
            </div>

            {/* 🟢 পেমেন্ট চয়েস অপশন (ব্যালেন্স থেকে কাটবে নাকি নতুন ব্যালেন্স অ্যাড করবে) */}
            {Number(calculateTotal()) > 0 && !(isPayLater && isFreeAvailable) && (
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#111622] border border-slate-200 dark:border-gray-800 space-y-3">
                <p className="text-sm font-bold text-slate-800 dark:text-gray-200">
                  Select Payment Option (Required: ${calculateTotal()} USD):
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium">
                    <input 
                      type="radio" 
                      name="paymentSource" 
                      checked={paymentSource === 'balance'} 
                      onChange={() => setPaymentSource('balance')} 
                      className="accent-pink-600 w-4 h-4"
                    />
                    Pay from Current Balance (Available: ${userBalance.toFixed(2)})
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium">
                    <input 
                      type="radio" 
                      name="paymentSource" 
                      checked={paymentSource === 'add_funds'} 
                      onChange={() => setPaymentSource('add_funds')} 
                      className="accent-pink-600 w-4 h-4"
                    />
                    Add New Balance / Checkout
                  </label>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200 dark:border-gray-800 gap-4">
              <div className="text-xl md:text-2xl font-bold text-center sm:text-left w-full sm:w-auto text-slate-900 dark:text-white">
                Total <span className="block sm:inline mt-1 sm:mt-0 text-slate-800 dark:text-gray-200 font-extrabold">
                  {isPayLater && isFreeAvailable 
                    ? `0.00 ${currency} (Free Post)` 
                    : `${currencySymbols[currency]}${calculateTotal()} ${currency}`}
                </span>
              </div>
              <button 
                type="submit"
                className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold px-10 py-4 rounded-xl shadow-lg transition-all text-base cursor-pointer shrink-0"
              >
                {isEditing ? 'Update Project' : 'Proceed to Post'}
              </button>
            </div>

          </div>

        </div>

        <div className="hidden lg:flex lg:col-span-5 lg:sticky lg:top-6 justify-center items-center relative order-2">
          <div className="absolute w-72 h-72 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-3xl -z-10"></div>
          <div className="w-full max-w-md p-2 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" 
              alt="TaleGig 3D Banner" 
              className="w-full h-[450px] object-cover rounded-2xl shadow-inner"
            />
          </div>
        </div>

      </form>
    </div>
  );
};

const AddonRow = ({ checked, onChange, badge, badgeBg, desc, price }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 md:p-5 rounded-xl bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-gray-800">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={onChange}
          className="w-6 h-6 accent-pink-600 cursor-pointer rounded shrink-0 mt-0.5 sm:mt-0"
        />
        <div className="min-w-0">
          <span className={`inline-block text-xs font-bold text-white px-3 py-1 rounded-md mb-1 ${badgeBg}`}>
            {badge}
          </span>
          <p className="text-sm md:text-base text-slate-700 dark:text-gray-300 leading-normal break-words">
            {desc}
          </p>
        </div>
      </div>
      <div className="font-bold text-sm md:text-base shrink-0 self-end sm:self-center pl-9 sm:pl-2">
        {price}
      </div>
    </div>
  );
};

export default CreateProject;