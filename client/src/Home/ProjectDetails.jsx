import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PrivateNavbar from '../Home/PrivateNavbar';
import PublicNavbar from './PublicNavbar';
import { useToast } from '../Home/ToastContext';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [projectData] = useState(() => {
    let rawProj = null;
    try {
      const savedProposals = localStorage.getItem('talegig_proposals');
      if (savedProposals) {
        const parsed = JSON.parse(savedProposals);
        const found = parsed.find(item => String(item.id) === String(id));
        if (found) rawProj = found;
      }

      if (!rawProj) {
        const savedProjects = localStorage.getItem('talegig_projects');
        if (savedProjects) {
          const parsedProj = JSON.parse(savedProjects);
          const foundProj = parsedProj.find(item => String(item.id) === String(id));
          if (foundProj) rawProj = foundProj;
        }
      }
    } catch (e) {}

    if (!rawProj && location.state?.project) {
      rawProj = location.state.project;
    }

    if (!rawProj) return null;

    let currentUserProfile = {};
    try {
      currentUserProfile = JSON.parse(localStorage.getItem('user') || '{}');
    } catch (err) {}

    let ownerName = currentUserProfile.name || currentUserProfile.fullName || rawProj?.client || rawProj?.name || null;
    let ownerUsername = currentUserProfile.username || rawProj?.clientUsername || rawProj?.username || null;
    let ownerAvatar = currentUserProfile.profilePic || currentUserProfile.avatar || rawProj?.clientImage || null;
    let ownerRating = currentUserProfile.rating || rawProj?.rating || 0;
    let ownerReviewsCount = currentUserProfile.reviewsCount || currentUserProfile.commentsCount || rawProj?.commentsCount || 0;
    let paymentVerified = currentUserProfile.paymentVerified || rawProj?.paymentVerified || false;
    let totalSpend = currentUserProfile.totalSpend || rawProj?.totalSpend || '$0 USD';
    let completeProject = currentUserProfile.completeProject || rawProj?.completeProject || 0;
    let runningProject = currentUserProfile.runningProject || rawProj?.runningProject || 0;
    let totalHours = currentUserProfile.totalHours || rawProj?.totalHours || 0;

    try {
      const allUsers = JSON.parse(localStorage.getItem('talegig_users') || '[]');
      const targetId = rawProj?.clientId || rawProj?.userId;
      const foundUser = allUsers.find(u => String(u.id) === String(targetId) || u.username === ownerUsername);
      
      if (foundUser) {
        ownerName = foundUser.name || foundUser.fullName || ownerName;
        ownerUsername = foundUser.username || ownerUsername;
        ownerAvatar = foundUser.profilePic || foundUser.avatar || ownerAvatar;
        ownerRating = foundUser.rating || ownerRating;
        ownerReviewsCount = foundUser.reviewsCount || ownerReviewsCount;
        paymentVerified = foundUser.paymentVerified ?? paymentVerified;
        totalSpend = foundUser.totalSpend || totalSpend;
        completeProject = foundUser.completeProject || completeProject;
        runningProject = foundUser.runningProject || runningProject;
        totalHours = foundUser.totalHours || totalHours;
      }
    } catch (err) {}

    if (!ownerName && ownerUsername) {
      ownerName = ownerUsername.replace('@', '');
    }

    const budgetRawStr = String(rawProj?.budget || rawProj?.myproposal || rawProj?.price || '$0.00 USD');
    const budgetStrLower = budgetRawStr.toLowerCase();
    const isHourlyProj = rawProj?.projectType === 'hourly' || budgetStrLower.includes('/hr') || budgetStrLower.includes('hour') || budgetStrLower.includes('hourly');

    let detectedCurrency = 'USD';
    let currencySymbol = '$';
    const upperBudget = budgetRawStr.toUpperCase();
    if (upperBudget.includes('BDT') || budgetRawStr.includes('৳')) {
      detectedCurrency = 'BDT';
      currencySymbol = '৳';
    } else if (upperBudget.includes('EUR') || budgetRawStr.includes('€')) {
      detectedCurrency = 'EUR';
      currencySymbol = '€';
    } else if (upperBudget.includes('GBP') || budgetRawStr.includes('£')) {
      detectedCurrency = 'GBP';
      currencySymbol = '£';
    }

    return {
      id: rawProj.id,
      title: rawProj.title || 'Untitled Project',
      description: rawProj.description || null,
      budget: rawProj.myproposal || rawProj.budget || rawProj.price || null,
      projectType: isHourlyProj ? 'hourly' : 'fixed',
      currency: detectedCurrency,
      currencySymbol: currencySymbol,
      skills: rawProj.skills && rawProj.skills.length > 0 ? rawProj.skills : [],
      badges: rawProj.badges || [],
      files: rawProj.files || [],
      proposalsData: rawProj.proposalsData || [],
      totalProposal: rawProj.totalProposal || 0,
      rating: ownerRating,
      commentsCount: ownerReviewsCount,
      client: ownerName,
      clientId: rawProj.clientId || rawProj.userId || currentUserProfile.id || '',
      clientUsername: ownerUsername ? ownerUsername.replace('@', '') : '',
      clientImage: ownerAvatar,
      paymentVerified,
      totalSpend,
      completeProject,
      runningProject,
      totalHours
    };
  });

  if (!projectData || !projectData.client) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050b1a] text-slate-900 dark:text-white">
        <PrivateNavbar />
        <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
          <h2 className="text-3xl font-black">Project Not Found</h2>
          <p className="text-sm text-slate-500">No valid project or creator data found in the system.</p>
          <button 
            onClick={() => navigate('/allproject')}
            className="px-6 py-3 bg-pink-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const [currentUser] = useState(() => {
    try {
      const userProfile = JSON.parse(localStorage.getItem('user') || '{}');
      return userProfile.name || userProfile.fullName || userProfile.username || '';
    } catch (e) {
      return '';
    }
  });

  const [isAwarded, setIsAwarded] = useState(() => {
    try {
      const savedProposals = localStorage.getItem('talegig_proposals');
      if (savedProposals) {
        const parsed = JSON.parse(savedProposals);
        const found = parsed.find(item => String(item.id) === String(id));
        if (found && found.isAwarded) return true;
      }
    } catch (e) {}
    return false;
  });

  const [awardedBudget, setAwardedBudget] = useState(() => {
    try {
      const savedProposals = localStorage.getItem('talegig_proposals');
      if (savedProposals) {
        const parsed = JSON.parse(savedProposals);
        const found = parsed.find(item => String(item.id) === String(id));
        if (found && found.awardedBudget) return found.awardedBudget;
      }
    } catch (e) {}
    return projectData.budget || '$0.00 USD';
  });

  const [isProjectEnded, setIsProjectEnded] = useState(() => {
    try {
      const savedEnd = localStorage.getItem(`talegig_project_ended_${id || projectData.id}`);
      if (savedEnd) return JSON.parse(savedEnd);
    } catch (e) {}
    return false;
  });

  useEffect(() => {
    const checkStatus = () => {
      try {
        const savedProposals = localStorage.getItem('talegig_proposals');
        if (savedProposals) {
          const parsed = JSON.parse(savedProposals);
          const found = parsed.find(item => String(item.id) === String(id));
          if (found && found.isAwarded) {
            setIsAwarded(true);
            if (found.awardedBudget) setAwardedBudget(found.awardedBudget);
          }
        }
        const savedEnd = localStorage.getItem(`talegig_project_ended_${id || projectData.id}`);
        if (savedEnd) setIsProjectEnded(JSON.parse(savedEnd));
      } catch (e) {}
    };

    checkStatus();
    window.addEventListener('storage', checkStatus);
    return () => window.removeEventListener('storage', checkStatus);
  }, [id]);

  const [activeTab, setActiveTab] = useState('description');
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  // 🟢 ডিফল্ট মান 30 এবং 1 এর পরিবর্তে জিরো ('') করা হলো যাতে ইউজার নিজের ইচ্ছা মতো দিতে পারে
  const [ProposalAmount, setProposalAmount] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [proposalText, setProposalText] = useState('');

  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [expandedProposals, setExpandedProposals] = useState({});
  const toggleExpand = (proposalId) => {
    setExpandedProposals(prev => ({
      ...prev,
      [proposalId]: !prev[proposalId]
    }));
  };

  const [attachedFiles] = useState(() => {
    let filesList = projectData.files || [];
    if (filesList.length === 0) {
      try {
        const savedProposals = localStorage.getItem('talegig_proposals');
        if (savedProposals) {
          const parsed = JSON.parse(savedProposals);
          const found = parsed.find(item => String(item.id) === String(id));
          if (found && found.files && found.files.length > 0) {
            filesList = found.files;
          }
        }
      } catch (e) {}
    }

    if (filesList.length > 0) {
      return filesList.map((file, idx) => ({
        id: file.id || idx + 1,
        name: file.name || `File_${idx + 1}`,
        type: file.type && file.type.includes('image') ? 'image' : 'doc',
        url: file.url || '#'
      }));
    }
    return [];
  });
  const [previewFileId, setPreviewFileId] = useState(null);

  const [handoverFiles, setHandoverFiles] = useState(() => {
    try {
      const savedHandover = localStorage.getItem(`talegig_handover_files_${id || projectData.id}`);
      if (savedHandover) return JSON.parse(savedHandover);
    } catch (e) {}
    return [];
  });
  const [previewHandoverId, setPreviewHandoverId] = useState(null);

  const handleSellerFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newUploadedFiles = files.map((file) => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file)
    }));

    const updated = [...handoverFiles, ...newUploadedFiles];
    setHandoverFiles(updated);
    try {
      localStorage.setItem(`talegig_handover_files_${id || projectData.id}`, JSON.stringify(updated));
    } catch (err) {}
    showToast(`${files.length} handover file(s) uploaded successfully!`, 'success');
  };

  const handleDownloadAll = () => {
    if (attachedFiles.length === 0) {
      showToast('No attached files available to download.', 'error');
      return;
    }
    showToast('Downloading all attached project files as a ZIP archive...', 'success');
  };

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneAmount, setMilestoneAmount] = useState('');
  
  const [agreedHourlyRate] = useState(() => {
    try {
      const savedProposals = localStorage.getItem('talegig_proposals');
      if (savedProposals) {
        const parsed = JSON.parse(savedProposals);
        const found = parsed.find(item => String(item.id) === String(id));
        if (found && found.proposalsData) {
          const myProp = found.proposalsData.find(p => p.name && p.name.includes('You'));
          if (myProp && myProp.amount) {
            const match = myProp.amount.match(/\$?(\d+)/);
            if (match) return parseFloat(match[1]);
          }
        }
        if (found && found.awardedBudget) {
          const match = found.awardedBudget.match(/\$?(\d+)/);
          if (match) return parseFloat(match[1]);
        }
      }
      const budgetMatch = String(projectData.budget).match(/\$?(\d+)/);
      if (budgetMatch) return parseFloat(budgetMatch[1]);
    } catch (e) {}
    return 20;
  });

  const [workedHours, setWorkedHours] = useState('');

  const [milestones, setMilestones] = useState(() => {
    try {
      const savedM = localStorage.getItem(`talegig_milestones_${id || projectData.id}`);
      if (savedM) return JSON.parse(savedM);
    } catch (e) {}
    return [];
  });

  const handleCreateMilestoneSubmit = (e) => {
    e.preventDefault();
    if (!milestoneDesc.trim() || !milestoneAmount) {
      showToast('Please fill in both description and amount!', 'error');
      return;
    }

    const currentDynamicDate = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const rawAmt = parseFloat(milestoneAmount);
    const dynamicCommRate = Number(localStorage.getItem('talegig_commission_rate') || 10);
    const netAmt = rawAmt * (1 - (dynamicCommRate / 100));

    const newM = {
      id: Date.now(),
      date: currentDynamicDate,
      description: milestoneDesc,
      status: 'Pending',
      amount: netAmt
    };

    const updatedMilestones = [...milestones, newM];
    setMilestones(updatedMilestones);

    try {
      localStorage.setItem(`talegig_milestones_${id || projectData.id}`, JSON.stringify(updatedMilestones));
    } catch (err) {}

    setMilestoneDesc('');
    setMilestoneAmount('');
    setIsMilestoneModalOpen(false);
    showToast('Milestone request sent to client successfully!', 'success');
  };

  const handleLogHoursSubmit = (e) => {
    e.preventDefault();
    if (!workedHours || parseFloat(workedHours) <= 0) {
      showToast('Please enter valid working hours!', 'error');
      return;
    }

    const hoursNum = parseFloat(workedHours);
    const rawTotal = hoursNum * agreedHourlyRate;

    const dynamicCommRate = Number(localStorage.getItem('talegig_commission_rate') || 10);
    const calculatedTotal = rawTotal * (1 - (dynamicCommRate / 100));

    const currentDynamicDate = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newTimesheetLog = {
      id: Date.now(),
      date: currentDynamicDate,
      description: `Manual Log: ${hoursNum} hrs @ ${projectData.currencySymbol}${agreedHourlyRate}/hr`,
      status: 'Pending',
      amount: calculatedTotal
    };

    const updatedMilestones = [...milestones, newTimesheetLog];
    setMilestones(updatedMilestones);

    try {
      localStorage.setItem(`talegig_milestones_${id || projectData.id}`, JSON.stringify(updatedMilestones));
    } catch (err) {}

    setWorkedHours('');
    setIsMilestoneModalOpen(false);
    showToast('Timesheet hours logged and sent to client for approval!', 'success');
  };

  const handleDeleteMilestone = (mId) => {
    if (window.confirm('Are you sure you want to delete this payment request?')) {
      const updated = milestones.filter(m => m.id !== mId);
      setMilestones(updated);
      try {
        localStorage.setItem(`talegig_milestones_${id || projectData.id}`, JSON.stringify(updated));
      } catch (err) {}
    }
  };

  const handleEndProject = () => {
    if (window.confirm('Are you sure you want to officially end this project?')) {
      setIsProjectEnded(true);
      try {
        localStorage.setItem(`talegig_project_ended_${id || projectData.id}`, JSON.stringify(true));
      } catch (e) {}
      showToast('Project successfully ended! You can now submit your final review.', 'success');
      setActiveTab('reviews');
    }
  };

  const unbilledTotal = milestones.filter(m => m.status === 'Pending').reduce((sum, m) => sum + m.amount, 0);
  const pendingReleaseTotal = milestones.filter(m => m.status === 'In Progress').reduce((sum, m) => sum + m.amount, 0);
  const paidTotal = milestones.filter(m => m.status === 'Released').reduce((sum, m) => sum + m.amount, 0);
  const isPaymentFullyCleared = milestones.length > 0 && milestones.every(m => m.status === 'Released');

  const [reviewRating, setReviewRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [recommend, setRecommend] = useState('Yes');
  const [reviewText, setReviewText] = useState('');

  const [reviewsData, setReviewsData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`talegig_reviews_${id || projectData.id}`) || '{}');
    } catch(e) {}
    return {};
  });

  const buyerReview = reviewsData.buyerReview || null;
  const sellerReview = reviewsData.sellerReview || null;
  const bothSubmitted = Boolean(buyerReview && sellerReview);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isProjectEnded) {
      showToast('You can only submit a review after the project has officially ended!', 'error');
      return;
    }
    if (reviewRating === 0 || !reviewText.trim()) {
      showToast('Please provide overall rating and comment.', 'error');
      return;
    }

    const overallAvg = Number(((reviewRating + communicationRating + qualityRating + deliveryRating + valueRating + professionalismRating) / 6).toFixed(1)) || reviewRating;

    const newSellerRev = {
      reviewer: 'Seller',
      name: currentUser,
      rating: overallAvg,
      recommend,
      comment: reviewText,
      date: new Date().toLocaleDateString()
    };

    try {
      const projectKey = `talegig_reviews_${id || projectData.id}`;
      const existingData = JSON.parse(localStorage.getItem(projectKey) || '{}');
      const updatedData = { ...existingData, sellerReview: newSellerRev };
      localStorage.setItem(projectKey, JSON.stringify(updatedData));
      setReviewsData(updatedData);
      showToast('Review submitted successfully!', 'success');
    } catch(err) {}
  };

  const [proposalsList, setProposalsList] = useState(() => {
    try {
      const savedProposals = localStorage.getItem('talegig_proposals');
      if (savedProposals) {
        const parsed = JSON.parse(savedProposals);
        const found = parsed.find(item => String(item.id) === String(id));
        if (found && found.proposalsData) {
          return found.proposalsData;
        }
      }
    } catch (e) {}
    return [];
  });

  const handlePlaceProposal = (e) => {
    e.preventDefault();

    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUsername = (storedUser.username || storedUser.name || storedUser.fullName || '').toLowerCase().replace('@', '');
      const clientName = (projectData.client || '').toLowerCase();
      const clientUsername = (projectData.clientUsername || '').toLowerCase().replace('@', '');

      if (
        (clientName && currentUsername && (clientName.includes(currentUsername) || currentUsername.includes(clientName))) ||
        (clientUsername && currentUsername && clientUsername === currentUsername) ||
        (projectData.clientId && storedUser.id && String(projectData.clientId) === String(storedUser.id))
      ) {
        showToast("You cannot submit a proposal to your own project!", 'error');
        setIsProposalModalOpen(false);
        return;
      }
    } catch (err) {}

    const alreadySubmitted = proposalsList.some(p => p.name && p.name.includes('You ('));
    if (alreadySubmitted) {
      showToast('You have already submitted a proposal for this project', 'error');
      setIsProposalModalOpen(false);
      return;
    }

    if (!ProposalAmount || Number(ProposalAmount) <= 0) {
      showToast('Please enter a valid proposal amount!', 'error');
      return;
    }

    if (!deliveryDays || Number(deliveryDays) <= 0) {
      showToast('Please enter valid delivery days!', 'error');
      return;
    }

    if (proposalText.length < 100) {
      showToast('Please describe your proposal with a minimum of 100 characters!', 'error');
      return;
    }

    const userProfile = JSON.parse(localStorage.getItem('user') || '{}');
    const userAvatar = userProfile.profilePic || userProfile.avatar || '';

    const isHourly = projectData.projectType === 'hourly';
    const formattedAmount = isHourly 
      ? `${projectData.currencySymbol}${hourlyRate}/hr (${weeklyHours} hrs/wk)` 
      : `${projectData.currencySymbol}${ProposalAmount} ${projectData.currency}`;

    const newProposal = {
      id: Date.now(),
      name: `You (${currentUser})`,
      avatar: userAvatar,
      rating: 5.0,
      reviews: 12,
      completionRate: '8.0',
      onTime: '100%',
      country: 'Bangladesh',
      tagline: 'Professional Freelancer',
      amount: formattedAmount,
      time: isHourly ? `${weeklyHours} hrs/wk` : `${deliveryDays} Day`,
      proposal: proposalText,
      badges: ['YOUR PROPOSAL']
    };

    const updatedProposalsList = [newProposal, ...proposalsList];
    setProposalsList(updatedProposalsList);

    try {
      const savedProposals = localStorage.getItem('talegig_proposals');
      if (savedProposals) {
        let parsed = JSON.parse(savedProposals);
        let isProjectFound = false;

        parsed = parsed.map(item => {
          if (String(item.id) === String(id)) {
            isProjectFound = true;
            return {
              ...item,
              totalProposal: updatedProposalsList.length,
              proposalsData: updatedProposalsList
            };
          }
          return item;
        });

        if (!isProjectFound) {
          const currentProjectObject = {
            ...projectData,
            id: id,
            totalProposal: updatedProposalsList.length,
            proposalsData: updatedProposalsList
          };
          parsed.unshift(currentProjectObject);
        }

        localStorage.setItem('talegig_proposals', JSON.stringify(parsed));
      } else {
        const initialArray = [{
          ...projectData,
          id: id,
          totalProposal: updatedProposalsList.length,
          proposalsData: updatedProposalsList
        }];
        localStorage.setItem('talegig_proposals', JSON.stringify(initialArray));
      }
    } catch (err) {}

    setIsProposalModalOpen(false);
    setProposalText('');
    setActiveTab('proposals');
    showToast('Proposal Placed Successfully', 'success');
  };

  const handleChat = (clientName) => {
    navigate('/sellerdashboard', { state: { activeTab: 'Inbox', chatUser: clientName } });
  };

  const isAlreadySubmitted = proposalsList.some(p => p.name && p.name.includes('You ('));

  return (
    <div className="min-h-screen bg-white dark:bg-[#050b1a] text-slate-900 dark:text-white transition-colors duration-300">
      {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        
        {isAwarded && (
          <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 border-2 border-emerald-500/40 p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left mb-6 backdrop-blur-md">
            <div className="space-y-1">
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">👑 WINNING FREELANCER</span>
              <h3 className="text-sm sm:text-xl font-black text-slate-900 dark:text-white pt-1">Congratulations! You have won this project 🏆</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">Please provide your final vector and source handover files to the client.</p>
            </div>
            <button 
              onClick={() => handleChat(projectData.client)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-7 py-3 rounded-xl shadow-md cursor-pointer shrink-0 transition-all hover:scale-105"
            >
              💬 Chat with Client
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl mb-6">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <span className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-md ${isProjectEnded ? 'bg-purple-500/10 text-purple-600' : isAwarded ? 'bg-pink-500/10 text-pink-600' : 'bg-green-500/10 text-green-600 dark:text-green-500'}`}>
                {isProjectEnded ? 'Project Completed & Ended 🏁' : isAwarded ? 'In Progress / Awarded to You 🏆' : 'Open'}
              </span>
            </div>
            
            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug mt-2">
              {projectData.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {projectData.badges && projectData.badges.map((badge, idx) => {
                const bLower = badge.toLowerCase();
                let badgeBgColor = 'bg-pink-600';
                if (bLower.includes('featured')) badgeBgColor = 'bg-amber-600';
                else if (bLower.includes('guranteed') || bLower.includes('guaranteed')) badgeBgColor = 'bg-green-600';
                else if (bLower.includes('urgent')) badgeBgColor = 'bg-red-600';
                else if (bLower.includes('nda')) badgeBgColor = 'bg-blue-600';
                else if (bLower.includes('recruiter')) badgeBgColor = 'bg-purple-600';
                else if (bLower.includes('sealed')) badgeBgColor = 'bg-sky-500';
                else if (bLower.includes('ip agreement')) badgeBgColor = 'bg-pink-700';

                return (
                  <span key={idx} className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded text-white ${badgeBgColor}`}>
                    {badge}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="w-full sm:w-auto flex sm:block justify-between items-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 text-left sm:text-right shrink-0">
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-400">{isAwarded ? 'Awarded Budget' : 'Proposal placed'}</p>
              <p className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {isAwarded ? awardedBudget : proposalsList.length}
              </p>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-gray-200 sm:mt-2">
              {projectData.budget || '$0.00 USD'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className={`${activeTab !== 'proposals' ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all duration-300 w-full overflow-hidden`}>
            
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                <button 
                  onClick={() => setActiveTab('description')}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'description' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Description
                </button>
                <button 
                  onClick={() => setActiveTab('proposals')}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'proposals' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isAwarded ? 'My Proposal' : `Proposals (${proposalsList.length})`}
                </button>

                {isAwarded && (
                  <>
                    <button onClick={() => setActiveTab('payment')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'payment' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400'}`}>Payment</button>
                    <button onClick={() => setActiveTab('files')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'files' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400'}`}>Files</button>
                    <button onClick={() => setActiveTab('reviews')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'reviews' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400'}`}>Reviews {!isProjectEnded && '🔒'}</button>
                  </>
                )}
              </div>

              {!isAwarded && !isAlreadySubmitted && (
                <button 
                  onClick={() => setIsProposalModalOpen(true)}
                  className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0 text-center"
                >
                  Submit Proposal
                </button>
              )}
            </div>

            {activeTab === 'description' && (
              <div className="space-y-6">
                {isAwarded && (
                  <div className="bg-pink-600/10 border border-pink-500 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-center sm:text-left">
                    <p className="font-bold text-pink-600">🎉 Congratulations! You have been awarded this project. Start working with the client.</p>
                    <button onClick={() => handleChat(projectData.client)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl cursor-pointer shrink-0">
                      Chat with Client
                    </button>
                  </div>
                )}

                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-4 text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                  <div className={`whitespace-pre-line ${!isDescExpanded ? 'line-clamp-4' : ''}`}>
                    {projectData.description}
                  </div>
                  {projectData.description && projectData.description.length > 200 && (
                    <button 
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="text-xs font-bold text-pink-600 hover:underline cursor-pointer block pt-1"
                    >
                      {isDescExpanded ? 'See Less ∧' : 'See More ∨'}
                    </button>
                  )}
                </div>

                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attached Files</h3>
                    {attachedFiles.length > 0 && (
                      <button 
                        onClick={handleDownloadAll}
                        className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        ↓ Download all
                      </button>
                    )}
                  </div>

                  {attachedFiles.length > 0 ? (
                    <div className="space-y-3">
                      {attachedFiles.map((file) => (
                        <div key={file.id} className="space-y-2">
                          <div 
                            onClick={() => setPreviewFileId(previewFileId === file.id ? null : file.id)}
                            className="flex items-center justify-between bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl cursor-pointer hover:border-pink-500 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate pr-2">
                              <span>📎</span>
                              <span className="truncate">{file.name}</span>
                            </div>
                            <span className="text-xs text-slate-400 font-semibold shrink-0">{previewFileId === file.id ? 'Hide ∧' : 'View ∨'}</span>
                          </div>

                          {previewFileId === file.id && (
                            <div className="p-4 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 text-center">
                              {file.type === 'image' ? (
                                <img src={file.url} alt={file.name} className="max-h-48 mx-auto rounded-lg object-contain shadow-md" />
                              ) : (
                                <p className="text-xs text-slate-500">Document preview: {file.name}</p>
                              )}
                              <a 
                                href={file.url} 
                                download 
                                className="inline-block bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
                              >
                                Download File
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">No attached files for this project.</p>
                  )}
                </div>

                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {projectData.skills && projectData.skills.length > 0 ? (
                      projectData.skills.map((skill, idx) => (
                        <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 text-xs px-3.5 py-1.5 rounded-full font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No specific skills required.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'proposals' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isAwarded ? 'Your Awarded Proposal' : `All Proposals (${proposalsList.length})`}
                </h3>
                
                <div className="space-y-4">
                  {proposalsList.map((prop, idx) => {
                    const isExpanded = expandedProposals[prop.id];
                    return (
                      <div key={prop.id} className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-center gap-3.5">
                            <img 
                              src={prop.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'} 
                              alt={prop.name} 
                              className="w-11 h-11 rounded-full object-cover border-2 border-pink-600 shadow-md shrink-0"
                            />
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                                {prop.name} {idx === 0 && <span className="text-[10px] bg-pink-600 text-white px-2 py-0.5 rounded">Top Rank</span>}
                              </h4>
                              <p className="text-[11px] sm:text-xs text-amber-500 font-bold mt-0.5">
                                ⭐ {prop.rating} • 💰 {prop.completionRate} • ⏱️ {prop.onTime} on time
                              </p>
                              <p className="text-xs text-slate-500 dark:text-gray-400 italic mt-1">"{prop.tagline}"</p>
                            </div>
                          </div>

                          <div className="text-left sm:text-right shrink-0">
                            <p className="text-base font-extrabold text-pink-600">{prop.amount}</p>
                            <p className="text-[11px] text-slate-400">Delivery in {prop.time}</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-[#111622] p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                          <p className={`text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                            {prop.proposal}
                          </p>
                          {prop.proposal && prop.proposal.length > 90 && (
                            <button 
                              onClick={() => toggleExpand(prop.id)}
                              className="text-xs font-bold text-pink-600 hover:underline cursor-pointer pt-1 block"
                            >
                              {isExpanded ? 'Show Less ∧' : 'See All / More ∨'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isAwarded && activeTab === 'payment' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Payment Summary</h3>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <button onClick={() => showToast('Downloading Invoice Summary...', 'success')} className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer">
                        ↓ Invoice summary
                      </button>

                      {isPaymentFullyCleared && !isProjectEnded && (
                        <button 
                          onClick={handleEndProject}
                          className="flex-1 sm:flex-none bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer animate-pulse"
                        >
                          End Project 🏁
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    <div className="bg-slate-50 dark:bg-[#111622] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500">Unbilled (Seller Req)</p>
                      <p className="text-base sm:text-lg font-extrabold text-amber-500 mt-1">
                        {unbilledTotal > 0 ? `${projectData.currencySymbol}${unbilledTotal.toFixed(2)} ${projectData.currency}` : `0.00 ${projectData.currency}`}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#111622] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500">Billed & Pending Release</p>
                      <p className="text-base sm:text-lg font-extrabold text-blue-500 mt-1">
                        {pendingReleaseTotal > 0 ? `${projectData.currencySymbol}${pendingReleaseTotal.toFixed(2)} ${projectData.currency}` : `0.00 ${projectData.currency}`}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#111622] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500">Paid</p>
                      <p className="text-base sm:text-lg font-extrabold text-pink-600 mt-1">
                        {paidTotal > 0 ? `${projectData.currencySymbol}${paidTotal.toFixed(2)} ${projectData.currency}` : `0.00 ${projectData.currency}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {projectData.projectType === 'hourly' ? 'Weekly Timesheet & Hours Log' : 'Milestone Payments'}
                    </h3>
                    <button onClick={() => setIsMilestoneModalOpen(true)} className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer text-center">
                      {projectData.projectType === 'hourly' ? '+ Log Hours (Timesheet)' : 'Create Milestone Request'}
                    </button>
                  </div>

                  <div className="w-full overflow-x-auto no-scrollbar rounded-xl border border-slate-100 dark:border-slate-800">
                    {milestones.length > 0 ? (
                      <table className="w-full text-left border-collapse min-w-[550px]">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs text-slate-400 bg-slate-50 dark:bg-[#111622]">
                            <th className="py-3 px-3">Date</th>
                            <th className="py-3 px-3">Description</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 px-3">Amount</th>
                            <th className="py-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                          {milestones.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                              <td className="py-3.5 px-3 font-medium text-slate-700 dark:text-gray-300 whitespace-nowrap">{m.date}</td>
                              <td className="py-3.5 px-3 text-slate-900 dark:text-white font-semibold max-w-[150px] truncate">{m.description}</td>
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <span className={`font-bold px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] inline-block ${
                                  m.status === 'Released' ? 'bg-green-500/10 text-green-600' :
                                  m.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                                  'bg-blue-500/10 text-blue-500'
                                }`}>
                                  {m.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{projectData.currencySymbol}{m.amount.toFixed(2)}</td>
                              <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                {m.status === 'Pending' && (
                                  <button onClick={() => handleDeleteMilestone(m.id)} className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer">
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-6 text-center">
                        {projectData.projectType === 'hourly' ? 'No hours logged yet.' : 'N/A - No milestone payments created yet.'}
                      </p>
                    )}
                  </div>
                </div>

                {isMilestoneModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-5">
                      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {projectData.projectType === 'hourly' ? 'Log Hours (Manual Timesheet)' : 'Request New Milestone'}
                        </h3>
                        <button onClick={() => setIsMilestoneModalOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer text-lg">✕</button>
                      </div>

                      {projectData.projectType === 'hourly' ? (
                        <form onSubmit={handleLogHoursSubmit} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300">Total Hours Worked</label>
                            <input 
                              type="number"
                              step="0.5"
                              value={workedHours}
                              onChange={(e) => setWorkedHours(e.target.value)}
                              placeholder="hour's"
                              className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 px-4 py-3 rounded-xl text-sm focus:outline-none text-slate-900 dark:text-white"
                            />
                            <p className="text-[11px] text-pink-600 font-bold pt-1">
                              Agreed Rate: {projectData.currencySymbol}{agreedHourlyRate}/hr | Net Total: {projectData.currencySymbol}{(parseFloat(workedHours || 0) * agreedHourlyRate * (1 - (Number(localStorage.getItem('talegig_commission_rate') || 10) / 100))).toFixed(2)} {projectData.currency}
                            </p>
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setIsMilestoneModalOpen(false)} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">
                              Cancel
                            </button>
                            <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer">
                              Submit Hours Log
                            </button>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={handleCreateMilestoneSubmit} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300">Milestone Description</label>
                            <input 
                              type="text"
                              value={milestoneDesc}
                              onChange={(e) => setMilestoneDesc(e.target.value)}
                              placeholder="e.g. Design Phase"
                              className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 px-4 py-3 rounded-xl text-sm focus:outline-none text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300">Amount ({projectData.currency})</label>
                            <input 
                              type="number"
                              value={milestoneAmount}
                              onChange={(e) => setMilestoneAmount(e.target.value)}
                              placeholder="e.g. 50.00"
                              className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 px-4 py-3 rounded-xl text-sm focus:outline-none text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setIsMilestoneModalOpen(false)} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">
                              Cancel
                            </button>
                            <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer">
                              Request
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAwarded && activeTab === 'files' && (
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Project Files ({handoverFiles.length})</h3>
                  <label className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-all text-center">
                    ↑ Upload files
                    <input type="file" onChange={handleSellerFileUpload} multiple className="hidden" />
                  </label>
                </div>

                <div className="space-y-3">
                  {handoverFiles.length > 0 ? (
                    handoverFiles.map((file, idx) => (
                      <div key={idx} className="space-y-2">
                        <div 
                          onClick={() => setPreviewHandoverId(previewHandoverId === idx ? null : idx)}
                          className="flex items-center justify-between bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 p-3.5 sm:p-4 rounded-xl cursor-pointer hover:border-pink-500 transition-colors"
                        >
                          <span className="text-xs sm:text-sm font-medium text-blue-500 hover:underline truncate pr-2">
                            📎 {file.name}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold shrink-0">
                            {previewHandoverId === idx ? 'Hide ∧' : 'View ∨'}
                          </span>
                        </div>

                        {previewHandoverId === idx && (
                          <div className="p-4 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 text-center">
                            {file.type && file.type.includes('image') ? (
                              <img src={file.url} alt={file.name} className="max-h-48 mx-auto rounded-lg object-contain shadow-md" />
                            ) : (
                              <p className="text-xs text-slate-500">Document preview: {file.name}</p>
                            )}
                            <a href={file.url} download={file.name} className="inline-block bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all">
                              Download File
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">N/A - No files uploaded yet.</p>
                  )}
                </div>
              </div>
            )}

            {isAwarded && activeTab === 'reviews' && (
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-6">
                {!isProjectEnded ? (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-2">
                    <p className="text-base font-bold text-amber-500">🔒 Review Window Locked</p>
                    <p className="text-xs text-slate-400">Order must be "Completed" before leaving a review.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bothSubmitted ? (
                      <>
                        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-pink-600 dark:text-pink-500">Review from Buyer</span>
                            <span className="text-[11px] text-slate-400 font-medium">{buyerReview?.date}</span>
                          </div>
                          <div className="flex gap-1.5 text-amber-500 text-xl sm:text-2xl">
                            {[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= (buyerReview?.rating || 0) ? '★' : '☆'}</span>)}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">{buyerReview?.comment}</p>
                        </div>

                        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Your Review (Seller)</span>
                            <span className="text-[11px] text-slate-400 font-medium">{sellerReview?.date}</span>
                          </div>
                          <div className="flex gap-1.5 text-amber-500 text-xl sm:text-2xl">
                            {[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= (sellerReview?.rating || 0) ? '★' : '☆'}</span>)}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">{sellerReview?.comment}</p>
                        </div>
                      </>
                    ) : sellerReview ? (
                      <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center space-y-2">
                        <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">⏳ Review Submitted Successfully</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">As per TaleGig marketplace standards, both parties' reviews will become visible once the other party also submits their review.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-6 pt-2">
                        <div className="space-y-1">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Leave a Review</h3>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Rate your experience across multiple categories with large stars below:</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs sm:text-sm">
                          <div className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Overall Rating:</span>
                            <div className="flex gap-1 text-xl sm:text-2xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setReviewRating(s)} className={`cursor-pointer hover:scale-110 transition ${s <= reviewRating ? 'text-amber-500 drop-shadow-sm' : 'text-slate-300 dark:text-slate-700'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Communication:</span>
                            <div className="flex gap-1 text-xl sm:text-2xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setCommunicationRating(s)} className={`cursor-pointer hover:scale-110 transition ${s <= communicationRating ? 'text-amber-500 drop-shadow-sm' : 'text-slate-300 dark:text-slate-700'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Quality of Work:</span>
                            <div className="flex gap-1 text-xl sm:text-2xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setQualityRating(s)} className={`cursor-pointer hover:scale-110 transition ${s <= qualityRating ? 'text-amber-500 drop-shadow-sm' : 'text-slate-300 dark:text-slate-700'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Delivery Time:</span>
                            <div className="flex gap-1 text-xl sm:text-2xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setDeliveryRating(s)} className={`cursor-pointer hover:scale-110 transition ${s <= deliveryRating ? 'text-amber-500 drop-shadow-sm' : 'text-slate-300 dark:text-slate-700'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Value for Money:</span>
                            <div className="flex gap-1 text-xl sm:text-2xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setValueRating(s)} className={`cursor-pointer hover:scale-110 transition ${s <= valueRating ? 'text-amber-500 drop-shadow-sm' : 'text-slate-300 dark:text-slate-700'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Professionalism:</span>
                            <div className="flex gap-1 text-xl sm:text-2xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setProfessionalismRating(s)} className={`cursor-pointer hover:scale-110 transition ${s <= professionalismRating ? 'text-amber-500 drop-shadow-sm' : 'text-slate-300 dark:text-slate-700'}`}>★</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 pt-2">
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1.5">Would Recommend? (Yes / No)</label>
                            <select value={recommend} onChange={(e) => setRecommend(e.target.value)} className="w-full bg-slate-50 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 p-3 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none font-medium">
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1.5">Review Description / Comment</label>
                            <textarea rows="4" value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Write detailed feedback about your experience..." required className="w-full bg-slate-50 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 p-3.5 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-pink-500 resize-none font-medium"></textarea>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button type="submit" className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-extrabold px-8 py-3 rounded-xl text-xs sm:text-sm cursor-pointer shadow-md transition-all hover:scale-105">Submit & Publish Review ⭐</button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {activeTab !== 'proposals' && (
            <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-6 text-center">
                <div className="flex flex-col items-center space-y-3">
                  {projectData.clientImage ? (
                    <img 
                      src={projectData.clientImage} 
                      alt="Project Creator" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-pink-600 shadow-md mx-auto"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-black text-2xl shadow-md mx-auto">
                      {projectData.client ? projectData.client.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                      {projectData.client}
                      {projectData.paymentVerified && (
                        <span className="text-emerald-500 text-xs" title="Payment Verified">✓</span>
                      )}
                    </h3>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5 text-xs text-amber-500 font-bold">
                    <span>⭐ {projectData.rating > 0 ? projectData.rating : 0}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-600 dark:text-gray-300">💬 {projectData.commentsCount} reviews</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/profile/${projectData.clientUsername || projectData.client}`)}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  View Creator Profile
                </button>

                <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-gray-300 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Payment Verified</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${projectData.paymentVerified ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-400'}`}>
                      {projectData.paymentVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Spend</span>
                    <span className="font-bold text-slate-900 dark:text-white">{projectData.totalSpend}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Complete Project</span>
                    <span className="font-bold text-slate-900 dark:text-white">{projectData.completeProject}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Running Project</span>
                    <span className="font-bold text-slate-900 dark:text-white">{projectData.runningProject}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Hours</span>
                    <span className="font-bold text-slate-900 dark:text-white">{projectData.totalHours} hrs</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {isProposalModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 w-full max-w-lg p-5 sm:p-8 rounded-2xl shadow-2xl space-y-6 relative my-auto">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {projectData.projectType === 'hourly' ? 'Place an Hourly Proposal' : 'Place a Proposal on this project'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">You will be able to edit your Proposal until the project is closed.</p>
              </div>
              <button onClick={() => setIsProposalModalOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer text-lg">✕</button>
            </div>

            <form onSubmit={handlePlaceProposal} className="space-y-5">
              {projectData.projectType === 'hourly' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300">Hourly Rate ({projectData.currencySymbol}/hr)</label>
                    <div className="flex">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-l-xl text-xs font-bold flex items-center border border-r-0 border-slate-300 dark:border-slate-700">{projectData.currencySymbol}/hr</span>
                      <input 
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="e.g. 20"
                        className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 rounded-r-xl text-xs sm:text-sm focus:outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300">Hours per Week</label>
                    <div className="flex">
                      <input 
                        type="number"
                        value={weeklyHours}
                        onChange={(e) => setWeeklyHours(e.target.value)}
                        placeholder="e.g. 30"
                        className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 rounded-l-xl text-xs sm:text-sm focus:outline-none text-slate-900 dark:text-white"
                      />
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-r-xl text-xs font-bold flex items-center border border-l-0 border-slate-300 dark:border-slate-700">hrs/wk</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300">Proposal Amount</label>
                    <div className="flex">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-l-xl text-xs font-bold flex items-center border border-r-0 border-slate-300 dark:border-slate-700">{projectData.currency}</span>
                      <input 
                        type="number"
                        value={ProposalAmount}
                        onChange={(e) => setProposalAmount(e.target.value)}
                        placeholder="Amount"
                        className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 rounded-r-xl text-xs sm:text-sm focus:outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-gray-300">Delivery in (Days)</label>
                    <div className="flex">
                      <input 
                        type="number"
                        value={deliveryDays}
                        onChange={(e) => setDeliveryDays(e.target.value)}
                        placeholder="Day's"
                        className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 rounded-l-xl text-xs sm:text-sm focus:outline-none text-slate-900 dark:text-white"
                      />
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-3.5 py-2.5 rounded-r-xl text-xs font-bold flex items-center border border-l-0 border-slate-300 dark:border-slate-700">Day</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300">Describe your proposal (Min 100 chars)</label>
                  <span className={`text-[11px] font-bold ${proposalText.length < 100 ? 'text-red-500' : 'text-green-500'}`}>
                    {proposalText.length}/5000
                  </span>
                </div>
                <textarea 
                  rows="6"
                  maxLength={5000}
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  placeholder="Describe your proposal in detail (Minimum 100 characters)..."
                  className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 p-3.5 rounded-xl text-xs sm:text-sm focus:outline-none resize-y text-slate-900 dark:text-white shadow-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsProposalModalOpen(false)} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 font-bold text-xs px-5 py-3 rounded-xl cursor-pointer">
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectDetails;