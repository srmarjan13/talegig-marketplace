import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PrivateNavbar from '../Home/PrivateNavbar';
import { useToast } from '../Home/ToastContext';

// 🟢 গ্লোবাল ডাইনামিক ফি ও কমিশন ক্যালকুলেটর হেল্পার
export const calculateDynamicEarnings = (totalAmount) => {
  const amount = Number(totalAmount) || 0;
  let sellerCommissionRate = 10; // সেলারের জন্য ডিফল্ট ১০%
  let buyerFeeRate = 5;         // বায়ারের জন্য ডিফল্ট ৫%

  try {
    const savedSellerComm = localStorage.getItem('talegig_seller_commission_rate');
    if (savedSellerComm) sellerCommissionRate = Number(savedSellerComm);

    const savedBuyerFee = localStorage.getItem('talegig_buyer_fee_rate');
    if (savedBuyerFee) buyerFeeRate = Number(savedBuyerFee);
  } catch (e) {}

  const buyerServiceFee = amount * (buyerFeeRate / 100);
  const totalPaidByBuyer = amount + buyerServiceFee;
  const sellerCommission = amount * (sellerCommissionRate / 100);
  const sellerNetEarnings = amount - sellerCommission;
  const totalAdminRevenue = buyerServiceFee + sellerCommission;

  return {
    sellerCommissionRate,
    buyerFeeRate,
    baseAmount: amount,
    buyerServiceFee,
    totalPaidByBuyer,
    sellerCommission,
    sellerNetEarnings,
    totalAdminRevenue
  };
};

const BuyerProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [projectData] = useState(() => {
    let rawProj = null;
    if (location.state?.project) {
      rawProj = location.state.project;
    }

    try {
      const savedProposals = localStorage.getItem('talegig_proposals');
      if (savedProposals) {
        const parsed = JSON.parse(savedProposals);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const found = parsed.find(item => String(item.id) === String(id));
          if (found) {
            rawProj = found;
          } else {
            const latest = parsed[0];
            if (latest) rawProj = latest;
          }
        }
      }
    } catch (e) {}

    const budgetStr = String(rawProj?.budget || rawProj?.myproposal || '$0.00 USD').toLowerCase();
    const isHourlyProj = rawProj?.projectType === 'hourly' || budgetStr.includes('/hr') || budgetStr.includes('hour') || budgetStr.includes('hourly');

    if (rawProj) {
      return {
        id: rawProj.id,
        title: rawProj.title || 'Untitled Project',
        description: rawProj.description || 'No description provided.',
        budget: rawProj.myproposal || rawProj.budget || '$0.00 USD',
        projectType: isHourlyProj ? 'hourly' : 'fixed',
        skills: rawProj.skills && rawProj.skills.length > 0 ? rawProj.skills : [],
        badges: rawProj.badges || [],
        files: rawProj.files || [],
        proposalsData: rawProj.proposalsData || [],
        totalProposal: rawProj.totalProposal !== undefined ? rawProj.totalProposal : (rawProj.proposalsData ? rawProj.proposalsData.length : 0),
        rating: 5,
        commentsCount: 0
      };
    }

    return {
      id: id || 1,
      title: 'Project Details',
      description: 'No description provided.',
      budget: '$0.00 USD',
      projectType: 'fixed',
      skills: [],
      badges: [],
      files: [],
      proposalsData: [],
      totalProposal: 0,
      rating: 5,
      commentsCount: 0
    };
  });

  const [currentUser] = useState(() => {
    try {
      const userProfile = JSON.parse(localStorage.getItem('user') || '{}');
      return userProfile.name || userProfile.fullName || 'Saidur Client';
    } catch (e) {
      return 'Saidur Client';
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

  const [awardedFreelancer, setAwardedFreelancer] = useState(() => {
    try {
      const savedProposals = localStorage.getItem('talegig_proposals');
      if (savedProposals) {
        const parsed = JSON.parse(savedProposals);
        const found = parsed.find(item => String(item.id) === String(id));
        if (found && found.awardedTo) return found.awardedTo;
      }
    } catch (e) {}
    return null;
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
            if (found.awardedTo) setAwardedFreelancer(found.awardedTo);
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
  const [proposalSubTab, setProposalSubTab] = useState('active');

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

  const [handoverFiles] = useState(() => {
    try {
      const savedHandover = localStorage.getItem(`talegig_handover_files_${id || projectData.id}`);
      if (savedHandover) return JSON.parse(savedHandover);
    } catch (e) {}
    return [];
  });
  const [previewHandoverId, setPreviewHandoverId] = useState(null);

  const handleDownloadAllAttached = () => {
    if (attachedFiles.length === 0) {
      showToast('No attached files available to download.', 'error');
      return;
    }
    showToast('Downloading all attached project files as a ZIP archive...','success');
  };

  const handleDownloadAllHandover = () => {
    if (handoverFiles.length === 0) {
      showToast('No handover files uploaded yet.','error');
      return;
    }
    showToast(`Downloading all ${handoverFiles.length} handover files...`,'success');
  };

  const [milestones, setMilestones] = useState(() => {
    try {
      const savedMilestones = localStorage.getItem(`talegig_milestones_${id || projectData.id}`);
      if (savedMilestones) return JSON.parse(savedMilestones);
    } catch (e) {}
    return [];
  });

  const updateAndSyncMilestones = (newList) => {
    setMilestones(newList);
    try {
      localStorage.setItem(`talegig_milestones_${id || projectData.id}`, JSON.stringify(newList));
    } catch (e) {}
  };

  const handleAcceptMilestone = (mId) => {
    const confirmMsg = projectData.projectType === 'hourly' ? 'Approve this timesheet log and fund escrow?' : 'Accept this milestone request and fund the escrow?';
    if (window.confirm(confirmMsg)) {
      const updated = milestones.map(m => m.id === mId ? { ...m, status: 'In Progress' } : m);
      updateAndSyncMilestones(updated);
      showToast(projectData.projectType === 'hourly' ? 'Timesheet approved and funds deposited into escrow!' : 'Milestone accepted and funds deposited into escrow (Billed & Pending Release)!','success');
    }
  };

  const handleRejectMilestone = (mId) => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      const updated = milestones.filter(m => m.id !== mId);
      updateAndSyncMilestones(updated);
      showToast('Request rejected.','error');
    }
  };

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneAmount, setMilestoneAmount] = useState('');

  // 🟢 মাইলস্টোন ক্রিয়েট ও ডিপোজিট করার সময় বায়ার ও সেলার কমিশন লজিক ইন্টিগ্রেশন
  const handleCreateMilestoneSubmit = (e) => {
    e.preventDefault();
    if (!milestoneDesc.trim() || !milestoneAmount) {
      showToast('Please fill in both description and amount!','error');
      return;
    }

    const rawAmount = parseFloat(milestoneAmount);
    const dynamicFees = calculateDynamicEarnings(rawAmount);

    const currentDynamicDate = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newM = {
      id: Date.now(),
      date: currentDynamicDate,
      description: milestoneDesc,
      status: 'In Progress',
      amount: rawAmount,
      buyerPaidTotal: dynamicFees.totalPaidByBuyer,
      sellerNet: dynamicFees.sellerNetEarnings,
      adminRevenue: dynamicFees.totalAdminRevenue
    };

    const updated = [...milestones, newM];
    updateAndSyncMilestones(updated);

    // অ্যাডমিন ফিন্যান্স ও গ্রস রেভিনিউ আপডেট
    try {
      const currentGross = parseFloat(localStorage.getItem('talegig_admin_gross_revenue') || '0');
      const currentNetProfit = parseFloat(localStorage.getItem('talegig_admin_total_revenue') || '0');
      localStorage.setItem('talegig_admin_gross_revenue', currentGross + dynamicFees.totalPaidByBuyer);
      localStorage.setItem('talegig_admin_total_revenue', currentNetProfit + dynamicFees.totalAdminRevenue);
      window.dispatchEvent(new Event('storage'));
    } catch (err) {}

    setMilestoneDesc('');
    setMilestoneAmount('');
    setIsMilestoneModalOpen(false);
    showToast(`Milestone funded successfully! Total Buyer Paid: $${dynamicFees.totalPaidByBuyer.toFixed(2)} (Incl. $${dynamicFees.buyerServiceFee.toFixed(2)} Service Fee).`,'success');
  };

  const handleReleaseMilestone = (mId) => {
    const updated = milestones.map(m => m.id === mId ? { ...m, status: 'Released' } : m);
    updateAndSyncMilestones(updated);
    showToast('Payment released to freelancer successfully!','success');
  };

  const handleEndProject = () => {
    if (window.confirm('Are you sure you want to officially end this project?')) {
      setIsProjectEnded(true);
      try {
        localStorage.setItem(`talegig_project_ended_${id || projectData.id}`, JSON.stringify(true));
      } catch (e) {}
      showToast('Project successfully ended! You can now submit your review for the freelancer.','success');
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
      const savedReviews = localStorage.getItem(`talegig_reviews_${id || projectData.id}`);
      if (savedReviews) return JSON.parse(savedReviews);
    } catch(e) {}
    return {};
  });

  const buyerReview = reviewsData.buyerReview || null;
  const sellerReview = reviewsData.sellerReview || null;
  const bothSubmitted = Boolean(buyerReview && sellerReview);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isProjectEnded) {
      showToast('You can only submit a review after the project has officially ended!','error');
      return;
    }
    if (reviewRating === 0 || !reviewText.trim()) {
      showToast('Please provide overall rating and comment.','error');
      return;
    }

    const overallAvg = Number(((reviewRating + communicationRating + qualityRating + deliveryRating + valueRating + professionalismRating) / 6).toFixed(1)) || reviewRating;

    const newBuyerRev = {
      reviewer: 'Buyer',
      name: currentUser,
      rating: overallAvg,
      recommend,
      comment: reviewText,
      date: new Date().toLocaleDateString()
    };

    try {
      const projectKey = `talegig_reviews_${id || projectData.id}`;
      const existingData = JSON.parse(localStorage.getItem(projectKey) || '{}');
      const updatedData = { ...existingData, buyerReview: newBuyerRev };
      localStorage.setItem(projectKey, JSON.stringify(updatedData));
      setReviewsData(updatedData);
      showToast('Review submitted successfully!','success');
    } catch(err) {}
  };

  const [proposalsList, setProposalsList] = useState(() => {
    try {
      const savedProposals = localStorage.getItem('talegig_proposals');
      if (savedProposals) {
        const parsed = JSON.parse(savedProposals);
        const found = parsed.find(item => String(item.id) === String(id));
        if (found && found.proposalsData) {
          return found.proposalsData.map(p => ({ ...p, status: p.status || 'active' }));
        }
      }
    } catch (e) {}
    return (projectData.proposalsData || []).map(p => ({ ...p, status: p.status || 'active' }));
  });

  const handleChat = (freelancerName) => {
    navigate('/sellerdashboard', { state: { activeTab: 'Inbox', chatUser: freelancerName } });
  };

  const handleToggleShortlist = (propId) => {
    setProposalsList(prev => prev.map(p => {
      if (p.id === propId) {
        const newStatus = p.status === 'shortlisted' ? 'active' : 'shortlisted';
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const handleReject = (propId) => {
    setProposalsList(prev => prev.map(p => {
      if (p.id === propId) {
        return { ...p, status: 'rejected' };
      }
      return p;
    }));
  };

  const handleMoveToActive = (propId) => {
    setProposalsList(prev => prev.map(p => {
      if (p.id === propId) {
        return { ...p, status: 'active' };
      }
      return p;
    }));
  };

  // 🟢 প্রজেক্ট অ্যাওয়ার্ড করার সময় বায়ার ও সেলার ডাইনামিক কমিশন ট্রানজ্যাকশন সেভ করা
  const handleAwardFreelancer = (prop) => {
    if (window.confirm(`Are you sure you want to award this project to ${prop.name}?`)) {
      setIsAwarded(true);
      setAwardedFreelancer(prop.name);
      setAwardedBudget(prop.amount);
      setActiveTab('description');

      // বাজেট ফিগার থেকে সংখ্যা বের করা
      const cleanAmt = parseFloat(String(prop.amount).replace(/[^0-9.]/g, '')) || 100;
      const dynamicFees = calculateDynamicEarnings(cleanAmt);

      try {
        const savedProposals = localStorage.getItem('talegig_proposals');
        if (savedProposals) {
          let parsed = JSON.parse(savedProposals);
          parsed = parsed.map(item => {
            if (String(item.id) === String(id)) {
              return {
                ...item,
                isAwarded: true,
                awardedTo: prop.name,
                awardedBudget: prop.amount,
                buyerPaidTotal: dynamicFees.totalPaidByBuyer,
                sellerNet: dynamicFees.sellerNetEarnings,
                adminRevenue: dynamicFees.totalAdminRevenue
              };
            }
            return item;
          });
          localStorage.setItem('talegig_proposals', JSON.stringify(parsed));
        }

        // অ্যাডমিন ফিন্যান্স ও ট্রানজ্যাকশনে লগ সেভ করা
        const currentGross = parseFloat(localStorage.getItem('talegig_admin_gross_revenue') || '0');
        const currentNetProfit = parseFloat(localStorage.getItem('talegig_admin_total_revenue') || '0');
        localStorage.setItem('talegig_admin_gross_revenue', currentGross + dynamicFees.totalPaidByBuyer);
        localStorage.setItem('talegig_admin_total_revenue', currentNetProfit + dynamicFees.totalAdminRevenue);

        const existingTx = JSON.parse(localStorage.getItem('talegig_transactions') || '[]');
        const newTx = {
          id: Date.now(),
          type: 'project_award',
          title: projectData.title,
          sellerName: prop.name,
          amount: cleanAmt,
          buyerPaidTotal: dynamicFees.totalPaidByBuyer,
          adminProfit: dynamicFees.totalAdminRevenue,
          status: 'Successful',
          date: new Date().toLocaleDateString()
        };
        localStorage.setItem('talegig_transactions', JSON.stringify([newTx, ...existingTx]));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {}

      showToast(`Congratulations! You have awarded this project to ${prop.name}.\nTotal Buyer Paid: $${dynamicFees.totalPaidByBuyer.toFixed(2)} (Incl. 5% Buyer Fee).`,'success');
    }
  };

  const activeProposals = proposalsList.filter(p => p.status === 'active');
  const shortlistedProposals = proposalsList.filter(p => p.status === 'shortlisted');
  const rejectedProposals = proposalsList.filter(p => p.status === 'rejected');

  const displayedProposals = proposalSubTab === 'active' 
    ? activeProposals 
    : proposalSubTab === 'shortlisted' 
    ? shortlistedProposals 
    : rejectedProposals;

  return (
    <div className="min-h-screen bg-white dark:bg-[#050b1a] text-slate-900 dark:text-white transition-colors duration-300">
      <PrivateNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        
        {isAwarded && (
          <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 border-2 border-emerald-500/40 p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left mb-6 backdrop-blur-md">
            <div className="space-y-1">
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">👑 ACTIVE CONTRACT</span>
              <h3 className="text-sm sm:text-xl font-black text-slate-900 dark:text-white pt-1">Project awarded to {awardedFreelancer || 'Freelancer'} 🏆</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">Manage milestones, review handover files, and communicate with your freelancer.</p>
            </div>
            <button 
              onClick={() => handleChat(awardedFreelancer || 'Freelancer')}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-7 py-3 rounded-xl shadow-md cursor-pointer shrink-0 transition-all hover:scale-105"
            >
              💬 Chat with Freelancer
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl mb-6">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <span className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-md ${isProjectEnded ? 'bg-purple-500/10 text-purple-600' : isAwarded ? 'bg-pink-500/10 text-pink-600' : 'bg-green-500/10 text-green-600 dark:text-green-500'}`}>
                {isProjectEnded ? 'Project Completed & Ended 🏁' : isAwarded ? 'In Progress / Awarded 🏆' : 'Open for Proposals'}
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
              <p className="text-xs text-slate-500 dark:text-gray-400">{isAwarded ? 'Agreed Budget' : 'Total Proposals'}</p>
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
                  Proposals ({proposalsList.length})
                </button>

                {isAwarded && (
                  <>
                    <button onClick={() => setActiveTab('payment')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'payment' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400'}`}>Payment</button>
                    <button onClick={() => setActiveTab('files')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'files' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400'}`}>Files ({handoverFiles.length})</button>
                    <button onClick={() => setActiveTab('reviews')} className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'reviews' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400'}`}>Reviews {!isProjectEnded && '🔒'}</button>
                  </>
                )}
              </div>
            </div>

            {activeTab === 'description' && (
              <div className="space-y-6">
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
                        onClick={handleDownloadAllAttached}
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
              <div className="space-y-6">
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#111622] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-fit overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setProposalSubTab('active')}
                    className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${proposalSubTab === 'active' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                  >
                    Active ({activeProposals.length})
                  </button>
                  <button
                    onClick={() => setProposalSubTab('shortlisted')}
                    className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${proposalSubTab === 'shortlisted' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                  >
                    Shortlisted ({shortlistedProposals.length})
                  </button>
                  <button
                    onClick={() => setProposalSubTab('rejected')}
                    className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${proposalSubTab === 'rejected' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                  >
                    Rejected ({rejectedProposals.length})
                  </button>
                </div>

                <div className="space-y-4">
                  {displayedProposals.length > 0 ? (
                    displayedProposals.map((prop, idx) => {
                      const isExpanded = expandedProposals[prop.id];
                      return (
                        <div key={prop.id} className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-7 rounded-2xl shadow-sm dark:shadow-xl space-y-5">
                          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                            <div className="flex items-center gap-3.5">
                              <img 
                                src={prop.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'} 
                                alt={prop.name} 
                                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-pink-600 shadow-md shrink-0"
                              />
                              <div>
                                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                                  {prop.name} {idx === 0 && proposalSubTab === 'active' && <span className="text-[10px] bg-pink-600 text-white px-2 py-0.5 rounded font-black">Top Bid</span>}
                                </h4>
                                <p className="text-[11px] sm:text-xs text-amber-500 font-bold mt-1">
                                  ⭐ {prop.rating || 5.0} • 💰 {prop.completionRate || '8.0'} • ⏱️ {prop.onTime || '100%'} on time
                                </p>
                                <p className="text-xs text-slate-500 dark:text-gray-400 italic mt-1">"{prop.tagline || 'Professional Freelancer'}"</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between xl:justify-end gap-3 w-full xl:w-auto pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100 dark:border-slate-800">
                              <div className="text-left xl:text-right shrink-0 pr-2">
                                <p className="text-base sm:text-lg font-black text-pink-600">{prop.amount}</p>
                                <p className="text-[11px] text-slate-400">Delivery in {prop.time}</p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => handleChat(prop.name)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1"
                                >
                                  💬 Chat
                                </button>

                                {prop.status !== 'rejected' && (
                                  <button
                                    onClick={() => handleToggleShortlist(prop.id)}
                                    className={`text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-md ${
                                      prop.status === 'shortlisted'
                                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-gray-200 hover:bg-slate-300 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                    {prop.status === 'shortlisted' ? 'Remove' : '⭐ Shortlist'}
                                  </button>
                                )}

                                {prop.status !== 'rejected' ? (
                                  <button
                                    onClick={() => handleReject(prop.id)}
                                    className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer border border-red-500/20"
                                  >
                                    ✕ Reject
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleMoveToActive(prop.id)}
                                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-gray-200 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                                  >
                                    ↺ Restore
                                  </button>
                                )}

                                {!isAwarded && prop.status !== 'rejected' && (
                                  <button 
                                    onClick={() => handleAwardFreelancer(prop)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg flex items-center gap-1"
                                  >
                                    🏆 Award
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-50 dark:bg-[#111622] p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                            <p className={`text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed font-medium ${!isExpanded ? 'line-clamp-2' : ''}`}>
                              {prop.proposal}
                            </p>
                            
                            {prop.proposal && prop.proposal.length > 90 && (
                              <button 
                                onClick={() => toggleExpand(prop.id)}
                                className="text-xs font-bold text-pink-600 hover:underline cursor-pointer pt-1 block"
                              >
                                {isExpanded ? 'See Less ∧' : 'See All / More ∨'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-12 rounded-2xl text-center">
                      <p className="text-sm font-bold text-slate-500">No {proposalSubTab} proposals found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isAwarded && activeTab === 'payment' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Payment Summary</h3>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <button onClick={() => showToast('Downloading Invoice Summary...')} className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer">
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
                        {unbilledTotal > 0 ? `$${unbilledTotal.toFixed(2)} USD` : '0.00 USD'}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#111622] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500">Billed & Pending Release</p>
                      <p className="text-base sm:text-lg font-extrabold text-blue-500 mt-1">
                        {pendingReleaseTotal > 0 ? `$${pendingReleaseTotal.toFixed(2)} USD` : '0.00 USD'}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#111622] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500">Paid</p>
                      <p className="text-base sm:text-lg font-extrabold text-pink-600 mt-1">
                        {paidTotal > 0 ? `$${paidTotal.toFixed(2)} USD` : '0.00 USD'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {projectData.projectType === 'hourly' ? 'Timesheet Approvals (Hours Log)' : 'Milestone Payments'}
                    </h3>
                    <button onClick={() => setIsMilestoneModalOpen(true)} className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer text-center">
                      {projectData.projectType === 'hourly' ? '+ Log Hours Request' : '+ Create Milestone Request'}
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
                                  {m.status === 'In Progress' ? 'Escrow Funded' : m.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">${m.amount.toFixed(2)}</td>
                              <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                {m.status === 'Pending' && (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button onClick={() => handleAcceptMilestone(m.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer shadow-sm">
                                      Accept 💳
                                    </button>
                                    <button onClick={() => handleRejectMilestone(m.id)} className="bg-red-600/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer border border-red-500/20">
                                      Reject ✕
                                    </button>
                                  </div>
                                )}
                                {m.status === 'In Progress' && (
                                  <button onClick={() => handleReleaseMilestone(m.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer shadow-sm">
                                    Release 💰
                                  </button>
                                )}
                                {m.status === 'Released' && (
                                  <span className="text-xs text-green-500 font-bold">Paid ✓</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-6 text-center">No payment or timesheet logs created yet.</p>
                    )}
                  </div>
                </div>

                {isMilestoneModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-5">
                      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Create & Fund Milestone</h3>
                        <button onClick={() => setIsMilestoneModalOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer text-lg">✕</button>
                      </div>

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
                          <label className="block text-xs font-bold text-slate-700 dark:text-gray-300">Amount (USD)</label>
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
                            Create & Deposit
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAwarded && activeTab === 'files' && (
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Freelancer Handover Files ({handoverFiles.length})
                  </h3>
                  {handoverFiles.length > 0 && (
                    <button 
                      onClick={handleDownloadAllHandover}
                      className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer text-center"
                    >
                      ↓ Download All Files
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {handoverFiles.length > 0 ? (
                    handoverFiles.map((file, idx) => (
                      <div key={idx} className="space-y-2">
                        <div onClick={() => setPreviewHandoverId(previewHandoverId === idx ? null : idx)} className="flex items-center justify-between bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 p-3.5 sm:p-4 rounded-xl cursor-pointer hover:border-pink-500">
                          <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 truncate pr-2">📎 {file.name}</span>
                          <span className="text-xs text-slate-400 font-semibold shrink-0">{previewHandoverId === idx ? 'Hide ∧' : 'View ∨'}</span>
                        </div>
                        {previewHandoverId === idx && (
                          <div className="p-4 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-xl text-center space-y-3">
                            {file.type && file.type.includes('image') ? <img src={file.url} alt={file.name} className="max-h-48 mx-auto rounded-lg object-contain shadow-md" /> : <p className="text-xs text-slate-500">Document preview: {file.name}</p>}
                            <a href={file.url} download={file.name} className="inline-block bg-pink-600 text-white text-xs font-bold px-4 py-2 rounded-lg">Download File</a>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">No handover files uploaded yet.</p>
                  )}
                </div>
              </div>
            )}

            {isAwarded && activeTab === 'reviews' && (
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm dark:shadow-xl space-y-6">
                {!isProjectEnded ? (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-2">
                    <p className="text-base font-bold text-amber-500">🔒 Review Window Locked</p>
                    <p className="text-xs text-slate-400">Order must be officially ended before leaving a review.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bothSubmitted ? (
                      <div className="space-y-4">
                        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-pink-600 dark:text-pink-500">Your Review (Buyer)</span>
                            <span className="text-[11px] text-slate-400 font-medium">{buyerReview?.date}</span>
                          </div>
                          <div className="flex gap-1.5 text-amber-500 text-xl sm:text-2xl">
                            {[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= (buyerReview?.rating || 0) ? '★' : '☆'}</span>)}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">{buyerReview?.comment}</p>
                        </div>

                        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Review from Freelancer</span>
                            <span className="text-[11px] text-slate-400 font-medium">{sellerReview?.date}</span>
                          </div>
                          <div className="flex gap-1.5 text-amber-500 text-xl sm:text-2xl">
                            {[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= (sellerReview?.rating || 0) ? '★' : '☆'}</span>)}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">{sellerReview?.comment}</p>
                        </div>
                      </div>
                    ) : buyerReview ? (
                      <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center space-y-2">
                        <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">⏳ Review Submitted Successfully</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">As per TaleGig marketplace standards (Upwork style), both parties' reviews will become visible once the other party also submits their review.</p>
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
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop" 
                    alt="Buyer Profile" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-pink-600 shadow-md"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{currentUser}</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400">@saidurbuyer (Project Owner)</p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-gray-300 text-left">
                  <div className="flex justify-between">
                    <span>Member since</span>
                    <span className="font-bold text-slate-900 dark:text-white">2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Projects Posted</span>
                    <span className="font-bold text-slate-900 dark:text-white">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Verification</span>
                    <span className="font-bold text-green-500">Verified ✓</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default BuyerProjectDetails;