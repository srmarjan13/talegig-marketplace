import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PrivateNavbar from './PrivateNavbar';
import PublicNavbar from './PublicNavbar';
import { useToast } from '../Home/ToastContext';

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

const ContestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [currentUser] = useState(() => {
    try {
      const userProfile = JSON.parse(localStorage.getItem('user') || '{}');
      return userProfile.name || userProfile.fullName || userProfile.username || 'Md Saidur Rahman';
    } catch (e) {
      return 'Md Saidur Rahman';
    }
  });

  const [contestData] = useState(() => {
    let rawContest = null;
    try {
      const savedContests = localStorage.getItem('talegig_contests') || localStorage.getItem('talegig_proposals');
      if (savedContests) {
        const parsed = JSON.parse(savedContests);
        const found = parsed.find(item => String(item.id) === String(id));
        if (found) rawContest = found;
      }
    } catch (e) {}

    if (!rawContest && location.state?.contest) {
      rawContest = location.state.contest;
    }

    if (!rawContest) return null;

    // 🟢 সম্পূর্ণ ডাইনামিক্যালি ক্রিয়েটর বা বায়ারের ডেটা ফেচ করা (কোনো হার্ডকোড নয়)
    let ownerName = rawContest?.client || rawContest?.sellerName || rawContest?.postedBy || rawContest?.name || null;
    let ownerUsername = rawContest?.clientUsername || rawContest?.username || rawContest?.sellerUsername || null;
    let ownerAvatar = rawContest?.clientImage || rawContest?.profilePic || rawContest?.avatar || null;
    let ownerRating = rawContest?.rating || 0;
    let ownerReviewsCount = rawContest?.commentsCount || rawContest?.reviewsCount || 0;

    try {
      const allUsers = JSON.parse(localStorage.getItem('talegig_users') || '[]');
      const foundUser = allUsers.find(u => 
        String(u.id) === String(rawContest?.clientId || rawContest?.userId) || 
        (ownerUsername && u.username?.toLowerCase().replace('@','') === ownerUsername?.toLowerCase().replace('@',''))
      );
      
      if (foundUser) {
        ownerName = foundUser.name || foundUser.fullName || ownerName;
        ownerUsername = foundUser.username || ownerUsername;
        ownerAvatar = foundUser.profilePic || foundUser.avatar || ownerAvatar;
        ownerRating = foundUser.rating || ownerRating;
        ownerReviewsCount = foundUser.reviewsCount || foundUser.commentsCount || ownerReviewsCount;
      }
    } catch (err) {}

    if (!ownerName && ownerUsername) {
      ownerName = ownerUsername.replace('@', '');
    }

    const budgetRawStr = String(rawContest?.budget || rawContest?.myproposal || rawContest?.price || '$350 USD');
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
      id: rawContest.id,
      title: rawContest.title || 'Untitled Contest',
      description: rawContest.description || 'No description provided.',
      budget: rawContest.myproposal || rawContest.budget || rawContest.price || '$350 USD',
      budgetNum: rawContest.budgetNum || parseFloat(budgetRawStr.replace(/[^0-9.]/g, '')) || 350,
      currency: detectedCurrency,
      currencySymbol: currencySymbol,
      skills: rawContest.skills && rawContest.skills.length > 0 ? rawContest.skills : [],
      badges: rawContest.badges || [],
      files: rawContest.files || [],
      proposalsData: rawContest.proposalsData || rawContest.entriesData || [],
      totalProposal: rawContest.totalProposal || rawContest.totalEntries || 0,
      awardedEntries: rawContest.awardedEntries || (rawContest.awardedEntry ? [rawContest.awardedEntry] : []),
      paymentState: rawContest.paymentState || 'unbilled',
      rating: ownerRating,
      commentsCount: ownerReviewsCount,
      client: ownerName,
      clientId: rawContest.clientId || rawContest.userId || '',
      clientUsername: ownerUsername ? ownerUsername.replace('@', '') : '',
      clientImage: ownerAvatar
    };
  });

  if (!contestData || !contestData.client) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050b1a] text-slate-900 dark:text-white">
        <PrivateNavbar />
        <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
          <h2 className="text-3xl font-black">Contest Not Found</h2>
          <p className="text-sm text-slate-500">No valid contest or creator data found in the system.</p>
          <button 
            onClick={() => navigate('/allcontest')}
            className="px-6 py-3 bg-pink-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
          >
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  const awardedArr = contestData.awardedEntries || [];
  const isAwarded = awardedArr.some(w => w.name.includes(currentUser) || w.name.includes('You') || awardedArr.length > 0);

  const [isProjectEnded, setIsProjectEnded] = useState(() => {
    try {
      const savedStatus = localStorage.getItem(`talegig_project_ended_${id || contestData.id}`);
      return savedStatus ? JSON.parse(savedStatus) : false;
    } catch(e) {}
    return false;
  });

  const [activeTab, setActiveTab] = useState('description');
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [entryTitle, setEntryTitle] = useState('');
  const [entryDescription, setEntryDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [isHighlight, setIsHighlight] = useState(false);
  const [isSealed, setIsSealed] = useState(false);
  const [isOriginalWorkChecked, setIsOriginalWorkChecked] = useState(false);

  const [entrySubTab, setEntrySubTab] = useState('All entry');
  const [selectedPreviewEntry, setSelectedPreviewEntry] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [newCommentText, setNewCommentText] = useState('');

  const [entriesList, setEntriesList] = useState(() => {
    try {
      const savedContests = localStorage.getItem('talegig_contests') || localStorage.getItem('talegig_proposals');
      if (savedContests) {
        const parsed = JSON.parse(savedContests);
        const found = parsed.find(item => String(item.id) === String(id));
        if (found && (found.proposalsData || found.entriesData) && (found.proposalsData || found.entriesData).length > 0) {
          return found.proposalsData || found.entriesData;
        }
      }
    } catch (e) {}
    return [];
  });

  const [attachedFiles] = useState(() => {
    if (contestData.files && contestData.files.length > 0) {
      return contestData.files.map((file, idx) => ({
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
      const savedHandover = localStorage.getItem(`talegig_handover_files_${id || contestData.id}`);
      if (savedHandover) return JSON.parse(savedHandover);
    } catch (e) {}
    return [];
  });
  const [previewHandoverId, setPreviewHandoverId] = useState(null);

  const handleSellerFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newUploaded = files.map(file => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    const updated = [...handoverFiles, ...newUploaded];
    setHandoverFiles(updated);
    try {
      localStorage.setItem(`talegig_handover_files_${id || contestData.id}`, JSON.stringify(updated));
    } catch (err) {}
    showToast('Handover file uploaded successfully!','success');
  };

  const handleDownloadAll = () => {
    if (attachedFiles.length === 0) {
      showToast('No attached files available to download.','error');
      return;
    }
    showToast('Downloading all attached contest files as a ZIP archive...','success');
  };

  const prizeNumeric = contestData.budgetNum || 350;
  const dynamicCommRate = Number(localStorage.getItem('talegig_commission_rate') || 10);
  const commissionMultiplier = 1 - (dynamicCommRate / 100);
  const netPrizeAmount = prizeNumeric * commissionMultiplier;

  const paymentState = contestData.paymentState || 'unbilled';
  const unbilledTotal = paymentState === 'unbilled' ? netPrizeAmount : 0;
  const pendingReleaseTotal = paymentState === 'pending_release' ? netPrizeAmount : 0;
  const paidTotal = paymentState === 'paid' ? netPrizeAmount : 0;
  const isPaymentFullyCleared = paymentState === 'paid';

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

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isProjectEnded && paymentState !== 'paid') {
      showToast('You can only submit a review after the project is completed!','error');
      return;
    }
    if (reviewRating === 0 || !reviewText.trim()) {
      showToast('Please provide overall rating and comment.','success');
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
      const contestKey = `talegig_reviews_${id || contestData.id}`;
      const existingData = JSON.parse(localStorage.getItem(contestKey) || '{}');
      const updatedData = { ...existingData, sellerReview: newSellerRev };
      localStorage.setItem(contestKey, JSON.stringify(updatedData));
      setReviewsData(updatedData);
      showToast('Review submitted successfully!','success');
    } catch(err) {}
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedFiles.length + files.length > 10) {
      showToast('You can upload a maximum of 10 files.','error');
      return;
    }
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const removeUploadedFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmitEntryModal = (e) => {
    e.preventDefault();

    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUsername = storedUser.username || storedUser.name || '';
      
      if (
        (contestData.client && currentUsername && contestData.client.toLowerCase() === currentUsername.toLowerCase()) ||
        (contestData.clientId && storedUser.id && String(contestData.clientId) === String(storedUser.id))
      ) {
        showToast("You cannot submit an entry to your own contest!",'success');
        setIsSubmitModalOpen(false);
        return;
      }
    } catch (err) {}
    
    if (!isOriginalWorkChecked) {
      showToast('You must agree to the Terms & Conditions.','error');
      return;
    }
    if (uploadedFiles.length === 0) {
      showToast('Please upload at least one image.','error');
      return;
    }

    const nextEntryNum = entriesList.length + 1;

    const newEntry = {
      id: Date.now(),
      entryNumber: nextEntryNum,
      name: currentUser,
      userProfileUrl: '/profile/saidur',
      starRating: 0, 
      category: 'My entry',
      previewImages: uploadedFiles.map(item => item.preview),
      title: entryTitle,
      proposal: entryDescription,
      isHighlight: isHighlight,
      isSealed: isSealed,
      isRejected: false,
      comments: []
    };

    const updatedEntriesList = [newEntry, ...entriesList];
    setEntriesList(updatedEntriesList);

    try {
      const existingEntries = JSON.parse(localStorage.getItem('talegig_entry')) || [];
      const isProjectAwarded = isAwarded || awardedArr.length > 0 || contestData.status === 'awarded';
      
      const contestEntryItem = {
        id: contestData.id || id,
        contestId: contestData.id || id,
        title: contestData.title,
        price: contestData.budget || '$350 USD',
        entries: updatedEntriesList.length,
        deadline: 'Active',
        status: isProjectAwarded ? 'awarded' : 'active',
        isAwarded: isProjectAwarded,
        isSubmitted: true
      };
      
      const filteredExisting = existingEntries.filter(item => String(item.contestId || item.id) !== String(contestData.id || id));
      localStorage.setItem('talegig_entry', JSON.stringify([contestEntryItem, ...filteredExisting]));

      const savedContests = localStorage.getItem('talegig_contests') || localStorage.getItem('talegig_proposals');
      if (savedContests) {
        let parsed = JSON.parse(savedContests);
        let isFound = false;

        parsed = parsed.map(item => {
          if (String(item.id) === String(id)) {
            isFound = true;
            return {
              ...item,
              totalProposal: updatedEntriesList.length,
              proposalsData: updatedEntriesList
            };
          }
          return item;
        });

        if (!isFound) {
          const currentObj = {
            ...contestData,
            id: id,
            type: 'Contest',
            totalProposal: updatedEntriesList.length,
            proposalsData: updatedEntriesList
          };
          parsed.unshift(currentObj);
        }

        localStorage.setItem('talegig_contests', JSON.stringify(parsed));
      } else {
        const initialArray = [{
          ...contestData,
          id: id,
          type: 'Contest',
          totalProposal: updatedEntriesList.length,
          proposalsData: updatedEntriesList
        }];
        localStorage.setItem('talegig_contests', JSON.stringify(initialArray));
      }
    } catch (err) {}

    setIsSubmitModalOpen(false);
    setEntryTitle('');
    setEntryDescription('');
    setUploadedFiles([]);
    setIsHighlight(false);
    setIsSealed(false);
    setIsOriginalWorkChecked(false);
    
    setActiveTab('entries');
    setEntrySubTab('My entry');
    showToast(`Contest Entry #${nextEntryNum} Submitted Successfully!`,'success');
  };

  const handleDeleteEntryFromPreview = (entryId) => {
    if (window.confirm('Are you sure you want to delete your entry?')) {
      const updated = entriesList.filter(item => item.id !== entryId);
      setEntriesList(updated);
      setSelectedPreviewEntry(null);

      try {
        const savedContests = localStorage.getItem('talegig_contests') || localStorage.getItem('talegig_proposals');
        if (savedContests) {
          let parsed = JSON.parse(savedContests);
          parsed = parsed.map(item => {
            if (String(item.id) === String(id)) {
              return {
                ...item,
                totalProposal: updated.length,
                proposalsData: updated
              };
            }
            return item;
          });
          localStorage.setItem('talegig_contests', JSON.stringify(parsed));
        }
      } catch (err) {}
    }
  };

  const handleHighlightFromPreview = (entry) => {
    if (entry.isHighlight) {
      showToast('This entry is already highlighted!','success');
      return;
    }

    if (window.confirm('Highlighting this entry costs $0.50 USD. Do you want to proceed?')) {
      try {
        let userWallet = JSON.parse(localStorage.getItem('user_wallet') || '{"balance": 10.00}');
        if (userWallet.balance < 0.50) {
          showToast('Insufficient balance in your wallet to highlight this entry!','error');
          return;
        }

        userWallet.balance -= 0.50;
        localStorage.setItem('user_wallet', JSON.stringify(userWallet));

        const updated = entriesList.map(item => {
          if (item.id === entry.id) {
            return { ...item, isHighlight: true, category: 'Highlighted' };
          }
          return item;
        });

        setEntriesList(updated);
        setSelectedPreviewEntry({ ...entry, isHighlight: true, category: 'Highlighted' });

        const savedContests = localStorage.getItem('talegig_contests') || localStorage.getItem('talegig_proposals');
        if (savedContests) {
          let parsed = JSON.parse(savedContests);
          parsed = parsed.map(item => {
            if (String(item.id) === String(id)) {
              return { ...item, proposalsData: updated };
            }
            return item;
          });
          localStorage.setItem('talegig_contests', JSON.stringify(parsed));
        }

        showToast('Entry highlighted successfully! $0.50 USD deducted from your balance.','success');
      } catch (err) {
        showToast('Failed to process payment for highlighting.','error');
      }
    }
  };

  const handleRateEntry = (e, entryId, stars) => {
    e.stopPropagation();
    const updated = entriesList.map(item => {
      if (item.id === entryId) {
        return { ...item, starRating: stars };
      }
      return item;
    });
    setEntriesList(updated);

    try {
      const savedContests = localStorage.getItem('talegig_contests') || localStorage.getItem('talegig_proposals');
      if (savedContests) {
        let parsed = JSON.parse(savedContests);
        parsed = parsed.map(item => {
          if (String(item.id) === String(id)) {
            return {
              ...item,
              proposalsData: updated
            };
          }
          return item;
        });
        localStorage.setItem('talegig_contests', JSON.stringify(parsed));
      }
    } catch (err) {}
  };

  const handleAddComment = (e, entryId) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newCommentObj = {
      id: Date.now(),
      author: currentUser,
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

    try {
      const savedContests = localStorage.getItem('talegig_contests') || localStorage.getItem('talegig_proposals');
      if (savedContests) {
        let parsed = JSON.parse(savedContests);
        parsed = parsed.map(item => {
          if (String(item.id) === String(id)) {
            return { ...item, proposalsData: updated };
          }
          return item;
        });
        localStorage.setItem('talegig_contests', JSON.stringify(parsed));
      }
    } catch(err) {}
  };

  const handleChat = (clientName) => {
    navigate('/sellerdashboard', { state: { activeTab: 'Inbox', chatUser: clientName } });
  };

  const handleEndContest = () => {
    if (window.confirm('Are you sure you want to officially end this contest?')) {
      setIsProjectEnded(true);
      try {
        localStorage.setItem(`talegig_project_ended_${id || contestData.id}`, JSON.stringify(true));
      } catch (e) {}
      showToast('Contest successfully ended! You can now submit your final review.','success');
      setActiveTab('reviews');
    }
  };

  const nonRejectedEntries = entriesList.filter(e => !e.isRejected && e.category !== 'Rejected');

  const sortedEntries = [...nonRejectedEntries].sort((a, b) => {
    const isAWinner = awardedArr.some(w => String(w.id) === String(a.id));
    const isBWinner = awardedArr.some(w => String(w.id) === String(b.id));
    if (isAWinner && !isBWinner) return -1;
    if (!isAWinner && isBWinner) return 1;

    if (a.isHighlight && !b.isHighlight) return -1;
    if (!a.isHighlight && b.isHighlight) return 1;

    const ratingA = a.starRating || 0;
    const ratingB = b.starRating || 0;
    if (ratingA !== ratingB) {
      return ratingB - ratingA; 
    }

    return b.id - a.id; 
  });

  const filteredEntries = sortedEntries.filter(e => {
    const isMyEntry = e.name.includes(currentUser) || e.name.includes('You');
    if (entrySubTab === 'All entry') return true;
    if (entrySubTab === 'My entry') return isMyEntry;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#050b1a] text-slate-900 dark:text-white transition-colors duration-300">
      {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-5">
        
        {isAwarded && (
          <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 border-2 border-emerald-500/40 p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left backdrop-blur-md">
            <div className="space-y-1">
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">👑 WINNING DESIGNER</span>
              <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white pt-1">Congratulations! You have won this contest 🏆</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Please provide your final vector and source handover files to the client.</p>
            </div>
            <button 
              onClick={() => handleChat(contestData.client)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-7 py-3 rounded-xl shadow-md cursor-pointer shrink-0 transition-all hover:scale-105"
            >
              💬 Chat with Client
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-4 sm:p-7 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2.5 w-full md:w-auto">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] sm:text-xs font-extrabold px-3 py-1 rounded-md">
                  {isProjectEnded ? 'Contest Completed 🏁' : isAwarded ? 'Awarded to You 🏆' : 'Active Contest'}
                </span>
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

              <h1 className="text-base sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug break-words">
                {contestData.title}
              </h1>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800">
              <div className="text-left md:text-right">
                <span className="text-2xl sm:text-3xl font-black text-pink-600 dark:text-pink-500 tracking-tight">
                  {contestData.budget}
                </span>
                <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-bold">Contest Prize</p>
              </div>

              {!isAwarded && (
                <div className="flex flex-col items-end w-full sm:w-auto">
                  <button 
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer w-full sm:w-auto text-center"
                  >
                    Submit My Entry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          <div className={`${activeTab === 'entries' ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-5 transition-all duration-300 w-full overflow-hidden`}>
            
            <div className="flex items-center gap-2 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('description')} 
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'description' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveTab('entries')} 
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'entries' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {isAwarded ? 'My Winning Entry' : `Entries (${nonRejectedEntries.length})`}
              </button>

              {isAwarded && (
                <>
                  <button onClick={() => setActiveTab('payment')} className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'payment' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}>Payment</button>
                  <button onClick={() => setActiveTab('files')} className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'files' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}>Files</button>
                  <button onClick={() => setActiveTab('reviews')} className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'reviews' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}>Reviews {!isProjectEnded && '🔒'}</button>
                </>
              )}
            </div>

            {activeTab === 'description' && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-4 text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                  <div className={`whitespace-pre-line ${!isDescExpanded ? 'line-clamp-4' : ''}`}>
                    {contestData.description}
                  </div>
                  {contestData.description && contestData.description.length > 200 && (
                    <button 
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="text-xs font-bold text-pink-600 hover:underline cursor-pointer block pt-1"
                    >
                      {isDescExpanded ? 'See Less ∧' : 'See More ∨'}
                    </button>
                  )}
                </div>

                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Contest Brief & Reference Files</h3>
                    {attachedFiles.length > 0 && (
                      <button onClick={handleDownloadAll} className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer w-full sm:w-auto text-center">↓ Download all</button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {attachedFiles.length > 0 ? (
                      attachedFiles.map((file) => (
                        <div key={file.id} className="space-y-2">
                          <div onClick={() => setPreviewFileId(previewFileId === file.id ? null : file.id)} className="flex items-center justify-between bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl cursor-pointer hover:border-pink-500 transition">
                            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate pr-2">
                              <span>📎</span><span className="truncate">{file.name}</span>
                            </div>
                            <span className="text-xs text-slate-400 font-semibold shrink-0">{previewFileId === file.id ? 'Hide ∧' : 'View ∨'}</span>
                          </div>
                          {previewFileId === file.id && (
                            <div className="p-4 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 text-center">
                              {file.type === 'image' ? <img src={file.url} alt={file.name} className="max-h-48 mx-auto rounded-lg object-contain shadow-sm" /> : <p className="text-xs text-slate-500">Document preview not available.</p>}
                              <a href={file.url} download className="inline-block bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition">Download File</a>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">No attached files provided.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {contestData.skills && contestData.skills.length > 0 ? (
                      contestData.skills.map((skill, idx) => (
                        <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 text-xs px-3.5 py-1.5 rounded-full font-medium">{skill}</span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No specific skills required.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'entries' && (
              <div className="space-y-5">
                
                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-2 rounded-full shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {[
                    { name: 'All entry', count: nonRejectedEntries.length },
                    { name: 'My entry', count: entriesList.filter(e => e.name.includes(currentUser) || e.name.includes('You')).length }
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {filteredEntries.map((entry) => {
                    const isMyEntry = entry.name.includes(currentUser) || entry.name.includes('You');
                    const showSealed = entry.isSealed && !isMyEntry;
                    const isWinner = awardedArr.some(w => String(w.id) === String(entry.id));

                    if (showSealed) return null; 

                    return (
                      <div 
                        key={entry.id}
                        onClick={() => { setSelectedPreviewEntry(entry); setActiveImageIndex(0); }}
                        className={`bg-white dark:bg-[#0b0f19] border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition cursor-pointer relative w-full flex flex-col justify-between ${
                            isWinner 
                            ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-4 ring-emerald-500/10 bg-gradient-to-b from-emerald-500/5 to-transparent' 
                            : entry.isHighlight 
                            ? 'border border-amber-500/70 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-pink-500/50'
                        }`}
                      >
                        {isWinner && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-md flex items-center gap-1 tracking-wider z-10">
                            <span>👑</span> WINNING ENTRY 🏆
                          </div>
                        )}
                        {entry.isHighlight && !isWinner && (
                          <span className="absolute -top-2.5 right-4 bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm">Highlighted</span>
                        )}

                        <div className={`flex justify-between items-center ${isWinner ? 'pt-2' : ''}`}>
                          <span 
                            onClick={(e) => { e.stopPropagation(); navigate(entry.userProfileUrl || '/profile/saidur'); }}
                            className={`font-extrabold text-sm sm:text-base hover:underline cursor-pointer truncate block ${isWinner ? 'text-emerald-600 dark:text-emerald-400 text-base' : 'text-blue-600 dark:text-blue-400'}`}
                          >
                            {entry.name}
                          </span>
                        </div>

                        <div className={`w-full bg-slate-50 dark:bg-[#111622] rounded-xl overflow-hidden flex items-center justify-center shadow-inner h-44 sm:h-48 shrink-0 ${isWinner ? 'border-2 border-emerald-500/30' : ''}`}>
                          {entry.previewImages && entry.previewImages.length > 0 ? (
                            <img src={entry.previewImages[0]} alt="preview" className="h-full w-full object-cover rounded-xl" />
                          ) : (
                            <span className="text-slate-400 text-xs">Click to Preview</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-0.5 text-2xl sm:text-3xl" title="Click stars to rate/update entry">
                            {[1, 2, 3, 4, 5].map((starNum) => (
                              <span 
                                key={starNum}
                                onClick={(e) => handleRateEntry(e, entry.id, starNum)}
                                className={`cursor-pointer hover:scale-125 transition ${
                                  starNum <= (entry.starRating || 0) 
                                    ? 'text-amber-500' 
                                    : 'text-slate-300 dark:text-slate-700'
                                }`}
                                title={`Rate ${starNum} stars`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold leading-tight">ENTRY</span>
                            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 leading-tight">#{entry.entryNumber}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isAwarded && activeTab === 'payment' && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Payment Summary</h3>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                      <button onClick={() => showToast('Downloading Invoice...')} className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer text-center">↓ Invoice summary</button>
                      
                      {isPaymentFullyCleared && !isProjectEnded && (
                        <button onClick={handleEndContest} className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-sm cursor-pointer animate-pulse text-center">End Contest 🏁</button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 sm:gap-6 text-left">
                    <div>
                      <p className="text-xs text-slate-500">Unbilled</p>
                      <p className="text-sm sm:text-base font-extrabold text-amber-500 mt-1">{unbilledTotal > 0 ? `$${unbilledTotal.toFixed(2)} USD` : '0.00 USD'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Pending Release</p>
                      <p className="text-sm sm:text-base font-extrabold text-blue-500 mt-1">{pendingReleaseTotal > 0 ? `$${pendingReleaseTotal.toFixed(2)} USD` : '0.00 USD'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Paid</p>
                      <p className="text-sm sm:text-base font-extrabold text-pink-600 mt-1">{paidTotal > 0 ? `$${paidTotal.toFixed(2)} USD` : '0.00 USD'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isAwarded && activeTab === 'files' && (
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Project Files & Handover</h3>
                  <label className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer w-full sm:w-auto text-center">
                    ↑ Upload Handover Files
                    <input type="file" multiple onChange={handleSellerFileUpload} className="hidden" />
                  </label>
                </div>

                <div className="space-y-3">
                  {handoverFiles.length > 0 ? (
                    handoverFiles.map((file, idx) => (
                      <div key={idx} className="space-y-2">
                        <div onClick={() => setPreviewHandoverId(previewHandoverId === idx ? null : idx)} className="flex items-center justify-between bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl cursor-pointer hover:border-pink-500 transition">
                          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate pr-2">
                            <span>📎</span><span className="truncate">{file.name || `Handover_File_${idx+1}`}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-semibold shrink-0">{previewHandoverId === idx ? 'Hide ∧' : 'View / Download ∨'}</span>
                        </div>
                        {previewHandoverId === idx && (
                          <div className="p-4 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 text-center">
                            {file.type && file.type.includes('image') ? <img src={file.url} alt={file.name} className="max-h-48 mx-auto rounded-lg object-contain shadow-sm" /> : <p className="text-xs text-slate-500">Document preview not available.</p>}
                            <a href={file.url} download className="inline-block bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition">Download File</a>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">No handover files uploaded yet. Upload your final project files above.</p>
                  )}
                </div>
              </div>
            )}

            {isAwarded && activeTab === 'reviews' && (
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-7 rounded-2xl shadow-sm space-y-6">
                {!isProjectEnded ? (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center space-y-2">
                    <p className="text-base font-bold text-amber-600 dark:text-amber-500">🔒 Review Window Locked</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Order must be "Completed" before leaving a review.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bothSubmitted ? (
                      <>
                        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-pink-600 dark:text-pink-500">Review from Buyer</span>
                            <span className="text-[11px] text-slate-400 font-medium">{buyerReview.date}</span>
                          </div>
                          <div className="flex gap-1.5 text-amber-500 text-xl sm:text-2xl">
                            {[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= buyerReview.rating ? '★' : '☆'}</span>)}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">{buyerReview.comment}</p>
                        </div>

                        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#111622] border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Your Review (Seller)</span>
                            <span className="text-[11px] text-slate-400 font-medium">{sellerReview.date}</span>
                          </div>
                          <div className="flex gap-1.5 text-amber-500 text-xl sm:text-2xl">
                            {[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= sellerReview.rating ? '★' : '☆'}</span>)}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">{sellerReview.comment}</p>
                        </div>
                      </>
                    ) : sellerReview ? (
                      <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center space-y-2">
                        <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">⏳ Review Submitted Successfully</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">As per TaleGig marketplace standards (Upwork style), both parties' reviews will become visible once the buyer also submits their review.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-6 pt-2">
                        <div className="space-y-1">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Leave a Review for Buyer</h3>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Rate your experience across multiple categories with large stars below:</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-xs sm:text-sm">
                          <div className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Overall Rating:</span>
                            <div className="flex gap-1.5 text-2xl sm:text-3xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setReviewRating(s)} className={`cursor-pointer hover:scale-110 transition ${s <= reviewRating ? 'text-amber-500 drop-shadow-sm' : 'text-slate-300 dark:text-slate-700'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Communication:</span>
                            <div className="flex gap-1.5 text-2xl sm:text-3xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setCommunicationRating(s)} className={`cursor-pointer hover:scale-110 transition ${s <= communicationRating ? 'text-amber-500 drop-shadow-sm' : 'text-slate-300 dark:text-slate-700'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Quality of Work:</span>
                            <div className="flex gap-1.5 text-2xl sm:text-3xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setQualityRating(s)} className={`cursor-pointer hover:scale-110 transition ${s <= qualityRating ? 'text-amber-500 drop-shadow-sm' : 'text-slate-300 dark:text-slate-700'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Delivery Time:</span>
                            <div className="flex gap-1.5 text-2xl sm:text-3xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setDeliveryRating(s)} className={`cursor-pointer hover:scale-110 transition ${s <= deliveryRating ? 'text-amber-500 drop-shadow-sm' : 'text-slate-300 dark:text-slate-700'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Value for Money:</span>
                            <div className="flex gap-1.5 text-2xl sm:text-3xl">
                              {[1, 2, 3, 4, 5].map(s => (
                                <span key={s} onClick={() => setValueRating(s)} className={`cursor-pointer hover:scale-110 transition ${s <= valueRating ? 'text-amber-500 drop-shadow-sm' : 'text-slate-300 dark:text-slate-700'}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Professionalism:</span>
                            <div className="flex gap-1.5 text-2xl sm:text-3xl">
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
                          <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-extrabold px-8 py-3 rounded-xl text-xs sm:text-sm cursor-pointer shadow-md transition-all hover:scale-105">Submit & Publish Review ⭐</button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ডান পাশের ক্রিয়েটর প্রফাইল কার্ড (সম্পূর্ণ ডাইনামিক) */}
          {activeTab !== 'entries' && (
            <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-5">
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-5 text-center">
                <div className="flex flex-col items-center space-y-3">
                  {contestData.clientImage ? (
                    <img 
                      src={contestData.clientImage} 
                      alt="Owner" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-pink-600 shadow-sm mx-auto"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-black text-2xl shadow-sm mx-auto">
                      {contestData.client ? contestData.client.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{contestData.client}</h3>
                    {contestData.clientUsername && (
                      <p className="text-xs text-slate-500 dark:text-gray-400">@{contestData.clientUsername} (Contest Owner)</p>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-amber-500 font-bold">
                    <span>⭐ {contestData.rating > 0 ? contestData.rating : 5.0}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-600 dark:text-gray-300">💬 {contestData.commentsCount} reviews</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/profile/${contestData.clientUsername || contestData.client}`)}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-sm transition cursor-pointer"
                >
                  View Creator Profile
                </button>

                <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-gray-300 text-left">
                  <div className="flex justify-between"><span>Guaranteed prize</span><span className="font-bold text-emerald-600 dark:text-emerald-400">100%</span></div>
                  <div className="flex justify-between"><span>Contests posted</span><span className="font-bold text-slate-900 dark:text-white">{contestData.totalContestsPosted || 1}</span></div>
                  <div className="flex justify-between"><span>Award rate</span><span className="font-bold text-slate-900 dark:text-white">100%</span></div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* সাবমিট এন্ট্রি মডাল */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 w-full max-w-4xl p-5 sm:p-8 rounded-2xl shadow-sm space-y-6 relative my-auto max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white">New Entry</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm sm:text-lg font-extrabold text-pink-600 dark:text-pink-400">{contestData.budget}</span>
                <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">✕</button>
              </div>
            </div>

            <form onSubmit={handleSubmitEntryModal} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              
              <div className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Title (Max 50 chars)</label>
                    <span className={`text-[10px] font-bold ${entryTitle.length > 50 ? 'text-red-500' : 'text-slate-400'}`}>{entryTitle.length}/50</span>
                  </div>
                  <input type="text" maxLength={50} value={entryTitle} onChange={(e) => setEntryTitle(e.target.value)} placeholder="Title" required className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 px-4 py-3 rounded-xl text-xs outline-none focus:border-pink-500 text-slate-900 dark:text-white" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Details (Max 200 chars)</label>
                    <span className={`text-[10px] font-bold ${entryDescription.length > 200 ? 'text-red-500' : 'text-slate-400'}`}>{entryDescription.length}/200</span>
                  </div>
                  <textarea rows="4" maxLength={200} value={entryDescription} onChange={(e) => setEntryDescription(e.target.value)} placeholder="Enter your entry details" required className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 p-4 rounded-xl text-xs outline-none focus:border-pink-500 text-slate-900 dark:text-white resize-none"></textarea>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Promote my entry</label>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={isHighlight} onChange={(e) => setIsHighlight(e.target.checked)} className="accent-pink-600 w-4 h-4" />
                        <span className="font-bold bg-cyan-500 text-black px-2 py-0.5 rounded text-[10px]">HIGHLIGHT</span>
                        <span className="text-slate-700 dark:text-gray-300">Highlight your entry</span>
                      </div>
                      <span className="font-bold text-pink-600">{contestData.currencySymbol}0.50 {contestData.currency}</span>
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={isSealed} onChange={(e) => setIsSealed(e.target.checked)} className="accent-pink-600 w-4 h-4" />
                        <span className="font-bold bg-blue-600 text-white px-2 py-0.5 rounded text-[10px]">SEALED</span>
                        <span className="text-slate-700 dark:text-gray-300">Seal your entry</span>
                      </div>
                      <span className="font-bold text-pink-600">{contestData.currencySymbol}0.50 {contestData.currency}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  
                  <label className="border-2 border-dashed border-pink-500/60 rounded-2xl p-6 text-center space-y-2 bg-slate-50 dark:bg-[#0b0f19] hover:border-pink-500 transition cursor-pointer block">
                    <div className="text-2xl text-pink-500">⬆</div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-gray-300">Click to upload images (Max 10 files)</p>
                    <input type="file" multiple accept="image/gif, image/jpeg, image/png, image/jpg" onChange={handleFileChange} className="hidden" />
                  </label>

                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 bg-slate-100 dark:bg-[#0b0f19] rounded-xl border border-slate-200 dark:border-slate-800">
                      {uploadedFiles.map((item, idx) => (
                        <div key={idx} className="relative group h-12 bg-black rounded-lg overflow-hidden border border-slate-700">
                          <img src={item.preview} alt="upload" className="h-full w-full object-cover" />
                          <button type="button" onClick={() => removeUploadedFile(idx)} className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <label className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={isOriginalWorkChecked} onChange={(e) => setIsOriginalWorkChecked(e.target.checked)} className="accent-pink-600 mt-0.5" />
                    <span>This entry is entirely my own original work and I agree to the Terms & Conditions.</span>
                  </label>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsSubmitModalOpen(false)} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 font-bold text-xs px-5 py-3 rounded-xl cursor-pointer">Cancel</button>
                    <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-sm cursor-pointer">Submit entry</button>
                  </div>
                </div>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* Professional Entry Full-Screen Preview Modal */}
      {selectedPreviewEntry && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col">
            
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate pr-4">
                {selectedPreviewEntry.title} <span className="text-xs text-pink-500 font-bold pl-2">#{selectedPreviewEntry.entryNumber}</span>
              </h3>
              
              <div className="flex items-center gap-2 shrink-0">
                {(selectedPreviewEntry.name.includes(currentUser) || selectedPreviewEntry.name.includes('You')) && (
                  <>
                    <button 
                      onClick={() => handleDeleteEntryFromPreview(selectedPreviewEntry.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 transition"
                      title="Delete Entry"
                    >
                      🗑️ <span className="hidden sm:inline">Delete</span>
                    </button>

                    {!selectedPreviewEntry.isHighlight && (
                      <button 
                        onClick={() => handleHighlightFromPreview(selectedPreviewEntry)}
                        className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-black px-3.5 py-2 rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 transition"
                        title="Highlight Entry ($0.50)"
                      >
                        ⭐ Highlight <span className="hidden sm:inline">($0.50)</span>
                      </button>
                    )}
                  </>
                )}

                <button 
                  onClick={() => setSelectedPreviewEntry(null)} 
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-xl w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
              
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

              <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-6 bg-white dark:bg-[#111622]">
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Submitted By</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{selectedPreviewEntry.name}</span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Proposal Details</span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0b0f19] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                      {selectedPreviewEntry.proposal}
                    </p>
                  </div>
                </div>

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

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ContestDetails;