// client/src/pages/Profile.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import PrivateNavbar from './PrivateNavbar';
import PublicNavbar from './PublicNavbar';
import { useToast } from '../Home/ToastContext';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isAuthenticated = user?.isLoggedIn;
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState(() => {
    
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || localStorage.getItem('talegig_user') || '{}');
      
      const storedRole = localStorage.getItem('userRole') || user?.role || storedUser.role || 'buyer';
      const autoJoinedRaw = storedUser.joinDate || storedUser.joined || user?.joined || '';

      let autoCountry = storedUser.country || storedUser.location || user?.country || '';
      if (!autoCountry) {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz && tz.includes('/')) {
            const parts = tz.split('/');
            autoCountry = `${parts[parts.length - 1].replace(/_/g, ' ')}, ${parts[0].replace(/_/g, ' ')}`;
          } else {
            autoCountry = 'Not Found';
          }
        } catch (err) {
          autoCountry = 'Not Found';
        }
      }

      const hasPaymentMethod = Boolean(
        localStorage.getItem('talegig_payment_verified') === 'true' ||
        localStorage.getItem('talegig_payment_methods') || 
        localStorage.getItem('user_cards') || 
        storedUser.paymentVerified
      );

      const rawUsername = user?.username || storedUser.username || '';
      const cleanUsername = rawUsername && rawUsername !== '@user' ? rawUsername.replace(/^@+/, '') : '';

      const rawName = user?.name || storedUser.name || (storedUser.firstName ? `${storedUser.firstName} ${storedUser.lastName || ''}`.trim() : '');
      const validName = rawName && rawName !== 'User' && rawName !== 'Not Found' ? rawName : '';

      const validEmail = storedUser.email || user?.email || '';

      // 🟢 জয়েন ডেট না পেলে 'Not Found' দেখাবে, হার্ডকোড নয়
      let formattedJoined = 'Not Found';
      if (autoJoinedRaw) {
        if (autoJoinedRaw.startsWith('Joined on')) {
          formattedJoined = autoJoinedRaw;
        } else {
          formattedJoined = `Joined on ${autoJoinedRaw}`;
        }
      }

      // 🟢 আওয়ারলি রেট সর্বনিম্ন ২ বা তার বেশি নিশ্চিত করা এবং লোকালস্টোর থেকে সঠিক মান নেওয়া
      const initialHourlyRate = storedUser.hourlyRateNum ? storedUser.hourlyRateNum.toString() : '0';

      return {
        username: cleanUsername ? `@${cleanUsername}` : 'Not Found',
        name: validName || 'Not Found',
        email: validEmail,
        role: storedRole,
        bio: storedUser.bio || '',
        title: storedUser.title || 'Change Your Professional Title',
        country: autoCountry || 'Not Found',
        joined: formattedJoined,
        hourlyRateNum: initialHourlyRate,
        paymentVerified: hasPaymentMethod,
        hireRate: storedUser.hireRate || 0,
        profilePic: storedUser.profilePic || storedUser.avatar || user?.avatar || '',
        coverPic: storedUser.coverPic || '',
        availability: false,
        boosted: false,
        isMember: storedUser.isMember ?? false
      };
    } catch (e) {
      return { 
        role: 'Not Found', 
        name: 'Not Found', 
        email: '',
        username: 'Not Found', 
        country: 'Not Found', 
        joined: 'Not Found', 
        paymentVerified: false, 
        hireRate: 'Not Found',
        profilePic: '',
        coverPic: ''
      };
    }
  });

  // 🟢 ব্যাকএন্ড থেকে ইউজারের আসল প্রোফাইল ডেটা ফেচ করার লজিক
  useEffect(() => {
    const fetchBackendProfile = async () => {
      try {
        const email = currentUser.email || user?.email;
        if (email) {
          const res = await fetch(`http://localhost:3001/api/users/profile?email=${encodeURIComponent(email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data) {
              setCurrentUser(prev => ({
                ...prev,
                name: data.name || prev.name,
                username: data.username ? (data.username.startsWith('@') ? data.username : `@${data.username}`) : prev.username,
                country: data.location || prev.country,
                title: data.title || prev.title,
                bio: data.bio || prev.bio,
                hourlyRateNum: data.hourlyRateNum !== undefined && data.hourlyRateNum !== null ? data.hourlyRateNum.toString() : (prev.hourlyRateNum || '0'),
                profilePic: data.profilePic || prev.profilePic,
                coverPic: data.coverPic || prev.coverPic
              }));
            }
          }
        }
      } catch (err) {
        console.error("Backend profile sync error:", err);
      }
    };
    fetchBackendProfile();
  }, [currentUser.email, user]);
  
  useEffect(() => {
    try { 
      if (currentUser.name && currentUser.name !== 'Not Found') {
        localStorage.setItem('user', JSON.stringify(currentUser)); 
      }
    } catch(e){}
  }, [currentUser]);

  const [isIdVerified, setIsIdVerified] = useState(() => {
    try {
      const kyc = JSON.parse(localStorage.getItem('talegig_id_verification') || '{}');
      const settings = JSON.parse(localStorage.getItem('talegig_user_settings') || '{}').idVerification || {};
      return kyc.verifiedStatus === 'Verified' || settings.verifiedStatus === 'Verified';
    } catch(e) { return false; }
  });

  useEffect(() => {
    const checkVerification = () => {
      try {
        const kyc = JSON.parse(localStorage.getItem('talegig_id_verification') || '{}');
        const settings = JSON.parse(localStorage.getItem('talegig_user_settings') || '{}').idVerification || {};
        setIsIdVerified(kyc.verifiedStatus === 'Verified' || settings.verifiedStatus === 'Verified');
      } catch(e) {}
    };
    window.addEventListener('storage', checkVerification);
    checkVerification();
    return () => window.removeEventListener('storage', checkVerification);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const isVerified = localStorage.getItem('talegig_payment_verified') === 'true';
      if (isVerified) {
        setCurrentUser(prev => ({ ...prev, paymentVerified: true }));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [allEarningsData, setAllEarningsData] = useState(() => {
    try {
      const sources = [
        'talegig_orders', 'user_orders', 'orders', 'gigs_orders',
        'talegig_proposals', 'proposals',
        'talegig_contests', 'contests_won',
        'talegig_custom_offers', 'custom_offers'
      ];
      let combined = [];
      for (let s of sources) {
        const d = localStorage.getItem(s);
        if (d) {
          const parsed = JSON.parse(d);
          if (Array.isArray(parsed)) {
            combined = [...combined, ...parsed];
          }
        }
      }
      return combined;
    } catch (e) { console.error(e); }
    return [];
  });

  const [userReviews, setUserReviews] = useState(() => {
    try {
      const savedReviews = localStorage.getItem('talegig_reviews') || localStorage.getItem('reviews');
      if (savedReviews) {
        const parsed = JSON.parse(savedReviews);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { console.error(e); }
    return [];
  });

  const completedProjectsList = allEarningsData.filter(o => o.status === 'completed' || o.isComplete || o.completed || o.paid);
  const runningProjectsList = allEarningsData.filter(o => o.status === 'running' || o.status === 'active' || o.status === 'pending' || o.status === 'incomplete' || (!o.completed && !o.paid));
  
  const totalCompletedCount = completedProjectsList.length;
  const totalRunningCount = runningProjectsList.length;
  const totalProjectCount = totalCompletedCount + totalRunningCount;
  const calculatedCompleteRate = totalProjectCount > 0 ? Math.round((totalCompletedCount / totalProjectCount) * 100) : 0;

  const dynamicTotalEarning = completedProjectsList.reduce((acc, curr) => acc + Number(curr.price || curr.total || curr.amount || 0), 0);

  const totalTrackedHours = allEarningsData
    .filter(o => o.type === 'hourly' || o.rateType === 'hourly' || o.hours)
    .reduce((acc, curr) => acc + Number(curr.hoursWorked || curr.hours || 0), 0);
  
  const buyerTotalHours = totalTrackedHours > 0 ? `${totalTrackedHours} hrs` : `${totalCompletedCount * 10} hrs`;

  const [completeCurrentPage, setCompleteCurrentPage] = useState(1);
  const [runningCurrentPage, setRunningCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastComplete = completeCurrentPage * itemsPerPage;
  const indexOfFirstComplete = indexOfLastComplete - itemsPerPage;
  const currentCompleteList = completedProjectsList.slice(indexOfFirstComplete, indexOfLastComplete);
  const totalCompletePages = Math.ceil(completedProjectsList.length / itemsPerPage);

  const indexOfLastRunning = runningCurrentPage * itemsPerPage;
  const indexOfFirstRunning = indexOfLastRunning - itemsPerPage;
  const currentRunningList = runningProjectsList.slice(indexOfFirstRunning, indexOfLastRunning);
  const totalRunningPages = Math.ceil(runningProjectsList.length / itemsPerPage);

    const handleSaveHourlyRate = () => {
    const rateVal = Number(hourlyNumInput);
    if (rateVal < 2) {
      showToast('Hourly rate must be at least 2 USD!', 'error');
      return;
    }
    const updatedUser = { ...currentUser, hourlyRateNum: hourlyNumInput };
    setCurrentUser(updatedUser);
    setIsEditingHourly(false);
    try {
      localStorage.setItem('talegig_user', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('talegig_user_session', JSON.stringify(updatedUser));
    } catch (e) {}
    showToast('Hourly rate updated successfully!', 'success');
  };

  const [dynamicResponseTime, setDynamicResponseTime] = useState('0-1 hr');
  useEffect(() => {
    try {
      const chatLogs = JSON.parse(localStorage.getItem('talegig_chat_response_times') || '[]');
      if (Array.isArray(chatLogs) && chatLogs.length > 0) {
        const avgMins = chatLogs.reduce((a, b) => a + b, 0) / chatLogs.length;
        if (avgMins < 60) setDynamicResponseTime(`${Math.round(avgMins)} mins`);
        else if (avgMins < 1440) setDynamicResponseTime(`${(avgMins / 60).toFixed(1)} hrs`);
        else setDynamicResponseTime(`${(avgMins / 1440).toFixed(1)} days`);
      }
    } catch (e) {}
  }, []);

  const dynamicReviewsCount = userReviews.length;
  const numericRating = userReviews.length > 0 
    ? Number((userReviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / userReviews.length).toFixed(1))
    : (completedProjectsList.length > 0 ? 4.8 : 0.0);
  const dynamicRatingStr = numericRating.toFixed(1);

  // 🟢 অথেন্টিকেটেড ইউজার সিঙ্ক করার লজিক (ফেক নাম ওভাররাইড রোধ করা)
  useEffect(() => {
    const activeRole = localStorage.getItem('userRole') || user?.role || 'seller';
    const activeName = user?.name || '';
    let activeUsername = user?.username || '';
    if (activeUsername) {
      activeUsername = activeUsername.replace(/^@+/, '');
    }
    
    setCurrentUser(prev => ({
      ...prev,
      role: activeRole,
      name: activeName && activeName !== 'User' ? activeName : prev.name,
      username: activeUsername && activeUsername !== 'user' ? `@${activeUsername}` : prev.username
    }));
  }, [user]);

  const [isPublicView, setIsPublicView] = useState(false);
  const [activeTab, setActiveTab] = useState(currentUser.role === 'buyer' ? 'My Post' : 'Protfolio');
  const [reviewTab, setReviewTab] = useState('Complete Project');

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(currentUser.title);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(currentUser.bio);

  const [isEditingHourly, setIsEditingHourly] = useState(false);
  const [hourlyNumInput, setHourlyNumInput] = useState(currentUser.hourlyRateNum);

  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [boostCategoryInput, setBoostCategoryInput] = useState('Logo Design');
  const [boostSpecialtyInput, setBoostSpecialtyInput] = useState('Brand Identity Expert');
  const [boostViews, setBoostViews] = useState(100);
  const [boostType, setBoostType] = useState('total');

const [portfolioList, setPortfolioList] = useState(() => {
    try {
      const saved = localStorage.getItem('talegig_portfolios');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(item => ({
            ...item,
            skills: typeof item.skills === 'string' 
              ? item.skills.split(',').map(s => s.trim()).filter(Boolean)
              : (Array.isArray(item.skills) ? item.skills : ['Design'])
          }));
        }
      }
    } catch (e) { console.error(e); }
    return [];
  });

  const [userGigs, setUserGigs] = useState(() => {
    try {
      const keys = ['talegig_gigs', 'user_gigs', 'gigs', 'seller_gigs'];
      for (let key of keys) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) { console.error(e); }
    return [];
  });

  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [selectedGig, setSelectedGig] = useState(null);
  
  // 🟢 URL থেকে সরাসরি পোর্টফোলিও আইডি চেক করে অন্য ব্রাউজারে বা ইনকগনিটো ট্যাবে ওপেন করার লজিক
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projectId = params.get('project');
    if (projectId && portfolioList.length > 0) {
      const found = portfolioList.find(p => String(p.id) === String(projectId));
      if (found) setSelectedPortfolio(found);
    }
  }, [location.search, portfolioList]);

  // 🟢 ব্যাকএন্ড থেকে পোর্টফোলিও ডেটা সিঙ্ক করার লজিক
  useEffect(() => {
    const fetchBackendPortfolios = async () => {
      try {
        const email = currentUser?.email || JSON.parse(localStorage.getItem('user') || '{}')?.email;
        if (email) {
          const res = await fetch(`http://localhost:3001/api/users/profile?email=${encodeURIComponent(email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.portfolio) && data.portfolio.length > 0) {
              setPortfolioList(data.portfolio);
            }
          }
        }
      } catch (err) {
        console.error("Backend portfolio fetch error:", err);
      }
    };
    fetchBackendPortfolios();
  }, []);

  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    role: '',
    desc: '',
    currentSkillInput: '',
    skills: [],
    images: []
  });

  const portfolioImagesInputRef = useRef(null);

  const [languagesList, setLanguagesList] = useState(() => {
    try {
      const saved = localStorage.getItem('talegig_languages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [tempLanguages, setTempLanguages] = useState([]);

  const [educationList, setEducationList] = useState(() => {
    try {
      const saved = localStorage.getItem('talegig_education');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [tempEducation, setTempEducation] = useState([]);

  const [experienceList, setExperienceList] = useState(() => {
    try {
      const saved = localStorage.getItem('talegig_experience');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [tempExperience, setTempExperience] = useState([]);

  const [skillsList, setSkillsList] = useState(() => {
    try {
      const savedSkills = localStorage.getItem('talegig_user_skills');
      return savedSkills ? JSON.parse(savedSkills) : [];
    } catch (e) { return []; }
  });
  const [newSkillInput, setNewSkillInput] = useState('');
  const maxFreeSkills = 10;

  const coverInputRef = useRef(null);
  const profileInputRef = useRef(null);

  // 🟢 ল্যাঙ্গুয়েজ ব্যাকএন্ডে সিঙ্ক করা
  useEffect(() => {
    try { 
      localStorage.setItem('talegig_languages', JSON.stringify(languagesList)); 
      const email = currentUser?.email || JSON.parse(localStorage.getItem('user') || '{}')?.email;
      if (email) {
        fetch('http://localhost:3001/api/users/languages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, languages: languagesList })
        }).catch(err => console.error("Backend languages sync error:", err));
      }
    } catch(e){}
  }, [languagesList]);

  // 🟢 এডুকেশন ব্যাকএন্ডে সিঙ্ক করা
  useEffect(() => {
    try { 
      localStorage.setItem('talegig_education', JSON.stringify(educationList)); 
      const email = currentUser?.email || JSON.parse(localStorage.getItem('user') || '{}')?.email;
      if (email) {
        fetch('http://localhost:3001/api/users/education', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, education: educationList })
        }).catch(err => console.error("Backend education sync error:", err));
      }
    } catch(e){}
  }, [educationList]);

  // 🟢 এক্সপেরিয়েন্স ব্যাকএন্ডে সিঙ্ক করা
  useEffect(() => {
    try { 
      localStorage.setItem('talegig_experience', JSON.stringify(experienceList)); 
      const email = currentUser?.email || JSON.parse(localStorage.getItem('user') || '{}')?.email;
      if (email) {
        fetch('http://localhost:3001/api/users/experience', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, experience: experienceList })
        }).catch(err => console.error("Backend experience sync error:", err));
      }
    } catch(e){}
  }, [experienceList]);

  // 🟢 ইউজার ডাটা লোকালস্টোরেজে পার্মানেন্ট সেভ করা (ছবিসহ)
  useEffect(() => {
    try { 
      if (currentUser.name && currentUser.name !== 'User') {
        localStorage.setItem('talegig_user', JSON.stringify(currentUser)); 
        localStorage.setItem('user', JSON.stringify(currentUser)); 
        localStorage.setItem('talegig_user_session', JSON.stringify(currentUser)); 
      }
    } catch(e){}
  }, [currentUser]);

  useEffect(() => {
    try { localStorage.setItem('talegig_user_skills', JSON.stringify(skillsList)); } catch(e){}
  }, [skillsList]);

  useEffect(() => {
    try { localStorage.setItem('talegig_languages', JSON.stringify(languagesList)); } catch(e){}
  }, [languagesList]);

  useEffect(() => {
    try { localStorage.setItem('talegig_education', JSON.stringify(educationList)); } catch(e){}
  }, [educationList]);

  useEffect(() => {
    try { localStorage.setItem('talegig_experience', JSON.stringify(experienceList)); } catch(e){}
  }, [experienceList]);

  // 🟢 লোকালস্টোরেজের পাশাপাশি ব্যাকএন্ডেও পোর্টফোলিও আপডেট পাঠানোর লজিক
  useEffect(() => {
    try { 
      localStorage.setItem('talegig_portfolios', JSON.stringify(portfolioList)); 
      const email = currentUser?.email || JSON.parse(localStorage.getItem('user') || '{}')?.email;
      if (email && portfolioList.length > 0) {
        fetch('http://localhost:3001/api/users/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, portfolio: portfolioList })
        }).catch(err => console.error("Backend portfolio sync error:", err));
      }
    } catch(e){}
  }, [portfolioList]);

  useEffect(() => {
    if (currentUser.role === 'buyer') {
      setActiveTab('My Post');
    }
  }, [currentUser.role]);

// 🟢 কভার বা প্রোফাইল ছবি কমপ্রেস ও রিসাইজ করার ফাংশন (Quota Error এড়াতে)
  const compressImage = (base64Str, maxWidth = 800, maxHeight = 600, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  };

  // 🟢 আপডেট করা ছবি আপলোড হ্যান্ডলার (কভার ও প্রোফাইল উভয়ের জন্য নিরাপদ)
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressedImage = await compressImage(reader.result);
          setCurrentUser(prev => {
            const updatedUser = {
              ...prev,
              coverPic: type === 'cover' ? compressedImage : prev.coverPic,
              profilePic: type === 'profile' ? compressedImage : prev.profilePic
            };
            try {
              localStorage.setItem('talegig_user', JSON.stringify(updatedUser));
              localStorage.setItem('user', JSON.stringify(updatedUser));
              localStorage.setItem('talegig_user_session', JSON.stringify(updatedUser));
            } catch (storageErr) {
              showToast('Storage quota exceeded! Please choose a smaller image file.','error');
            }
            return updatedUser;
          });

          // ব্যাকএন্ডে ছবি আপডেট করার রিকোয়েস্ট
          await fetch('http://localhost:3001/api/users/update-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email, type, image: compressedImage })
          });
        } catch (err) {
          showToast('Failed to process image. Please try another one.','error');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultiplePortfolioImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (newPortfolio.images.length + files.length > 5) {
      showToast('You can upload a maximum of 5 images per project.','error');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPortfolio(prev => ({
          ...prev,
          images: [...prev.images, reader.result].slice(0, 5)
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const moveImage = (index, direction) => {
    const newImages = [...newPortfolio.images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    setNewPortfolio(prev => ({ ...prev, images: newImages }));
  };

  const movePortfolioCard = (index, direction) => {
    const updated = [...portfolioList];
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setPortfolioList(updated);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && newPortfolio.currentSkillInput.trim()) {
      e.preventDefault();
      if (newPortfolio.skills.length >= 5) {
        showToast('Maximum 5 skills allowed.','error');
        return;
      }
      if (!newPortfolio.skills.includes(newPortfolio.currentSkillInput.trim())) {
        setNewPortfolio(prev => ({
          ...prev,
          skills: [...prev.skills, prev.currentSkillInput.trim()],
          currentSkillInput: ''
        }));
      }
    }
  };

  const removeTagTag = (tagToRemove) => {
    setNewPortfolio(prev => ({
      ...prev,
      skills: prev.skills.filter(t => t !== tagToRemove)
    }));
  };

  const handleSavePortfolio = () => {
    if (portfolioList.length >= 2 && !currentUser.isMember) {
      showToast('You have reached the free limit of 2 portfolios. Upgrade your membership to add more.','error');
      navigate(`/sellerdashboard?tab=membership&role=${currentUser.role}`);
      return;
    }

    if (!newPortfolio.title.trim() || !newPortfolio.desc.trim()) {
      showToast('Please fill in both Project Title and Description.','error');
      return;
    }

    const newItem = {
      id: Date.now(),
      title: newPortfolio.title,
      role: newPortfolio.role || 'Contributor',
      desc: newPortfolio.desc,
      skills: newPortfolio.skills.length > 0 ? newPortfolio.skills : ['Design', 'Web'],
      images: newPortfolio.images.length > 0 ? newPortfolio.images : ['https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=500']
    };

    setPortfolioList([...portfolioList, newItem]);
    setNewPortfolio({ title: '', role: '', desc: '', currentSkillInput: '', skills: [], images: [] });
    setIsPortfolioModalOpen(false);
  };

const handleAddSkill = async () => {
    if (!newSkillInput.trim()) return;
    if (skillsList.length >= maxFreeSkills) {
      showToast('You have reached the 10 skills limit for normal users.', 'error');
      navigate(`/sellerdashboard?tab=membership&role=${currentUser.role}`);
      return;
    }
    if (!skillsList.includes(newSkillInput.trim())) {
      const updated = [...skillsList, newSkillInput.trim()];
      setSkillsList(updated);
      setNewSkillInput('');
      
      try {
        // ১. লোকালস্টোরেজ আপডেট
        localStorage.setItem('talegig_user_skills', JSON.stringify(updated));
        
        // ২. ব্যাকএন্ড ডাটাবেসে পার্মানেন্ট সেভ করার জন্য এপিআই কল
        await fetch('http://localhost:3001/api/users/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentUser.email, skills: updated })
        });
      } catch (e) {
        console.error("Failed to save skill to backend:", e);
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updated = skillsList.filter(s => s !== skillToRemove);
    setSkillsList(updated);
    
    try {
      // ১. লোকালস্টোরেজ আপডেট
      localStorage.setItem('talegig_user_skills', JSON.stringify(updated));
      
      // ২. ব্যাকএন্ড ডাটাবেসে আপডেট করার জন্য এপিআই কল
      await fetch('http://localhost:3001/api/users/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, skills: updated })
      });
    } catch (e) {
      console.error("Failed to remove skill from backend:", e);
    }
  };

  const handleAvailabilityToggle = async () => {
    if (!currentUser.isMember) {
      showToast('You need an active membership plan to enable Availability Badge.','success');
      navigate(`/sellerdashboard?tab=membership&role=${currentUser.role}`);
      return;
    }
    const newStatus = !currentUser.availability;
    setCurrentUser(prev => ({ ...prev, availability: newStatus }));
    try {
      await fetch('http://localhost:3001/api/users/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, availability: newStatus })
      });
    } catch(e){}
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val.length > 30) {
      showToast('Category text cannot exceed 30 characters!','error');
      return;
    }
    setBoostCategoryInput(val);
  };

  const handleSpecialtyChange = (e) => {
    const val = e.target.value;
    if (val.length > 30) {
      showToast('Specialty text cannot exceed 30 characters!','error');
      return;
    }
    setBoostSpecialtyInput(val);
  };

  const calculatedBudget = (boostViews / 10).toFixed(2);

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-white min-h-screen pb-24 transition-colors font-sans relative">
      {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}

      {/* TOP BAR EXIT PREVIEW */}
      {isPublicView && (
        <div className="bg-pink-600 text-white px-4 py-2.5 text-center text-xs font-bold flex justify-center items-center gap-4 shadow-md">
          <span>Public Profile View Mode (Editing disabled)</span>
          <button 
            onClick={() => setIsPublicView(false)}
            className="bg-black/30 hover:bg-black/50 px-3 py-1 rounded-lg text-[11px] cursor-pointer transition"
          >
            Exit Preview
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* ================= COVER & HEADER SECTION ================= */}
        <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg relative">
          
          <div className="h-48 sm:h-56 md:h-64 w-full bg-black relative flex items-center justify-center overflow-hidden border-b border-slate-800">
            {currentUser.coverPic ? (
              <img src={currentUser.coverPic} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center space-y-1 px-4">
                <span className="text-slate-400 font-extrabold tracking-widest text-sm sm:text-base uppercase block">No Cover Photo</span>
                <span className="text-[11px] text-slate-500 block">Click edit icon below to add a cover image</span>
              </div>
            )}
            
            {!isPublicView && (
              <>
                <input 
                  type="file" 
                  ref={coverInputRef} 
                  onChange={(e) => handleImageUpload(e, 'cover')} 
                  className="hidden" 
                  accept="image/*"
                />
                <button 
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute bottom-4 right-4 bg-pink-600 hover:bg-pink-700 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition cursor-pointer z-10"
                  title="Change Cover Picture"
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </>
            )}
          </div>

          <div className="px-6 sm:px-8 pb-6 pt-6 relative flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
            
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 -mt-20 sm:-mt-24 text-center md:text-left w-full md:w-auto">
              
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white dark:border-[#16171a] overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-2xl flex items-center justify-center">
                  {currentUser.profilePic ? (
                    <img src={currentUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center text-slate-400 font-extrabold text-xs uppercase tracking-wider text-center p-2">
                      No Profile
                    </div>
                  )}
                </div>

                {!isPublicView && (
                  <>
                    <input 
                      type="file" 
                      ref={profileInputRef} 
                      onChange={(e) => handleImageUpload(e, 'profile')} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <button 
                      onClick={() => profileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 bg-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition cursor-pointer text-xs z-20 border-2 border-white dark:border-[#16171a]"
                      title="Change Profile Picture"
                    >
                      <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-2 pt-2 flex flex-col items-center md:items-start">
                
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-wide flex items-center gap-2 flex-wrap justify-center md:justify-start">
                  <span>{currentUser.name}</span>
                  
                  {isIdVerified ? (
                    <span className="inline-flex items-center justify-center shrink-0 hover:scale-110 transition duration-300 cursor-pointer" title="Government ID Verified">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 10 10" style={{ enableBackground: 'new 0 0 10 10' }} xmlSpace="preserve" className="block shrink-0">
                        <g>
                          <path fill="#0B56FC" d="M5.79,0.62L5.79,0.62c0.08,0.32,0.48,0.43,0.71,0.19l0,0C7.1,0.2,8.11,0.78,7.88,1.6l0,0
                            C7.79,1.92,8.08,2.21,8.4,2.12l0,0C9.22,1.89,9.8,2.9,9.19,3.49l0,0C8.95,3.73,9.06,4.13,9.38,4.21l0,0c0.82,0.21,0.82,1.38,0,1.58
                            l0,0C9.06,5.87,8.95,6.27,9.19,6.51l0,0C9.8,7.1,9.22,8.11,8.4,7.88l0,0C8.08,7.79,7.79,8.08,7.88,8.4l0,0
                            C8.11,9.22,7.1,9.8,6.51,9.19l0,0C6.27,8.95,5.87,9.06,5.79,9.38l0,0c-0.21,0.82-1.38,0.82-1.58,0l0,0
                            C4.13,9.06,3.73,8.95,3.49,9.19l0,0C2.9,9.8,1.89,9.22,2.12,8.4l0,0c0.09-0.32-0.2-0.61-0.52-0.52l0,0C0.78,8.11,0.2,7.1,0.81,6.51
                            l0,0c0.24-0.23,0.13-0.63-0.19-0.71l0,0c-0.82-0.21-0.82-1.38,0-1.58l0,0c0.32-0.08,0.43-0.48,0.19-0.71l0,0
                            C0.2,2.9,0.78,1.89,1.6,2.12l0,0c0.32,0.09,0.61-0.2,0.52-0.52l0,0C1.89,0.78,2.9,0.2,3.49,0.81l0,0c0.23,0.24,0.63,0.13,0.71-0.19
                            l0,0C4.41-0.21,5.59-0.21,5.79,0.62z"/>
                          <path fill="#FFFFFF" d="M2.1,4.91l2.17,2.3c0.07,0.08,0.2,0.08,0.28,0L7.9,3.85c0.08-0.08,0.08-0.2,0-0.28l-0.84-0.8
                            c-0.08-0.07-0.2-0.07-0.27,0L4.4,5.16L3.23,3.84c-0.07-0.08-0.2-0.09-0.28-0.01L2.1,4.64C2.03,4.72,2.03,4.84,2.1,4.91z"/>
                        </g>
                      </svg>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0">
                      Unverified ID
                    </span>
                  )}

                  <span className="text-slate-500 dark:text-slate-400 font-normal text-lg sm:text-xl">{currentUser.username}</span>
                </h1>
                
                <div className="flex items-center justify-center md:justify-start">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 px-4 py-2 rounded-2xl text-sm font-bold text-slate-900 dark:text-white shadow-sm">
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 dark:text-slate-700 fill-none" />
                        <circle 
                          cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2.5" 
                          className="text-sky-500 dark:text-sky-400 fill-none" 
                          strokeDasharray="50.2" 
                          strokeDashoffset={50.2 - (50.2 * (currentUser.role === 'buyer' ? currentUser.hireRate : calculatedCompleteRate)) / 100} 
                        />
                      </svg>
                    </div>
                    <span>{currentUser.role === 'buyer' ? `${currentUser.hireRate}% Hire Rate` : `${calculatedCompleteRate}% Complete Project`}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-2.5 text-sm font-extrabold text-slate-700 dark:text-slate-200 pt-1">
                  <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                    {[1, 2, 3, 4, 5].map((starNum) => (
                      <svg key={starNum} className={`w-4 h-4 ${starNum <= Math.round(numericRating) ? 'fill-current text-amber-500 dark:text-amber-400' : 'fill-current text-slate-300 dark:text-slate-700'}`} viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-slate-900 dark:text-white font-black">{dynamicRatingStr}</span>
                  <span className="text-slate-400">•</span>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2 text-slate-400" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    <span>{dynamicReviewsCount} Reviews</span>
                  </div>
                </div>

                {currentUser.availability && (
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                    Available for Work
                  </div>
                )}

              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
              
              {currentUser.role === 'seller' ? (
                <div className="flex items-center gap-2">
                  {!isEditingHourly ? (
                    <div 
                      onClick={() => !isPublicView && setIsEditingHourly(true)}
                      className="text-sm sm:text-base font-extrabold text-pink-600 dark:text-pink-400 bg-pink-500/10 px-5 py-2.5 rounded-xl border border-pink-500/30 cursor-pointer hover:bg-pink-500/20 transition flex items-center gap-2 shadow-sm"
                      title="Click to edit hourly rate"
                    >
                      <span>{currentUser.hourlyRateNum} USD / Hour</span>
                      {!isPublicView && (
                        <svg className="w-4 h-4 fill-none stroke-current stroke-2 text-pink-600 dark:text-pink-400" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0b0f19] p-1.5 rounded-xl border border-pink-600">
                      <input 
                        type="number" 
                        value={hourlyNumInput}
                        onChange={(e) => setHourlyNumInput(e.target.value)}
                        placeholder="34"
                        className="bg-transparent text-sm text-slate-900 dark:text-white font-bold px-3 py-1.5 focus:outline-none w-16 text-center"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold pr-2">USD / Hour</span>
                      <button onClick={async () => {
  const rateVal = Number(hourlyNumInput);
  if (rateVal < 2) {
    showToast('Hourly rate must be at least 2 USD!', 'error');
    return;
  }
  const updated = {...currentUser, hourlyRateNum: hourlyNumInput};
  setCurrentUser(updated);
  setIsEditingHourly(false);
  
  try {
    // ১. লোকালস্টোরেজ আপডেট
    localStorage.setItem('talegig_user', JSON.stringify(updated));
    localStorage.setItem('user', JSON.stringify(updated));

    // ২. ব্যাকএন্ড ডাটাবেসে পার্মানেন্ট সেভ
    const email = currentUser.email || user?.email;
    if (email) {
      await fetch('http://localhost:3001/api/users/hourly-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, hourlyRateNum: hourlyNumInput })
      });
    }
  } catch(e) {
    console.error("Failed to save to database:", e);
  }

  showToast('Hourly rate updated successfully!', 'success');
}} className="px-4 py-1.5 bg-pink-600 text-white rounded-lg text-xs font-bold cursor-pointer">Save</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`text-sm sm:text-base font-extrabold px-5 py-2.5 rounded-xl border flex items-center gap-2 shadow-sm ${
                  currentUser.paymentVerified 
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
                    : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30'
                }`}>
                  <span>{currentUser.paymentVerified ? '✓ Buyer Payment Verified' : '⚠ Buyer Payment Unverified'}</span>
                </div>
              )}

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-bold flex items-center gap-2 py-0.5">
                <svg className="w-4 h-4 fill-current text-pink-600 dark:text-pink-500 shrink-0" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span>{currentUser.country} • {currentUser.joined}</span>
              </p>

              {!isPublicView ? (
                <div className="flex items-center gap-3 pt-2">
                  <button 
                    onClick={() => navigate(`/settings?role=${currentUser.role}`)}
                    className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition cursor-pointer"
                  >
                    Profile setting
                  </button>
                  <button 
                    onClick={() => setIsPublicView(true)}
                    className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer border border-slate-300 dark:border-slate-700 shadow-sm"
                  >
                    See Public Profile
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Profile link copied to clipboard!','success');
                    }}
                    className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition cursor-pointer"
                  >
                    Share
                  </button>
                  <button 
                    onClick={() => {
                      if (currentUser.role === 'buyer') {
                        showToast('Buyers cannot hire freelancers from their own profile view.','error');
                      } else {
                        showToast('Hire request sent successfully!','success');
                      }
                    }}
                    className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition ${
                      currentUser.role === 'buyer' 
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    }`}
                  >
                    Hire Me
                  </button>
                  <button 
                    onClick={() => setIsPublicView(false)}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shadow-sm"
                  >
                    Exit Public View
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>


        {/* ================= MAIN CONTENT GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ---------------- LEFT SIDEBAR ---------------- */}
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              {currentUser.role === 'seller' ? (
                <div className="space-y-3 text-xs sm:text-sm font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Total Earning</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">${dynamicTotalEarning} USD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Complete Project</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{totalCompletedCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Running Project</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{totalRunningCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Total Hours</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{totalTrackedHours || (totalCompletedCount * 12)} hrs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Responds time</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{dynamicResponseTime}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs sm:text-sm font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Total Spend</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">${dynamicTotalEarning} USD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Complete Project</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{totalCompletedCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Running Project</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{totalRunningCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Total Hours</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{buyerTotalHours}</span>
                  </div>
                </div>
              )}
            </div>

            {currentUser.role === 'seller' && !isPublicView && (
              <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white block">Availability Badge</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Show you are available for work</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={currentUser.availability} 
                    onChange={handleAvailabilityToggle}
                    className="toggle accent-pink-600 cursor-pointer w-10 h-6"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white block">Boost Your Profile</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Get more client views & reach</span>
                  </div>
                  <button 
                    onClick={() => setIsBoostModalOpen(true)}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-extrabold shadow transition cursor-pointer"
                  >
                    Boost Now
                  </button>
                </div>

              </div>
            )}

            {currentUser.role === 'seller' && (
              <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-xs sm:text-sm">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Languages</h4>
                  {!isPublicView && (
                    <button 
                      onClick={() => {
                        setTempLanguages([...languagesList]);
                        setIsLangModalOpen(true);
                      }}
                      className="text-pink-600 hover:text-pink-500 cursor-pointer bg-pink-500/10 p-2 rounded-xl border border-pink-500/20"
                    >
                      <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  )}
                </div>
                {languagesList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No languages added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {languagesList.map((lang) => (
                      <div key={lang.id} className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                        <span>{lang.name}</span>
                        <span className="text-slate-400 dark:text-slate-500">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentUser.role === 'seller' && (
              <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-xs sm:text-sm">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Education</h4>
                  {!isPublicView && (
                    <button 
                      onClick={() => {
                        setTempEducation([...educationList]);
                        setIsEduModalOpen(true);
                      }}
                      className="text-pink-600 hover:text-pink-500 cursor-pointer bg-pink-500/10 p-2 rounded-xl border border-pink-500/20"
                    >
                      <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  )}
                </div>
                {educationList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No education added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {educationList.map((edu) => (
                      <div key={edu.id} className="space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{edu.degree}</p>
                        <p className="text-slate-500 text-xs">{edu.years}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentUser.role === 'seller' && (
              <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-xs sm:text-sm">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Experience</h4>
                  {!isPublicView && (
                    <button 
                      onClick={() => {
                        setTempExperience([...experienceList]);
                        setIsExpModalOpen(true);
                      }}
                      className="text-pink-600 hover:text-pink-500 cursor-pointer bg-pink-500/10 p-2 rounded-xl border border-pink-500/20"
                    >
                      <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  )}
                </div>
                {experienceList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No experience added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {experienceList.map((exp) => (
                      <div key={exp.id} className="space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{exp.title}</p>
                        <p className="text-slate-500 text-xs">{exp.company} • {exp.years}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>


          {/* ---------------- RIGHT CONTENT AREA ---------------- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ১. টাইটেল সেকশন */}
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 relative">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Professional Title</h3>
                {!isPublicView && !isEditingTitle && (
                  <button 
                    onClick={() => setIsEditingTitle(true)}
                    className="text-pink-600 hover:text-pink-500 cursor-pointer bg-pink-500/10 p-2 rounded-xl border border-pink-500/20"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                )}
              </div>

              {!isEditingTitle ? (
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">{currentUser.title}</h2>
              ) : (
                <div className="space-y-3 pt-1">
                  <input 
                    type="text" 
                    maxLength={80}
                    value={titleText} 
                    onChange={(e) => setTitleText(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-600"
                  />
                  <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Max 80 characters</span>
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingTitle(false)} className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer">Cancel</button>
                      <button onClick={() => { 
                        const updated = {...currentUser, title: titleText};
                        setCurrentUser(updated);
                        setIsEditingTitle(false);
                        try {
                          const savedProfile = JSON.parse(localStorage.getItem('talegig_user_profile') || '{}');
                          savedProfile.professionalTitle = titleText;
                          localStorage.setItem('talegig_user_profile', JSON.stringify(savedProfile));
                          
                          const settings = JSON.parse(localStorage.getItem('talegig_user_settings') || '{}');
                          if (settings.profile) {
                            settings.profile.professionalTitle = titleText;
                            localStorage.setItem('talegig_user_settings', JSON.stringify(settings));
                          }
                        } catch(e){}
                      }} className="px-3 py-1 bg-pink-600 text-white rounded-lg cursor-pointer font-bold">Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ২. ডেসক্রিপশন সেকশন */}
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 relative">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">About Me</h3>
                {!isPublicView && !isEditingBio && (
                  <button 
                    onClick={() => setIsEditingBio(true)}
                    className="text-pink-600 hover:text-pink-500 cursor-pointer bg-pink-500/10 p-2 rounded-xl border border-pink-500/20"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                )}
              </div>

              {!isEditingBio ? (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                  {currentUser.bio || 'No description added yet.'}
                </p>
              ) : (
                <div className="space-y-3 pt-1">
                  <textarea 
                    rows="6" 
                    maxLength={2400}
                    value={bioText} 
                    onChange={(e) => setBioText(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-pink-600 resize-y min-h-[120px]"
                    placeholder="Write about yourself..."
                  ></textarea>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Max 2400 characters (Adjustable box)</span>
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingBio(false)} className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer">Cancel</button>
                      <button onClick={() => { 
                        const updated = {...currentUser, bio: bioText};
                        setCurrentUser(updated);
                        setIsEditingBio(false);
                        try {
                          const savedProfile = JSON.parse(localStorage.getItem('talegig_user_profile') || '{}');
                          savedProfile.bio = bioText;
                          localStorage.setItem('talegig_user_profile', JSON.stringify(savedProfile));
                          
                          const settings = JSON.parse(localStorage.getItem('talegig_user_settings') || '{}');
                          if (settings.profile) {
                            settings.profile.bio = bioText;
                            localStorage.setItem('talegig_user_settings', JSON.stringify(settings));
                          }
                        } catch(e){}
                      }} className="px-3 py-1 bg-pink-600 text-white rounded-lg cursor-pointer font-bold">Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ৩. স্কিল সেকশন */}
            {currentUser.role === 'seller' && (
              <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 relative">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">Skills</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{skillsList.length} / {maxFreeSkills} added</span>
                </div>

                {skillsList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No skills added yet. Add your professional skills below.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 text-sky-600 dark:text-sky-400 rounded-xl text-xs font-bold">
                        {skill}
                        {!isPublicView && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSkill(skill)} 
                            className="text-red-500 hover:text-red-600 font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {!isPublicView && (
                  <div className="pt-2 space-y-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type a skill and click Add..." 
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        className="flex-1 bg-slate-100 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-600"
                      />
                      <button 
                        type="button" 
                        onClick={handleAddSkill}
                        className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                      >
                        Add Skill
                      </button>
                    </div>

                    {skillsList.length >= maxFreeSkills && (
                      <p className="text-xs text-amber-500 dark:text-amber-400 font-medium pt-1">
                        You have reached the maximum free limit of 10 skills.{' '}
                        <span 
                          onClick={() => navigate(`/sellerdashboard?tab=membership&role=${currentUser.role}`)} 
                          className="text-pink-600 dark:text-pink-500 underline font-bold cursor-pointer hover:text-pink-700"
                        >
                          Upgrade your membership to add more skills
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ৪. ট্যাব সেকশন (Portfolio, My Gig, My Post) */}
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex gap-2 bg-slate-100 dark:bg-[#0b0f19] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  {currentUser.role === 'seller' ? (
                    ['Protfolio', 'My Gig', 'My Post'].map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-lg font-bold text-xs sm:text-sm transition cursor-pointer ${
                          activeTab === tab ? 'bg-pink-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    ))
                  ) : (
                    <button 
                      className="px-5 py-2 rounded-lg font-bold text-xs sm:text-sm bg-pink-600 text-white shadow"
                    >
                      My Post
                    </button>
                  )}
                </div>

                {activeTab === 'Protfolio' && currentUser.role === 'seller' && !isPublicView && (
                  <button 
                    onClick={() => setIsPortfolioModalOpen(true)}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-extrabold shadow transition cursor-pointer"
                  >
                    + Add Portfolio ({portfolioList.length}/2 Free)
                  </button>
                )}
              </div>

              {/* Portfolio Grid */}
              {activeTab === 'Protfolio' && currentUser.role === 'seller' && (
                <div className="space-y-6">
                  {portfolioList.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-6">No portfolios added yet. Click "+ Add Portfolio" to create one.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {portfolioList.map((item, index) => (
                        <div 
                          key={item.id} 
                          onClick={() => setSelectedPortfolio(item)}
                          className="bg-transparent group cursor-pointer space-y-3 relative"
                        >
                          {!isPublicView && portfolioList.length > 1 && (
                            <div className="absolute top-4 right-4 z-10 flex gap-1 bg-black/70 backdrop-blur-sm p-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                              {index > 0 && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); movePortfolioCard(index, 'left'); }} 
                                  className="text-white hover:text-pink-400 px-2 py-0.5 text-xs font-bold"
                                  title="Move Left"
                                >
                                  ◀
                                </button>
                              )}
                              {index < portfolioList.length - 1 && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); movePortfolioCard(index, 'right'); }} 
                                  className="text-white hover:text-pink-400 px-2 py-0.5 text-xs font-bold"
                                  title="Move Right"
                                >
                                  ▶
                                </button>
                              )}
                            </div>
                          )}

                          <div className="aspect-[1120/720] bg-slate-200 dark:bg-[#1a1c23] rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800 shadow-md">
                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          </div>
                          
                          <div className="space-y-1 px-1">
                            <h5 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">{item.title}</h5>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Gigs Tab */}
              {activeTab === 'My Gig' && currentUser.role === 'seller' && (
                <div className="space-y-6">
                  {userGigs.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <p className="text-xs text-slate-400 font-bold">No active gigs found.</p>
                      <button 
                        onClick={() => navigate('/create-gig')}
                        className="px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow"
                      >
                        Create Gig
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userGigs.map((gig, idx) => (
                        <div 
                          key={gig.id || idx}
                          onClick={() => navigate(`/gig/${gig.id || idx}`)}
                          className="bg-transparent group cursor-pointer space-y-3"
                        >
                          <div className="aspect-[1120/720] bg-slate-200 dark:bg-[#1a1c23] rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800 shadow-md">
                            <img 
                              src={gig.thumbnail || gig.images?.[0] || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=500'} 
                              alt={gig.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                            />
                          </div>
                          <div className="space-y-1 px-1">
                            <h5 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">{gig.title}</h5>
                            <p className="text-xs text-pink-600 dark:text-pink-400 font-bold">Starting at ${gig.price || gig.startingPrice || 50} USD</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(activeTab === 'My Post' || currentUser.role === 'buyer') && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 italic text-center py-6">No posted projects yet.</p>
                </div>
              )}

            </div>

            {/* ================= PROFESSIONAL REVIEW & PROJECT CARD SECTION WITH PAGINATION ================= */}
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex gap-2 bg-slate-100 dark:bg-[#0b0f19] p-1.5 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
                  {['Complete Project', 'Running project'].map((rtab) => (
                    <button 
                      key={rtab}
                      onClick={() => {
                        setReviewTab(rtab);
                        if (rtab === 'Complete Project') setCompleteCurrentPage(1);
                        else setRunningCurrentPage(1);
                      }}
                      className={`px-5 py-2 rounded-lg font-bold text-xs sm:text-sm transition cursor-pointer ${
                        reviewTab === rtab ? 'bg-pink-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {rtab}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-[#0b0f19] px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                    {[1, 2, 3, 4, 5].map((starNum) => (
                      <svg key={starNum} className={`w-5 h-5 ${starNum <= Math.round(numericRating) ? 'fill-current text-amber-500 dark:text-amber-400' : 'fill-current text-slate-300 dark:text-slate-700'}`} viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{dynamicRatingStr}</span>
                  <span className="text-slate-400">•</span>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-extrabold text-sm">
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    <span>{dynamicReviewsCount} Reviews</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {reviewTab === 'Complete Project' ? (
                  completedProjectsList.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-8">No completed projects yet.</p>
                  ) : (
                    currentCompleteList.map((ord, i) => {
                      const descText = ord.reviewText || ord.description || ord.title || ord.projectTitle || 'His response was unbelievably fast. Willing to follow directions. Very cooperative attitude.';
                      const isLongText = descText.length > 140;
                      return (
                        <div key={i} className="bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-pink-600 dark:hover:border-pink-600 transition duration-300 group">
                          
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center font-extrabold text-slate-700 dark:text-slate-300 shrink-0 border border-slate-300 dark:border-slate-700">
                                {ord.clientAvatar ? (
                                  <img src={ord.clientAvatar} alt="Client" className="w-full h-full object-cover" />
                                ) : (
                                  <span>{(ord.clientName || ord.buyerName || 'Client').charAt(0)}</span>
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <h5 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-pink-600 transition">
                                  {ord.clientName || ord.buyerName || 'Client'} <span className="text-slate-500 font-normal text-xs">@{ord.clientUsername || 'client'}</span>
                                </h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                  {ord.location || ord.country || 'United Kingdom'} • {ord.timeAgo || '13 days ago'}
                                </p>
                              </div>
                            </div>
                            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white shrink-0">
                              ${ord.price || ord.total || ord.amount || 450} USD
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className="w-4 h-4 fill-current text-amber-500 dark:text-amber-400" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            ))}
                          </div>

                          <div className="space-y-1">
                            <p className={`text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium ${ord.showFull ? '' : 'line-clamp-3'}`}>
                              {descText}
                            </p>
                            {isLongText && (
                              <button 
                                onClick={() => {
                                  const updated = [...completedProjectsList];
                                  const targetIndex = indexOfFirstComplete + i;
                                  updated[targetIndex].showFull = !updated[targetIndex].showFull;
                                  setAllEarningsData([...updated]);
                                }}
                                className="text-xs font-bold text-pink-600 hover:text-pink-700 cursor-pointer pt-0.5 inline-block"
                              >
                                {ord.showFull ? 'Show less' : 'More...'}
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })
                  )
                ) : (
                  runningProjectsList.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-8">No running projects currently.</p>
                  ) : (
                    currentRunningList.map((ord, i) => {
                      const runDesc = ord.description || 'Milestone active and currently under development phase according to requirements.';
                      const isLongRunText = runDesc.length > 140;
                      return (
                        <div key={i} className="bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-pink-600 dark:hover:border-pink-600 transition duration-300 group">
                          
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center font-extrabold text-slate-700 dark:text-slate-300 shrink-0 border border-slate-300 dark:border-slate-700">
                                <span>{(ord.clientName || ord.buyerName || 'Client').charAt(0)}</span>
                              </div>
                              <div className="space-y-0.5">
                                <h5 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-pink-600 transition">
                                  {ord.clientName || ord.buyerName || 'Active Client'} <span className="text-slate-500 font-normal text-xs">@active_client</span>
                                </h5>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                  In Progress • Active Order
                                </p>
                              </div>
                            </div>
                            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white shrink-0">
                              ${ord.price || ord.total || ord.amount || 600} USD
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold">
                            {ord.title || ord.projectTitle || 'Running Brand Identity & Logo Redesign Project'}
                          </p>
                          <div className="space-y-1">
                            <p className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium ${ord.showFullRun ? '' : 'line-clamp-3'}`}>
                              {runDesc}
                            </p>
                            {isLongRunText && (
                              <button 
                                onClick={() => {
                                  const updated = [...runningProjectsList];
                                  const targetIndex = indexOfFirstRunning + i;
                                  updated[targetIndex].showFullRun = !updated[targetIndex].showFullRun;
                                  setAllEarningsData([...updated]);
                                }}
                                className="text-xs font-bold text-pink-600 hover:text-pink-700 cursor-pointer pt-0.5 inline-block"
                              >
                                {ord.showFullRun ? 'Show less' : 'More...'}
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })
                  )
                )}
              </div>

              {((reviewTab === 'Complete Project' && totalCompletePages > 1) || (reviewTab === 'Running project' && totalRunningPages > 1)) && (
                <div className="flex justify-center items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  
                  <button
                    onClick={() => {
                      if (reviewTab === 'Complete Project') setCompleteCurrentPage(prev => Math.max(prev - 1, 1));
                      else setRunningCurrentPage(prev => Math.max(prev - 1, 1));
                    }}
                    disabled={reviewTab === 'Complete Project' ? completeCurrentPage === 1 : runningCurrentPage === 1}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#0b0f19] text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-pink-600 hover:text-white transition flex items-center justify-center cursor-pointer shadow-sm"
                    title="Previous Page"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: reviewTab === 'Complete Project' ? totalCompletePages : totalRunningPages }, (_, idx) => {
                      const pageNum = idx + 1;
                      const activePage = reviewTab === 'Complete Project' ? completeCurrentPage : runningCurrentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            if (reviewTab === 'Complete Project') setCompleteCurrentPage(pageNum);
                            else setRunningCurrentPage(pageNum);
                          }}
                          className={`w-9 h-9 rounded-xl font-extrabold text-xs transition cursor-pointer shadow-sm ${
                            activePage === pageNum 
                              ? 'bg-pink-600 text-white shadow-md' 
                              : 'bg-slate-100 dark:bg-[#0b0f19] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      if (reviewTab === 'Complete Project') setCompleteCurrentPage(prev => Math.min(prev + 1, totalCompletePages));
                      else setRunningCurrentPage(prev => Math.min(prev + 1, totalRunningPages));
                    }}
                    disabled={reviewTab === 'Complete Project' ? completeCurrentPage === totalCompletePages : runningCurrentPage === totalRunningPages}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#0b0f19] text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-pink-600 hover:text-white transition flex items-center justify-center cursor-pointer shadow-sm"
                    title="Next Page"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* ================= PREVIEW PORTFOLIO MODAL ================= */}
      {selectedPortfolio && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-[#16171a] text-white border border-slate-800 rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] flex flex-col relative overflow-y-auto">
            
            <div className="flex justify-between items-start border-b border-slate-800 pb-4 shrink-0">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug pr-8">
                {selectedPortfolio.title}
              </h2>
              
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => {
                    const projectUrl = `${window.location.origin}/profile?project=${selectedPortfolio.id}`;
                    navigator.clipboard.writeText(projectUrl);
                    showToast('Portfolio link copied!', 'success');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 px-3.5 py-2 rounded-xl border border-slate-700 cursor-pointer transition flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  Copy link
                </button>

                {!isPublicView && (
                  <button 
                    onClick={() => {
                      const filtered = portfolioList.filter(p => p.id !== selectedPortfolio.id);
                      setPortfolioList(filtered);
                      setSelectedPortfolio(null);
                    }}
                    className="text-red-500 hover:text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer transition shadow"
                    title="Delete Project"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                )}
                
                <button 
                  onClick={() => setSelectedPortfolio(null)} 
                  className="text-slate-400 hover:text-white font-bold text-xl cursor-pointer bg-slate-800 p-2 rounded-full w-9 h-9 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <p className="text-xs text-pink-400 font-bold uppercase tracking-wider">My role: {selectedPortfolio.role}</p>
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Project description</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedPortfolio.desc}
                  </p>
                </div>
                {selectedPortfolio.skills && selectedPortfolio.skills.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Skills and deliverables</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPortfolio.skills.map((skill, i) => (
                        <span key={i} className="bg-pink-500/10 text-pink-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-pink-500/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {selectedPortfolio.images.map((img, idx) => (
                  <div key={idx} className="aspect-[1120/720] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <img src={img} alt={`Project Preview ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= ADD PORTFOLIO MODAL ================= */}
      {isPortfolioModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-white dark:bg-[#16171a] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] flex flex-col">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Add a new portfolio project</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">All fields are required unless otherwise indicated.</p>
              </div>
              <button 
                onClick={() => setIsPortfolioModalOpen(false)} 
                className="text-slate-400 hover:text-red-500 font-bold text-xl cursor-pointer bg-slate-100 dark:bg-slate-800 p-2 rounded-full w-9 h-9 flex items-center justify-center"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[65vh] pr-2">
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Project title *</label>
                  <input 
                    type="text" 
                    maxLength={70}
                    value={newPortfolio.title}
                    onChange={(e) => setNewPortfolio({...newPortfolio, title: e.target.value})}
                    placeholder="Enter a brief but descriptive title."
                    className="w-full bg-slate-100 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-600 shadow-sm"
                  />
                  <span className="text-[10px] text-slate-400 block text-right mt-0.5">{70 - newPortfolio.title.length} characters left</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Your role (optional)</label>
                  <input 
                    type="text" 
                    maxLength={100}
                    value={newPortfolio.role}
                    onChange={(e) => setNewPortfolio({...newPortfolio, role: e.target.value})}
                    placeholder="e.g., Logo design Expert"
                    className="w-full bg-slate-100 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-600 shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Project description * (Max 300 chars, adjustable)</label>
                  <textarea 
                    rows="4" 
                    maxLength={300}
                    value={newPortfolio.desc}
                    onChange={(e) => setNewPortfolio({...newPortfolio, desc: e.target.value})}
                    placeholder="Briefly describe the project's goals, your solution and the impact you made here."
                    className="w-full bg-slate-100 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-600 shadow-sm resize-y min-h-[100px]"
                  ></textarea>
                  <span className="text-[10px] text-slate-400 block text-right mt-0.5">{300 - newPortfolio.desc.length} characters left</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Skills and deliverables * (Press Enter to add, max 5)</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {newPortfolio.skills.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-pink-500/20">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => removeTagTag(tag)} 
                          className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={newPortfolio.currentSkillInput}
                    onChange={(e) => setNewPortfolio({...newPortfolio, currentSkillInput: e.target.value})}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type skill & press Enter..."
                    className="w-full bg-slate-100 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-600 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <input 
                  type="file" 
                  ref={portfolioImagesInputRef} 
                  onChange={handleMultiplePortfolioImages} 
                  className="hidden" 
                  accept="image/*"
                  multiple
                />
                <div 
                  className="border-2 border-dashed border-emerald-500/50 bg-slate-100 dark:bg-[#0b0f19]/60 rounded-2xl h-full min-h-[300px] flex flex-col items-center justify-center p-4 relative overflow-y-auto"
                >
                  {newPortfolio.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                      {newPortfolio.images.map((img, i) => (
                        <div key={i} className="aspect-[1120/720] rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 relative group bg-black/40">
                          <img src={img} alt={`Uploaded ${i}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            {i > 0 && (
                              <button type="button" onClick={() => moveImage(i, 'up')} className="bg-white/80 text-black p-1 rounded font-bold text-xs">◀</button>
                            )}
                            <button type="button" onClick={() => setNewPortfolio(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))} className="bg-red-600 text-white p-1 rounded font-bold text-xs">✕</button>
                            {i < newPortfolio.images.length - 1 && (
                              <button type="button" onClick={() => moveImage(i, 'down')} className="bg-white/80 text-black p-1 rounded font-bold text-xs">▶</button>
                            )}
                          </div>
                        </div>
                      ))}
                      {newPortfolio.images.length < 5 && (
                        <div 
                          onClick={() => portfolioImagesInputRef.current?.click()}
                          className="aspect-[1120/720] rounded-xl border-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-xs font-bold text-slate-500 cursor-pointer hover:border-emerald-500 hover:text-emerald-500 transition"
                        >
                          <span className="text-xl">+</span>
                          <span>Add More ({newPortfolio.images.length}/5)</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      onClick={() => portfolioImagesInputRef.current?.click()}
                      className="w-full h-full min-h-[250px] flex flex-col items-center justify-center cursor-pointer space-y-3"
                    >
                      <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      <div>
                        <p className="font-extrabold text-sm text-slate-800 dark:text-white">Click to upload images (Max 5)</p>
                        <p className="text-[11px] text-slate-500">Drag & drop or browse previews</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center pt-4 shrink-0 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setIsPortfolioModalOpen(false)}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={handleSavePortfolio}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow cursor-pointer transition"
                >
                  Save & Publish
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= EDIT LANGUAGES MODAL ================= */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-white dark:bg-[#16171a] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Edit languages</h3>
              <button 
                onClick={() => setIsLangModalOpen(false)} 
                className="text-slate-400 hover:text-red-500 font-bold text-xl cursor-pointer bg-slate-100 dark:bg-slate-800 p-2 rounded-full w-9 h-9 flex items-center justify-center"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[55vh] pr-1">
              {tempLanguages.map((lang, index) => (
                <div key={lang.id || index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 dark:bg-[#0b0f19]/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <input 
                    type="text" 
                    value={lang.name}
                    onChange={(e) => {
                      const updated = [...tempLanguages];
                      updated[index].name = e.target.value;
                      setTempLanguages(updated);
                    }}
                    placeholder="e.g. English"
                    className="flex-1 bg-white dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-600 shadow-sm"
                  />
                  <select 
                    value={lang.level}
                    onChange={(e) => {
                      const updated = [...tempLanguages];
                      updated[index].level = e.target.value;
                      setTempLanguages(updated);
                    }}
                    className="flex-1 bg-white dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-600 shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[right_12px_center] bg-no-repeat pr-10"
                  >
                    <option value="Native or Bilingual">Native or Bilingual</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Conversational">Conversational</option>
                  </select>
                  <button 
                    onClick={() => {
                      setTempLanguages(tempLanguages.filter((_, i) => i !== index));
                    }}
                    className="text-red-500 hover:text-red-600 p-3 rounded-xl bg-red-500/10 border border-red-500/20 cursor-pointer transition shrink-0 flex items-center justify-center"
                    title="Remove Language"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              ))}

              <button 
                onClick={() => setTempLanguages([...tempLanguages, { id: Date.now(), name: '', level: 'Conversational' }])}
                className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-extrabold text-pink-600 dark:text-pink-400 hover:bg-pink-500/5 transition cursor-pointer"
              >
                + Add Language
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4 shrink-0 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setIsLangModalOpen(false)}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  for (let lang of tempLanguages) {
                    if (!lang.name.trim()) {
                      showToast('Language name cannot be empty!','error');
                      return;
                    }
                  }
                  setLanguagesList(tempLanguages);
                  setIsLangModalOpen(false);
                }}
                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-extrabold rounded-xl shadow cursor-pointer transition"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= EDIT EDUCATION MODAL ================= */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-white dark:bg-[#16171a] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Edit Education</h3>
              <button 
                onClick={() => setIsEduModalOpen(false)} 
                className="text-slate-400 hover:text-red-500 font-bold text-xl cursor-pointer bg-slate-100 dark:bg-slate-800 p-2 rounded-full w-9 h-9 flex items-center justify-center"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[55vh] pr-1">
              {tempEducation.map((edu, index) => (
                <div key={edu.id || index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 dark:bg-[#0b0f19]/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <input 
                    type="text" 
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = [...tempEducation];
                      updated[index].degree = e.target.value;
                      setTempEducation(updated);
                    }}
                    placeholder="Degree / Title"
                    className="flex-1 bg-white dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-600 shadow-sm"
                  />
                  <input 
                    type="text" 
                    value={edu.years}
                    onChange={(e) => {
                      const updated = [...tempEducation];
                      updated[index].years = e.target.value;
                      setTempEducation(updated);
                    }}
                    placeholder="2011-2023"
                    className="w-full sm:w-36 bg-white dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-600 shadow-sm"
                  />
                  <button 
                    onClick={() => {
                      setTempEducation(tempEducation.filter((_, i) => i !== index));
                    }}
                    className="text-red-500 hover:text-red-600 p-3 rounded-xl bg-red-500/10 border border-red-500/20 cursor-pointer transition shrink-0 flex items-center justify-center"
                    title="Remove Education"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              ))}

              <button 
                onClick={() => setTempEducation([...tempEducation, { id: Date.now(), degree: '', years: '' }])}
                className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-extrabold text-pink-600 dark:text-pink-400 hover:bg-pink-500/5 transition cursor-pointer"
              >
                + Add Education
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4 shrink-0 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setIsEduModalOpen(false)}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  for (let edu of tempEducation) {
                    if (!edu.degree.trim() || !edu.years.trim()) {
                      showToast('Education fields cannot be empty!','error');
                      return;
                    }
                  }
                  setEducationList(tempEducation);
                  setIsEduModalOpen(false);
                }}
                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-extrabold rounded-xl shadow cursor-pointer transition"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= EDIT EXPERIENCE MODAL ================= */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-white dark:bg-[#16171a] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Edit Experience</h3>
              <button 
                onClick={() => setIsExpModalOpen(false)} 
                className="text-slate-400 hover:text-red-500 font-bold text-xl cursor-pointer bg-slate-100 dark:bg-slate-800 p-2 rounded-full w-9 h-9 flex items-center justify-center"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1">
              {tempExperience.map((exp, index) => (
                <div key={exp.id || index} className="flex flex-col gap-3 bg-slate-50 dark:bg-[#0b0f19]/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Title</label>
                    <input 
                      type="text" 
                      value={exp.title}
                      onChange={(e) => {
                        const updated = [...tempExperience];
                        updated[index].title = e.target.value;
                        setTempExperience(updated);
                      }}
                      placeholder="e.g. Senior UI/UX & Brand Designer"
                      className="w-full bg-white dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-600 shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Company</label>
                      <input 
                        type="text" 
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...tempExperience];
                          updated[index].company = e.target.value;
                          setTempExperience(updated);
                        }}
                        placeholder="e.g. TechCorp Agency"
                        className="w-full bg-white dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-600 shadow-sm"
                      />
                    </div>
                    <div className="w-full sm:w-36">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Years</label>
                      <input 
                        type="text" 
                        value={exp.years}
                        onChange={(e) => {
                          const updated = [...tempExperience];
                          updated[index].years = e.target.value;
                          setTempExperience(updated);
                        }}
                        placeholder="2021 - Present"
                        className="w-full bg-white dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-600 shadow-sm"
                      />
                    </div>
                    <div className="flex items-end sm:pt-5">
                      <button 
                        onClick={() => {
                          setTempExperience(tempExperience.filter((_, i) => i !== index));
                        }}
                        className="w-full sm:w-auto text-red-500 hover:text-red-600 p-3 rounded-xl bg-red-500/10 border border-red-500/20 cursor-pointer transition flex items-center justify-center gap-1.5 font-bold text-xs"
                        title="Remove Experience"
                      >
                        <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Delete
                      </button>
                    </div>
                  </div>

                </div>
              ))}

              <button 
                onClick={() => setTempExperience([...tempExperience, { id: Date.now(), title: '', company: '', years: '' }])}
                className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-extrabold text-pink-600 dark:text-pink-400 hover:bg-pink-500/5 transition cursor-pointer"
              >
                + Add Experience
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4 shrink-0 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setIsExpModalOpen(false)}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  for (let exp of tempExperience) {
                    if (!exp.title.trim() || !exp.company.trim() || !exp.years.trim()) {
                      showToast('Experience fields cannot be empty!','error');
                      return;
                    }
                  }
                  setExperienceList(tempExperience);
                  setIsExpModalOpen(false);
                }}
                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-extrabold rounded-xl shadow cursor-pointer transition"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= BOOST PROFILE POPUP MODAL ================= */}
      {isBoostModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-white dark:bg-[#16171a] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-5 sm:p-8 space-y-6 shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">Boost Your Profile</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Increase your profile visibility to top clients and buyers</p>
              </div>
              <button 
                onClick={() => setIsBoostModalOpen(false)} 
                className="text-slate-400 hover:text-red-500 font-bold text-xl cursor-pointer bg-slate-100 dark:bg-slate-800 p-2 rounded-full w-9 h-9 flex items-center justify-center shrink-0"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Category (Max 30 chars)</label>
                  <input 
                    type="text"
                    value={boostCategoryInput}
                    onChange={handleCategoryChange}
                    placeholder="e.g. Logo Design"
                    className="w-full bg-slate-100 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">Specialty (Max 30 chars)</label>
                  <input 
                    type="text"
                    value={boostSpecialtyInput}
                    onChange={handleSpecialtyChange}
                    placeholder="e.g. Brand Identity Expert"
                    className="w-full bg-slate-100 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-pink-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Target Profile Views</label>
                    <span className="text-slate-900 dark:text-white font-extrabold text-sm">{boostViews} Views</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="1000" 
                    step="50" 
                    value={boostViews}
                    onChange={(e) => setBoostViews(Number(e.target.value))}
                    className="w-full accent-pink-600 cursor-pointer bg-slate-200 dark:bg-slate-800 rounded-lg h-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>50 Views</span>
                    <span>500 Views</span>
                    <span>1000 Views</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Boost Duration Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setBoostType('total')}
                      className={`py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                        boostType === 'total' ? 'bg-pink-600 border-pink-600 text-white' : 'bg-slate-100 dark:bg-[#0b0f19] border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Total Campaign
                    </button>
                    <button 
                      type="button"
                      onClick={() => setBoostType('daily')}
                      className={`py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                        boostType === 'daily' ? 'bg-pink-600 border-pink-600 text-white' : 'bg-slate-100 dark:bg-[#0b0f19] border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Per Day Basis
                    </button>
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">Boost Summary</h4>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>Category:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{boostCategoryInput || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>Specialty:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{boostSpecialtyInput || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>Selected Views:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{boostViews} Views ({boostType})</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>Cost Rate (10 Views = $1):</span>
                    <span className="text-slate-900 dark:text-white font-bold">$0.10 / View</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2">
                    <span>Total Estimated Budget:</span>
                    <span className="text-base text-slate-900 dark:text-white">${calculatedBudget} USD</span>
                  </div>
                </div>

              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Buyer Preview Modes</h4>
                  
                  <div className="bg-slate-100 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
                    <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold uppercase tracking-widest block">Search Rank #1 Preview</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                        {currentUser.profilePic ? (
                          <img src={currentUser.profilePic} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                            {currentUser.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{currentUser.name}</h5>
                          <span className="bg-pink-500/20 text-pink-600 dark:text-pink-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-pink-500/30">Sponsored ★</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{boostCategoryInput} | {boostSpecialtyInput}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-100 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase tracking-widest block">Featured Badge Preview</span>
                    <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span>Targeting: <strong className="text-slate-900 dark:text-white">{boostCategoryInput}</strong></span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active Reach</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      "Your profile is actively prioritized in the top featured carousel for clients searching in {boostCategoryInput}."
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 shrink-0 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsBoostModalOpen(false)} 
                    className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      showToast(`Profile successfully boosted for ${boostViews} views with budget $${calculatedBudget}!`,'success');
                      setCurrentUser(prev => ({ ...prev, boosted: true }));
                      setIsBoostModalOpen(false);
                    }} 
                    className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-extrabold rounded-xl shadow cursor-pointer transition"
                  >
                    Confirm & Pay (${calculatedBudget})
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;