import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PrivateNavbar from './PrivateNavbar';
import { useToast } from '../Home/ToastContext';

// 🟢 গ্লোবাল ডাইনামিক ফি ও কমিশন ক্যালকুলেটর হেল্পার
export const calculateDynamicEarnings = (totalAmount) => {
  const amount = Number(totalAmount) || 0;
  let sellerCommissionRate = 10;
  let buyerFeeRate = 5;

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

  return { sellerCommissionRate, buyerFeeRate, baseAmount: amount, buyerServiceFee, totalPaidByBuyer, sellerCommission, sellerNetEarnings, totalAdminRevenue };
};

const BuyerContestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [contestData, setContestData] = useState(location.state?.contest || {
    id: id || "1",
    title: 'Minimalist Tech Startup Logo Design Contest',
    description: 'We need a sleek, high-contrast, geometric brand identity package.',
    budget: '$350 USD',
    budgetNum: 350,
    skills: ['Logo Design', 'Branding'],
    badges: ['FEATURED', 'URGENT'],
    files: [],
    proposalsData: [],
    totalProposal: 0,
    awardedEntries: [],
    paymentState: 'unbilled'
  });

  // 🟢 ব্যাকএন্ড থেকে ডেটা ফেচ করার ইফেক্ট
  useEffect(() => {
    const fetchContestDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/projects/${id}`);
        if (response.ok) {
          const item = await response.json();
          // এখানে আপনার আইটেম অনুযায়ী state আপডেট করা হয়েছে
          setContestData(prev => ({ ...prev, ...item }));
        }
      } catch (err) {
        showToast('Error loading contest details', 'error');
      }
    };
    if (id) fetchContestDetails();
  }, [id]);

  const updateLocalStorageData = async (updatedList, awardedArr) => {
    try {
      // 🟢 ব্যাকএন্ডে রিয়েল-টাইম ডেটা আপডেট করার ফেচ কল
      const response = await fetch(`http://localhost:3001/api/projects/update/${contestData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalsData: updatedList,
          awardedEntries: awardedArr,
          paymentState: paymentState
        })
      });

      if (!response.ok) {
        console.error('Failed to sync changes with backend database');
      }
    } catch (err) {
      console.error("Backend sync error:", err);
    }
  };

  // আপনার অরিজিনাল বাকি সব লজিক এখানে হুবহু থাকবে
  const [activeTab, setActiveTab] = useState('description');
  const [entrySubTab, setEntrySubTab] = useState('Active Entries');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [selectedPreviewEntry, setSelectedPreviewEntry] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [newCommentText, setNewCommentText] = useState('');
  const [entriesList, setEntriesList] = useState(() => contestData.proposalsData || []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(contestData.title);
  const [editDesc, setEditDesc] = useState(contestData.description);
  const [editBudget, setEditBudget] = useState(contestData.budget);
  const [editBadges, setEditBadges] = useState(contestData.badges || []);
  const [editFiles, setEditFiles] = useState(contestData.files || []);

  const isGuaranteed = contestData.badges && contestData.badges.some(b => b.toLowerCase().includes('guarant'));
  const [paymentState, setPaymentState] = useState(contestData.paymentState || (isGuaranteed ? 'pending_release' : 'unbilled'));

  const [handoverFiles, setHandoverFiles] = useState(() => {
    try {
      const savedHandover = localStorage.getItem(`talegig_handover_files_${id || contestData.id}`);
      if (savedHandover) return JSON.parse(savedHandover);
    } catch (e) {}
    return [];
  });

  const [isContestEnded, setIsContestEnded] = useState(() => {
    try {
      const savedStatus = localStorage.getItem(`talegig_project_ended_${id || contestData.id}`);
      return savedStatus ? JSON.parse(savedStatus) : false;
    } catch(e) {}
    return false;
  });
  
  // Review Form States
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
      return JSON.parse(localStorage.getItem(`talegig_reviews_${id || contestData.id}`) || '{}');
    } catch(e) {}
    return {};
  });

  const buyerReview = reviewsData.buyerReview || null;
  const sellerReview = reviewsData.sellerReview || null;
  const bothSubmitted = Boolean(buyerReview && sellerReview);

  const [previewBriefFileId, setPreviewBriefFileId] = useState(null);
  const [previewHandoverFileId, setPreviewHandoverFileId] = useState(null);

  const briefFiles = (contestData.files && contestData.files.length > 0) 
    ? contestData.files.map((file, idx) => ({
        id: file.id || idx + 1,
        name: file.name || `File_${idx + 1}`,
        type: file.type && file.type.includes('image') ? 'image' : 'doc',
        url: file.url || '#'
      }))
    : [];

  const updatePaymentStateInStorage = (newState, awardedArr = contestData.awardedEntries) => {
    setPaymentState(newState);
    try {
      const savedProposals = localStorage.getItem('talegig_proposals');
      if (savedProposals) {
        let parsed = JSON.parse(savedProposals);
        parsed = parsed.map(item => {
          if (String(item.id) === String(contestData.id)) {
            return { ...item, paymentState: newState, awardedEntries: awardedArr, awardedEntry: awardedArr[0] || null };
          }
          return item;
        });
        localStorage.setItem('talegig_proposals', JSON.stringify(parsed));
      }
    } catch (err) {}
  };

  const handleDownloadAllBrief = () => {
    if (briefFiles.length === 0) { showToast('No brief files available.'); return; }
    showToast('Downloading all brief files...');
  };

  const handleDownloadAllHandover = () => {
    if (handoverFiles.length === 0) { showToast('No handover files uploaded by seller yet.'); return; }
    showToast('Downloading all seller handover files...');
  };

  const handleRateEntry = (e, entryId, stars) => {
    e.stopPropagation();
    const updated = entriesList.map(item => item.id === entryId ? { ...item, starRating: stars } : item);
    setEntriesList(updated);
    updateLocalStorageData(updated, contestData.awardedEntries);
  };

  // 🟢 কনটেস্ট অ্যাওয়ার্ড করার সময় বায়ার ও সেলার ডাইনামিক কমিশন ট্রানজ্যাকশন সেভ করা
  const handleAwardEntry = (entry) => {
    const currentAwarded = contestData.awardedEntries || [];
    if (currentAwarded.length > 0 && paymentState !== 'paid') {
      showToast('Payment Rule: You must complete and fully release the payment for the previous winner before awarding another entry!','error');
      setActiveTab('payment');
      return;
    }

    if (window.confirm(`Are you sure you want to award this contest to ${entry.name}?`)) {
      const newAwardedList = [...currentAwarded, entry];
      const updatedContest = { ...contestData, awardedEntries: newAwardedList, awardedEntry: newAwardedList[0] };
      setContestData(updatedContest);
      updateLocalStorageData(entriesList, newAwardedList);
      updatePaymentStateInStorage(isGuaranteed ? 'pending_release' : 'unbilled', newAwardedList);

      const budgetNum = contestData.budgetNum || 350;
      const dynamicFees = calculateDynamicEarnings(budgetNum);

      try {
        const existingEntries = JSON.parse(localStorage.getItem('talegig_entry')) || [];
        const updatedEntries = existingEntries.map(item => {
          if (String(item.contestId || item.id) === String(contestData.id || id)) {
            return {
              ...item,
              status: 'awarded',
              isAwarded: true
            };
          }
          return item;
        });
        localStorage.setItem('talegig_entry', JSON.stringify(updatedEntries));

        // অ্যাডমিন ফিন্যান্স ও ট্রানজ্যাকশনে লগ সেভ করা
        const currentGross = parseFloat(localStorage.getItem('talegig_admin_gross_revenue') || '0');
        const currentNetProfit = parseFloat(localStorage.getItem('talegig_admin_total_revenue') || '0');
        localStorage.setItem('talegig_admin_gross_revenue', currentGross + dynamicFees.totalPaidByBuyer);
        localStorage.setItem('talegig_admin_total_revenue', currentNetProfit + dynamicFees.totalAdminRevenue);

        const existingTx = JSON.parse(localStorage.getItem('talegig_transactions') || '[]');
        const newTx = {
          id: Date.now(),
          type: 'contest_award',
          title: contestData.title,
          sellerName: entry.name,
          amount: budgetNum,
          buyerPaidTotal: dynamicFees.totalPaidByBuyer,
          adminProfit: dynamicFees.totalAdminRevenue,
          status: 'Successful',
          date: new Date().toLocaleDateString()
        };
        localStorage.setItem('talegig_transactions', JSON.stringify([newTx, ...existingTx]));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {}

      showToast(`Contest successfully awarded to ${entry.name}!\nTotal Buyer Paid: $${dynamicFees.totalPaidByBuyer.toFixed(2)} (Incl. 5% Buyer Fee).`,'success');
      setActiveTab('payment');
    }
  };

  const handleDepositPayment = () => {
    const budgetNum = contestData.budgetNum || 350;
    const dynamicFees = calculateDynamicEarnings(budgetNum);

    if (window.confirm(`Processing card charge of $${dynamicFees.totalPaidByBuyer.toFixed(2)} USD (including $${dynamicFees.buyerServiceFee.toFixed(2)} buyer service fee) from your saved card. Click OK to confirm deposit.`)) {
      updatePaymentStateInStorage('pending_release', contestData.awardedEntries);

      try {
        const currentGross = parseFloat(localStorage.getItem('talegig_admin_gross_revenue') || '0');
        const currentNetProfit = parseFloat(localStorage.getItem('talegig_admin_total_revenue') || '0');
        localStorage.setItem('talegig_admin_gross_revenue', currentGross + dynamicFees.totalPaidByBuyer);
        localStorage.setItem('talegig_admin_total_revenue', currentNetProfit + dynamicFees.totalAdminRevenue);
        window.dispatchEvent(new Event('storage'));
      } catch(e) {}

      showToast('Payment successfully deposited into Escrow!', 'success');
    }
  };

  const handleReleasePayment = () => {
    updatePaymentStateInStorage('paid', contestData.awardedEntries);
    showToast('Payment released to the winner successfully!', 'success');
  };

  const handleEndContest = () => {
    if (window.confirm('Are you sure you want to officially end this contest? Order Status is now Completed!')) {
      setIsContestEnded(true);
      try {
        localStorage.setItem(`talegig_project_ended_${id || contestData.id}`, JSON.stringify(true));
      } catch(e) {}
      showToast('Order Completed! Review window is now open.', 'success');
      setActiveTab('reviews');
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isContestEnded) {
      showToast('Review Error: Order "Completed" status is required.','error');
      return;
    }
    if (!reviewText.trim() || reviewRating === 0) {
      showToast('Please provide overall rating and comment.','error');
      return;
    }

    const overallAvg = Number(((reviewRating + communicationRating + qualityRating + deliveryRating + valueRating + professionalismRating) / 6).toFixed(1)) || reviewRating;

    const newBuyerRev = {
      reviewer: 'Buyer',
      name: 'Saidur Client',
      rating: overallAvg,
      recommend,
      comment: reviewText,
      date: new Date().toLocaleDateString()
    };

    try {
      const contestKey = `talegig_reviews_${id || contestData.id}`;
      const existingData = JSON.parse(localStorage.getItem(contestKey) || '{}');
      const updatedData = { ...existingData, buyerReview: newBuyerRev };
      localStorage.setItem(contestKey, JSON.stringify(updatedData));
      setReviewsData(updatedData);

      if (updatedData.sellerReview) {
        const publicReviews = JSON.parse(localStorage.getItem('talegig_freelancer_reviews') || '[]');
        const finalPubReview = {
          orderId: contestData.id,
          freelancerName: contestData.awardedEntries?.[0]?.name || 'Md Saidur Rahman',
          overallRating: overallAvg,
          comment: reviewText,
          status: 'Approved',
          date: new Date().toLocaleDateString()
        };
        localStorage.setItem('talegig_freelancer_reviews', JSON.stringify([...publicReviews, finalPubReview]));
        showToast('Both parties have submitted reviews! Published to Seller Profile.','success');
      } else {
        showToast('Review submitted successfully! Waiting for seller review.','success');
      }
    } catch(err) {}
  };

  const handleShortlistEntry = (e, entryId) => {
    e.stopPropagation();
    const updated = entriesList.map(item => item.id === entryId ? { ...item, category: item.category === 'Shortlisted' ? 'Active' : 'Shortlisted' } : item);
    setEntriesList(updated);
    updateLocalStorageData(updated, contestData.awardedEntries);
  };

  const handleRejectEntry = (e, entryId) => {
    e.stopPropagation();
    const updated = entriesList.map(item => item.id === entryId ? { ...item, isRejected: true, category: 'Rejected' } : item);
    setEntriesList(updated);
    updateLocalStorageData(updated, contestData.awardedEntries);
  };

  const handleProfileClick = (e, freelancerName) => {
    e.stopPropagation();
    navigate('/sellerprofile', { state: { freelancerName } });
  };

  const handleMessageFreelancer = (e, freelancerName) => {
    e.stopPropagation();
    navigate('/sellerdashboard', { state: { activeTab: 'Inbox', chatUser: freelancerName } });
  };

  const handleAddComment = (e, entryId) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newCommentObj = {
      id: Date.now(),
      author: 'Buyer (Benjamin)',
      text: newCommentText,
      date: new Date().toLocaleDateString()
    };

    const updated = entriesList.map(item => {
      if (item.id === entryId) {
        const comms = item.comments || [];
        return { ...item, comments: [...comms, newCommentObj] };
      }
      return item;
    });

    setEntriesList(updated);
    setSelectedPreviewEntry(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newCommentObj]
    }));
    setNewCommentText('');
    updateLocalStorageData(updated, contestData.awardedEntries);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const oldBudgetNum = parseFloat(String(contestData.budget).replace(/[^0-9.]/g, '')) || 0;
    const newBudgetNum = parseFloat(String(editBudget).replace(/[^0-9.]/g, '')) || 0;

    if (newBudgetNum < oldBudgetNum) {
      showToast('You cannot decrease the budget!','error');
      return;
    }

    const updated = {
      ...contestData,
      title: editTitle,
      description: editDesc,
      budget: `$${newBudgetNum} USD`,
      budgetNum: newBudgetNum,
      badges: editBadges,
      files: editFiles
    };

    setContestData(updated);
    setIsEditModalOpen(false);
    showToast('Contest updated successfully!','success');
  };

  const handleNewFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newUploaded = files.map(file => ({ name: file.name, type: file.type, url: URL.createObjectURL(file) }));
    setEditFiles([...editFiles, ...newUploaded]);
  };

  const handleRemoveEditFile = (index) => {
    setEditFiles(editFiles.filter((_, i) => i !== index));
  };

  const awardedArr = contestData.awardedEntries || [];
  const hasAwarded = awardedArr.length > 0;
  const budgetVal = contestData.budgetNum || 350;

  const activeEntriesCount = entriesList.filter(e => !e.isRejected && e.category !== 'Rejected').length;
  const shortlistedCount = entriesList.filter(e => e.category === 'Shortlisted').length;
  const rejectedCount = entriesList.filter(e => e.isRejected || e.category === 'Rejected').length;
  const highlightedCount = entriesList.filter(e => e.isHighlighted || e.category === 'Highlighted').length;

  const filteredEntries = entriesList.filter(e => {
    if (entrySubTab === 'Active Entries') return !e.isRejected && e.category !== 'Rejected';
    if (entrySubTab === 'Shortlisted') return e.category === 'Shortlisted';
    if (entrySubTab === 'Rejected') return e.isRejected || e.category === 'Rejected';
    if (entrySubTab === 'Highlighted') return e.isHighlighted || e.category === 'Highlighted';
    return true;
  }).sort((a, b) => {
    const isAWinner = awardedArr.some(w => String(w.id) === String(a.id));
    const isBWinner = awardedArr.some(w => String(w.id) === String(b.id));
    if (isAWinner && !isBWinner) return -1;
    if (!isAWinner && isBWinner) return 1;
    return (b.starRating || 0) - (a.starRating || 0);
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#050b1a] text-slate-900 dark:text-white transition-colors duration-300">
      <PrivateNavbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-6">
        
        {hasAwarded && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-xs font-bold text-emerald-400">🏆 Contest Winner(s) Assigned ({awardedArr.length})</p>
              <h3 className="text-lg font-extrabold text-white">{awardedArr.map(w => w.name).join(', ')}</h3>
              <p className="text-xs text-slate-400">You can directly message the winner regarding project deliverables.</p>
            </div>
            <button 
              onClick={(e) => handleMessageFreelancer(e, awardedArr[0]?.name)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg cursor-pointer shrink-0"
            >
              💬 Message Winner
            </button>
          </div>
        )}

        {/* টপ হেডার কার্ড */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-7 rounded-3xl shadow-lg space-y-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="bg-pink-500/10 text-pink-500 text-[11px] sm:text-xs font-extrabold px-3 py-1 rounded-md">Buyer Control Panel 🛡️</span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-gray-400 font-medium">⏳ Time left: <span className="text-slate-900 dark:text-white font-bold">3 days left</span></span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {contestData.badges && contestData.badges.map((badge, idx) => {
                  const bLower = badge.toLowerCase();
                  let badgeBgColor = 'bg-pink-600';
                  if (bLower.includes('featured')) badgeBgColor = 'bg-amber-600';
                  else if (bLower.includes('guranteed') || bLower.includes('guaranteed')) badgeBgColor = 'bg-green-600';
                  else if (bLower.includes('urgent')) badgeBgColor = 'bg-red-600';
                  else if (bLower.includes('nda')) badgeBgColor = 'bg-blue-600';
                  else if (bLower.includes('sealed')) badgeBgColor = 'bg-sky-500';

                  return (
                    <span key={idx} className={`${badgeBgColor} text-white text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase`}>{badge}</span>
                  );
                })}
              </div>

              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">{contestData.title}</h1>
            </div>

            <div className="flex flex-col items-start md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800">
              <button onClick={() => setIsEditModalOpen(true)} className="bg-slate-200 dark:bg-slate-800 hover:bg-pink-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow">✏️ Edit Contest</button>
              <div className="text-left md:text-right">
                <span className="text-xl sm:text-3xl font-black text-pink-600 dark:text-pink-500 tracking-tight">{contestData.budget}</span>
                <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-bold">Contest Budget</p>
              </div>
            </div>
          </div>
        </div>

        {/* মেইন গ্রিড লেআউট */}
        <div className={`grid grid-cols-1 ${hasAwarded && activeTab !== 'entries' ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-8 items-start`}>
          
          <div className={`${hasAwarded && activeTab !== 'entries' ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
            
            {/* ট্যাব নেভিগেশন */}
            <div className="flex items-center gap-2 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
              <button onClick={() => setActiveTab('description')} className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'description' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400'}`}>Description</button>
              <button onClick={() => setActiveTab('entries')} className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'entries' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400'}`}>Entries ({entriesList.length})</button>

              {hasAwarded && (
                <>
                  <button onClick={() => setActiveTab('payment')} className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'payment' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400'}`}>Payment & Escrow</button>
                  <button onClick={() => setActiveTab('files')} className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'files' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400'}`}>Files</button>
                  <button onClick={() => setActiveTab('reviews')} className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'reviews' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-600 dark:text-gray-400'}`}>Reviews</button>
                </>
              )}
            </div>

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                  <div className={`whitespace-pre-line ${!isDescExpanded ? 'line-clamp-4' : ''}`}>{contestData.description}</div>
                  {contestData.description && contestData.description.length > 200 && (
                    <button onClick={() => setIsDescExpanded(!isDescExpanded)} className="text-xs font-bold text-pink-600 hover:underline cursor-pointer block pt-1">{isDescExpanded ? 'See Less ∧' : 'See More ∨'}</button>
                  )}
                </div>

                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Contest Brief & Reference Files</h3>
                    {briefFiles.length > 0 && (
                      <button onClick={handleDownloadAllBrief} className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer">↓ Download all</button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {briefFiles.length > 0 ? (
                      briefFiles.map((file) => (
                        <div key={file.id} className="space-y-2">
                          <div onClick={() => setPreviewBriefFileId(previewBriefFileId === file.id ? null : file.id)} className="flex items-center justify-between bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl cursor-pointer hover:border-pink-500 transition">
                            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                              <span>📎</span><span>{file.name}</span>
                            </div>
                            <span className="text-xs text-slate-400 font-semibold">{previewBriefFileId === file.id ? 'Hide ∧' : 'View / Download ∨'}</span>
                          </div>
                          {previewBriefFileId === file.id && (
                            <div className="p-4 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 text-center">
                              {file.type === 'image' ? <img src={file.url} alt={file.name} className="max-h-48 mx-auto rounded-lg object-contain shadow-md" /> : <p className="text-xs text-slate-500">Document preview not available.</p>}
                              <a href={file.url} download className="inline-block bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition">Download File</a>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">No attached reference files provided.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {contestData.skills.map((skill, idx) => (
                      <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 text-xs px-3.5 py-1.5 rounded-full font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Entries Tab */}
            {activeTab === 'entries' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-2 rounded-full shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {[
                    { name: 'Active Entries', count: activeEntriesCount },
                    { name: 'Shortlisted', count: shortlistedCount },
                    { name: 'Highlighted', count: highlightedCount },
                    { name: 'Rejected', count: rejectedCount }
                  ].map((tab) => (
                    <button 
                      key={tab.name}
                      onClick={() => setEntrySubTab(tab.name)}
                      className={`py-2 px-6 rounded-full font-bold text-xs transition cursor-pointer whitespace-nowrap ${
                        entrySubTab === tab.name 
                          ? 'bg-[#e6007a] text-white shadow-md' 
                          : 'bg-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.name} ({tab.count})
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredEntries.map((entry) => {
                    const isWinner = awardedArr.some(w => String(w.id) === String(entry.id));
                    const isHighlighted = entry.isHighlighted || entry.category === 'Highlighted';
                    return (
                      <div 
                        key={entry.id}
                        onClick={() => { setSelectedPreviewEntry(entry); setActiveImageIndex(0); }}
                        className={`bg-white dark:bg-[#0b0f19] border rounded-3xl p-5 shadow-xl space-y-4 cursor-pointer transition relative w-full ${isWinner ? 'border-emerald-500 ring-2 ring-emerald-500/30' : isHighlighted ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-200 dark:border-slate-800 hover:border-pink-500'}`}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span 
                            onClick={(e) => handleProfileClick(e, entry.name)}
                            className="font-bold text-base text-blue-600 dark:text-blue-400 hover:underline truncate block"
                          >
                            {entry.name}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {isWinner && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded font-extrabold animate-pulse">🏆 Winner</span>}
                            {isHighlighted && !isWinner && <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded font-extrabold">⭐ Highlighted</span>}
                            {entry.category === 'Shortlisted' && !isWinner && !isHighlighted && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">Shortlisted</span>}
                          </div>
                        </div>

                        <div className="h-44 w-full bg-slate-50 dark:bg-[#111622] rounded-2xl overflow-hidden flex items-center justify-center shadow-inner shrink-0">
                          {entry.previewImages?.length > 0 ? (
                            <img src={entry.previewImages[0]} alt="preview" className="h-44 w-full object-cover rounded-2xl" />
                          ) : (
                            <span className="text-slate-400 text-xs">Click to Preview</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-0.5 text-3xl">
                            {[1, 2, 3, 4, 5].map((starNum) => (
                              <span key={starNum} onClick={(e) => handleRateEntry(e, entry.id, starNum)} className={`cursor-pointer hover:scale-125 transition ${starNum <= (entry.starRating || 0) ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'}`}>★</span>
                            ))}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold leading-tight">ENTRY</span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight">#{entry.entryNumber || 1}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button onClick={(e) => { e.stopPropagation(); handleAwardEntry(entry); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 rounded-lg shadow cursor-pointer text-center">🏆 Award</button>
                          <button onClick={(e) => handleShortlistEntry(e, entry.id)} className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold py-1.5 rounded-lg shadow cursor-pointer text-center">⭐ Shortlist</button>
                          <button onClick={(e) => handleRejectEntry(e, entry.id)} className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold py-1.5 rounded-lg shadow cursor-pointer text-center">❌ Reject</button>
                          <button onClick={(e) => handleMessageFreelancer(e, entry.name)} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1.5 rounded-lg shadow cursor-pointer text-center">💬 Message</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment & Escrow Tab */}
            {hasAwarded && activeTab === 'payment' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <h3 className="text-base font-bold">Payment Summary</h3>
                    {paymentState === 'paid' && !isContestEnded && (
                      <button onClick={handleEndContest} className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow cursor-pointer animate-bounce">End Project / Contest (Complete Order) 🏁</button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-left">
                    <div>
                      <p className="text-xs text-slate-500">Unbilled</p>
                      <p className="text-base font-extrabold text-amber-500 mt-1">${paymentState === 'unbilled' ? budgetVal.toFixed(2) : '0.00'} USD</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Pending Release</p>
                      <p className="text-base font-extrabold text-blue-500 mt-1">${paymentState === 'pending_release' ? budgetVal.toFixed(2) : '0.00'} USD</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Paid</p>
                      <p className="text-base font-extrabold text-pink-600 mt-1">${paymentState === 'paid' ? budgetVal.toFixed(2) : '0.00'} USD</p>
                    </div>
                  </div>

                  {isGuaranteed && paymentState === 'pending_release' && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <p className="text-sm font-bold text-blue-400">ℹ️ Funds in Escrow (Guaranteed Project)</p>
                        <p className="text-xs text-slate-400">Satisfied with the work? Release the payment to the winner now.</p>
                      </div>
                      <button onClick={handleReleasePayment} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shrink-0">Release Payment 💸</button>
                    </div>
                  )}

                  {!isGuaranteed && paymentState === 'unbilled' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <p className="text-sm font-bold text-red-500">⚠️ Payment Unbilled (Non-Guaranteed)</p>
                        <p className="text-xs text-slate-400">Payment is currently unbilled. Please deposit the prize money using your saved card.</p>
                      </div>
                      <button onClick={handleDepositPayment} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shrink-0 animate-pulse">Deposit Payment 💳</button>
                    </div>
                  )}

                  {!isGuaranteed && paymentState === 'pending_release' && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <p className="text-sm font-bold text-blue-400">ℹ️ Funds Deposited in Escrow</p>
                        <p className="text-xs text-slate-400">Work is completed. You can now release the payment.</p>
                      </div>
                      <button onClick={handleReleasePayment} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shrink-0">Release Payment 💸</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Files Tab */}
            {hasAwarded && activeTab === 'files' && (
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Project Files & Handover</h3>
                  {handoverFiles.length > 0 && (
                    <button onClick={handleDownloadAllHandover} className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer">↓ Download all</button>
                  )}
                </div>

                <div className="space-y-3">
                  {handoverFiles.length > 0 ? (
                    handoverFiles.map((file, idx) => (
                      <div key={idx} className="space-y-2">
                        <div onClick={() => setPreviewHandoverFileId(previewHandoverFileId === idx ? null : idx)} className="flex items-center justify-between bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl cursor-pointer hover:border-pink-500 transition">
                          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            <span>📎</span><span>{file.name || `Handover_File_${idx+1}`}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-semibold">{previewHandoverFileId === idx ? 'Hide ∧' : 'View / Download ∨'}</span>
                        </div>
                        {previewHandoverFileId === idx && (
                          <div className="p-4 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 text-center">
                            {file.type && file.type.includes('image') ? <img src={file.url} alt={file.name} className="max-h-48 mx-auto rounded-lg object-contain shadow-md" /> : <p className="text-xs text-slate-500">Document preview not available.</p>}
                            <a href={file.url} download className="inline-block bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition">Download File</a>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">No handover files uploaded by the winner yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {hasAwarded && activeTab === 'reviews' && (
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
                {!isContestEnded ? (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-2">
                    <p className="text-base font-bold text-amber-500">🔒 Review Window Locked</p>
                    <p className="text-xs text-slate-400">Order must be "Completed" before leaving a review.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bothSubmitted ? (
                      <>
                        <div className="p-4 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-blue-400">Review from Seller</span>
                            <span className="text-[10px] text-slate-400">{sellerReview.date}</span>
                          </div>
                          <div className="flex gap-1 text-amber-500 text-sm">
                            {[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= sellerReview.rating ? '★' : '☆'}</span>)}
                          </div>
                          <p className="text-xs text-slate-300">{sellerReview.comment}</p>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-pink-500">Your Review (Buyer)</span>
                            <span className="text-[10px] text-slate-400">{buyerReview.date}</span>
                          </div>
                          <div className="flex gap-1 text-amber-500 text-sm">
                            {[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= buyerReview.rating ? '★' : '☆'}</span>)}
                          </div>
                          <p className="text-xs text-slate-300">{buyerReview.comment}</p>
                        </div>
                      </>
                    ) : buyerReview ? (
                      <div className="p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-center space-y-2">
                        <p className="text-base font-bold text-indigo-400">⏳ Review Submitted Successfully</p>
                        <p className="text-xs text-slate-400">As per TaleGig marketplace standards (Upwork style), both parties' reviews will become visible once the seller also submits their review.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-6 pt-4 border-t border-slate-800">
                        <div className="space-y-1">
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Leave a Review for {contestData.awardedEntry?.name}</h3>
                          <p className="text-xs text-slate-400">Rate your experience across multiple categories (1-5 Stars)</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-xs">
                          <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                            <span className="font-semibold text-slate-300">Overall Rating:</span>
                            <div className="flex gap-1 text-xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setReviewRating(s)} className={`cursor-pointer transition ${s <= reviewRating ? 'text-amber-500' : 'text-slate-600'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                            <span className="font-semibold text-slate-300">Communication:</span>
                            <div className="flex gap-1 text-xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setCommunicationRating(s)} className={`cursor-pointer transition ${s <= communicationRating ? 'text-amber-500' : 'text-slate-600'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                            <span className="font-semibold text-slate-300">Quality of Work:</span>
                            <div className="flex gap-1 text-xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setQualityRating(s)} className={`cursor-pointer transition ${s <= qualityRating ? 'text-amber-500' : 'text-slate-600'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                            <span className="font-semibold text-slate-300">Delivery Time:</span>
                            <div className="flex gap-1 text-xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setDeliveryRating(s)} className={`cursor-pointer transition ${s <= deliveryRating ? 'text-amber-500' : 'text-slate-600'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                            <span className="font-semibold text-slate-300">Value for Money:</span>
                            <div className="flex gap-1 text-xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setValueRating(s)} className={`cursor-pointer transition ${s <= valueRating ? 'text-amber-500' : 'text-slate-600'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                            <span className="font-semibold text-slate-300">Professionalism:</span>
                            <div className="flex gap-1 text-xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setProfessionalismRating(s)} className={`cursor-pointer transition ${s <= professionalismRating ? 'text-amber-500' : 'text-slate-600'}`}>★</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 pt-2">
                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Would Recommend? (Yes / No)</label>
                            <select value={recommend} onChange={(e) => setRecommend(e.target.value)} className="w-full bg-[#111622] border border-slate-700 p-2.5 rounded-xl text-xs text-white outline-none">
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Review Description / Comment</label>
                            <textarea rows="4" value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Write detailed feedback about your experience..." required className="w-full bg-[#111622] border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-pink-500 resize-none"></textarea>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow">Submit & Publish Review ⭐</button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ডান পাশের উইনার প্রফাইল কার্ড */}
          {hasAwarded && activeTab !== 'entries' && (
            <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 text-center">
                <div className="flex flex-col items-center space-y-2.5">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop" alt="Winner" className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{contestData.awardedEntry?.name || 'Md Saidur Rahman'}</h3>
                    <p className="text-[11px] text-emerald-500 font-bold">🏆 Contest Winner</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                    <span>⭐ 4.9</span><span className="text-slate-400">|</span><span className="text-slate-600 dark:text-gray-300">💬 24 reviews</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-gray-300 text-left">
                  <div className="flex justify-between"><span>Awarded Entry</span><span className="font-bold text-slate-900 dark:text-white">#{contestData.awardedEntry?.entryNumber || 1}</span></div>
                  <div className="flex justify-between"><span>Prize Amount</span><span className="font-bold text-pink-600">{contestData.budget}</span></div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* এডিট কনটেস্ট পপআপ মডাল */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111622] border border-slate-800 w-full max-w-xl p-6 rounded-3xl shadow-sm space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold">Edit Contest Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 font-bold text-xl cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Contest Title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required className="w-full bg-[#0b0f19] border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-pink-500" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Budget (USD) - Can only increase</label>
                <input type="text" value={editBudget} onChange={(e) => setEditBudget(e.target.value)} required className="w-full bg-[#0b0f19] border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-pink-500" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
                <textarea rows="4" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} required className="w-full bg-[#0b0f19] border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-pink-500 resize-none"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Attached Files</label>
                {editFiles.length > 0 ? (
                  <div className="space-y-2 mb-2">
                    {editFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#0b0f19] p-2.5 rounded-xl border border-slate-800 text-xs">
                        <span className="truncate text-blue-400">📎 {file.name || `File_${idx+1}`}</span>
                        <button type="button" onClick={() => handleRemoveEditFile(idx)} className="text-red-500 font-bold px-2 py-0.5 hover:bg-red-500/10 rounded">Remove</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic mb-2">No attached files.</p>
                )}
                
                <label className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer inline-block">
                  + Add New Files
                  <input type="file" multiple onChange={handleNewFileUpload} className="hidden" />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-slate-800 text-slate-300 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 Professional Entry Full-Screen Preview Modal for Buyer Panel */}
      {selectedPreviewEntry && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate pr-4">
                {selectedPreviewEntry.title} <span className="text-xs text-pink-500 font-bold pl-2">#{selectedPreviewEntry.entryNumber || 1}</span>
              </h3>
              
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => setSelectedPreviewEntry(null)} 
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-xl w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Left (Images) & Right (Details + Comments) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
              
              {/* Left Column: Big Image + Thumbnails */}
              <div className="lg:col-span-7 bg-slate-950 p-4 sm:p-6 flex flex-col justify-between items-center gap-4">
                <div className="relative w-full h-72 sm:h-96 flex items-center justify-center overflow-hidden rounded-2xl bg-black/40">
                  {selectedPreviewEntry.previewImages && selectedPreviewEntry.previewImages.length > 0 ? (
                    <img src={selectedPreviewEntry.previewImages[activeImageIndex]} alt="preview" className="h-full w-full object-contain rounded-2xl" />
                  ) : (
                    <span className="text-slate-400 text-xs">No image preview</span>
                  )}
                </div>

                {selectedPreviewEntry.previewImages && selectedPreviewEntry.previewImages.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto w-full pb-2">
                    {selectedPreviewEntry.previewImages.map((imgUrl, imgIdx) => (
                      <div 
                        key={imgIdx} 
                        onClick={() => setActiveImageIndex(imgIdx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition shrink-0 ${activeImageIndex === imgIdx ? 'border-pink-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={imgUrl} alt="thumb" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Description & Comments System */}
              <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-6 bg-white dark:bg-[#111622]">
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Submitted By</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{selectedPreviewEntry.name}</span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Proposal Details</span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0b0f19] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                      {selectedPreviewEntry.proposal || selectedPreviewEntry.description || 'No proposal description provided.'}
                    </p>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    💬 Comments ({selectedPreviewEntry.comments?.length || 0})
                  </h4>

                  <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
                    {selectedPreviewEntry.comments && selectedPreviewEntry.comments.length > 0 ? (
                      selectedPreviewEntry.comments.map((comm) => (
                        <div key={comm.id} className="bg-slate-50 dark:bg-[#0b0f19] p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-bold text-pink-600 dark:text-pink-400">{comm.author}</span>
                            <span className="text-slate-400">{comm.date}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300">{comm.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No comments yet. Be the first to comment!</p>
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <form onSubmit={(e) => handleAddComment(e, selectedPreviewEntry.id)} className="flex gap-2 pt-2">
                    <input 
                      type="text" 
                      value={newCommentText} 
                      onChange={(e) => setNewCommentText(e.target.value)} 
                      placeholder="Write a comment..." 
                      className="flex-1 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-pink-500 text-slate-900 dark:text-white"
                    />
                    <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0">
                      Send
                    </button>
                  </form>
                </div>

                {/* Modal Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button onClick={() => { handleAwardEntry(selectedPreviewEntry); setSelectedPreviewEntry(null); }} className="bg-emerald-600 text-white font-bold py-2 rounded-xl cursor-pointer text-xs">Award 🏆</button>
                  <button onClick={(e) => { handleShortlistEntry(e, selectedPreviewEntry.id); setSelectedPreviewEntry(null); }} className="bg-amber-600 text-white font-bold py-2 rounded-xl cursor-pointer text-xs">Shortlist</button>
                  <button onClick={(e) => { handleRejectEntry(e, selectedPreviewEntry.id); setSelectedPreviewEntry(null); }} className="bg-red-600 text-white font-bold py-2 rounded-xl cursor-pointer text-xs">Reject</button>
                  <button onClick={(e) => { handleMessageFreelancer(e, selectedPreviewEntry.name); setSelectedPreviewEntry(null); }} className="bg-blue-600 text-white font-bold py-2 rounded-xl cursor-pointer text-xs">Message</button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default BuyerContestDetails;