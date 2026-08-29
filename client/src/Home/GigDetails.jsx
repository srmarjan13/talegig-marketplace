import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PrivateNavbar from './PrivateNavbar';
import PublicNavbar from './PublicNavbar';
import { useToast } from '../Home/ToastContext';

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [gig, setGig] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // রিভিউ ট্যাবের স্টেট ('thisGig' বা 'allProjects')
  const [reviewTab, setReviewTab] = useState('allProjects');

  // অর্ডার মডাল ও পেমেন্ট স্টেট
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [requirementAnswer, setRequirementAnswer] = useState('');
  
  // পেমেন্ট ফিল্ড স্টেট
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessagesList, setChatMessagesList] = useState([
    { sender: 'seller', text: 'Hello! Feel free to ask if you have any questions about this service.' }
  ]);

  const [isFavorite, setIsFavorite] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem('talegig_user') || '{}');
  const storedRole = localStorage.getItem('userRole');

  const currentUser = {
    username: storedUser.username ? storedUser.username.replace('@', '') : 'srmarjan',
    role: storedRole || storedUser.role || 'buyer'
  };

  useEffect(() => {
    const existingGigs = JSON.parse(localStorage.getItem('talegig_gigs') || '[]');
    const gigIndex = existingGigs.findIndex(g => g.id.toString() === id);
    const foundGig = gigIndex !== -1 ? existingGigs[gigIndex] : existingGigs[0];
    
    if (foundGig) {
      const isOwner = currentUser.role === 'seller' && currentUser.username === foundGig.sellerUsername;
      const viewedKey = `viewed_gig_${id}_${currentUser.username}`;
      const hasViewed = sessionStorage.getItem(viewedKey);

      if (!isOwner && !hasViewed && gigIndex !== -1) {
        foundGig.views = (foundGig.views || 0) + 1;
        existingGigs[gigIndex] = foundGig;
        localStorage.setItem('talegig_gigs', JSON.stringify(existingGigs));
        sessionStorage.setItem(viewedKey, 'true');
      }

      setGig(foundGig);
    }
  }, [id]);

  if (!gig) {
    return (
      <div className="w-full bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-white min-h-screen">
        <PrivateNavbar />
        <div className="max-w-5xl mx-auto p-12 text-center space-y-4">
          <h2 className="text-lg font-bold">Gig not found!</h2>
          <button 
            onClick={() => navigate('/seller-dashboard')}
            className="px-6 py-2.5 bg-pink-600 text-white rounded-xl text-xs font-extrabold cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const imagesList = gig.images && gig.images.length > 0 ? gig.images : [gig.image];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  const pricingData = gig.pricingData || {
    basic: { name: 'Basic', desc: '', price: '10', delivery: '2', revision: '1' },
    standard: { name: 'Premium', desc: '', price: '35', delivery: '4', revision: '3' },
    premium: { name: 'Advanced', desc: '', price: '75', delivery: '7', revision: 'Unlimited' }
  };

  const currentPkgKey = selectedPackage === 'basic' ? 'basic' : selectedPackage === 'standard' ? 'standard' : 'premium';
  const currentPricing = pricingData[currentPkgKey] || pricingData.basic;

  const isOwner = gig.sellerUsername && currentUser.username && gig.sellerUsername.toLowerCase().replace('@', '') === currentUser.username.toLowerCase().replace('@', '');
  const isSellerMode = currentUser.role === 'seller';

  const handleOpenOrderModal = () => {
    if (isSellerMode) {
      showToast("Sellers cannot place orders. Please switch to a Buyer profile to order services.",'error');
      return;
    }
    if (isOwner) {
      showToast("You cannot order your own gig!",'error');
      return;
    }
    setIsOrderModalOpen(true);
  };

  const handleOpenChatModal = () => {
    if (isOwner) {
      showToast("You cannot chat with yourself.",'error');
      return;
    }
    setIsChatOpen(true);
  };

  // রিকুইরমেন্ট সাবমিট করার পর পেমেন্ট মডালে নিয়ে যাবে (পেমেন্ট ম্যান্ডেটরি)
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!requirementAnswer.trim()) {
      showToast("Please provide project requirements!",'error');
      return;
    }
    setIsOrderModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  // পেমেন্ট কনফার্ম হওয়ার পর ফাইনাল অর্ডার সেভ হবে
  const handleConfirmPaymentAndOrder = (e) => {
    e.preventDefault();

    if (!cardNumber || !cardExpiry || !cardCvc) {
      showToast("Please fill in all payment details.",'error');
      return;
    }

    const newOrder = {
      id: Date.now(),
      gigId: gig.id,
      title: gig.title,
      packageName: currentPricing.name,
      price: currentPricing.price,
      deliveryDays: currentPricing.delivery,
      client: currentUser.username,
      requirementAnswer: requirementAnswer || 'No specific requirement provided.',
      status: 'pending',
      paymentStatus: 'Paid',
      createdAt: new Date().toLocaleDateString()
    };

    const existingOrders = JSON.parse(localStorage.getItem('talegig_orders') || '[]');
    localStorage.setItem('talegig_orders', JSON.stringify([newOrder, ...existingOrders]));

    setIsPaymentModalOpen(false);
    setRequirementAnswer('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');

    showToast(`Payment successful ($${currentPricing.price} USD)! Order placed successfully.`,'success');
    navigate('/buyer-dashboard');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setChatMessagesList([...chatMessagesList, { sender: 'buyer', text: chatMessage }]);
    setChatMessage('');
    
    setTimeout(() => {
      setChatMessagesList(prev => [...prev, { sender: 'seller', text: 'Thanks for your message! I will get back to you shortly.' }]);
    }, 1000);
  };

  const handleNavigateProfile = (username) => {
    navigate(`/profile/${username || 'srmarjan'}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Gig link copied to clipboard!','success');
  };

  const allGigs = JSON.parse(localStorage.getItem('talegig_gigs') || '[]');
  const sellerGigs = allGigs.filter(g => g.sellerUsername === gig.sellerUsername && g.id.toString() !== gig.id.toString());
  const similarGigs = allGigs.filter(g => g.category === gig.category && g.sellerUsername !== gig.sellerUsername);

  const allSellerReviews = gig.sellerReviews || [
    { id: 1, gigId: gig.id, client: 'Alex Morgan', rating: 5, comment: 'Amazing work! Delivered right on time with exceptional quality.', date: '2 days ago' },
    { id: 2, gigId: gig.id, client: 'Sarah Jenkins', rating: 5, comment: 'Very professional and communicative.', date: '1 week ago' },
    { id: 3, client: 999, clientName: 'David Warner', rating: 4, comment: 'Good overall delivery from seller other project.', date: '2 weeks ago' }
  ];

  const thisGigReviews = allSellerReviews.filter(r => r.gigId?.toString() === gig.id.toString());
  const displayedReviews = reviewTab === 'thisGig' ? thisGigReviews : allSellerReviews;
  
  const allUsers = JSON.parse(localStorage.getItem('talegig_users') || '[]');
  const profileOwner = allUsers.find(u => u.username?.toLowerCase().replace('@','') === gig.sellerUsername?.toLowerCase().replace('@',''));
  const portfolioWorks = gig.sellerPortfolio || profileOwner?.portfolio || gig.portfolio || [];

  const isOnline = true; 
  const sellerDisplayName = gig.sellerName ? gig.sellerName.split(' ')[0] : 'Srmarjan';

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-white min-h-screen pb-28 transition-colors relative overflow-x-hidden">
      
      {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}

      {/* ভাসমান মেসেজ উইজেট */}
      {!isOwner && (
        <div className="fixed bottom-5 right-5 z-50">
          <div 
            onClick={handleOpenChatModal}
            className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-full p-2.5 pr-6 shadow-2xl inline-flex items-center gap-3 cursor-pointer hover:border-pink-600 transition group"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
              <img 
                src={gig.sellerImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                alt="Seller" 
                className="w-full h-full object-cover" 
              />
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#16171a] ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-pink-600 transition">
                Message {sellerDisplayName}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* বাম দিকের মূল কন্টেন্ট */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* সেলার প্রোফাইল কার্ড */}
          <div 
            onClick={() => handleNavigateProfile(gig.sellerUsername)}
            className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between cursor-pointer group transition gap-3"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                <img 
                  src={gig.sellerImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                  alt="Seller" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-pink-600 transition flex items-center gap-2 flex-wrap truncate">
                  <span className="truncate">{gig.sellerName || "Saidur R."}</span>
                  <span className="text-slate-400 font-normal text-xs sm:text-sm">@{gig.sellerUsername || "srmarjan"}</span>
                  <span className="bg-amber-500/10 text-amber-500 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-extrabold">
                    ★ 4.6 ({allSellerReviews.length})
                  </span>
                </h4>
                <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Online <span className="text-slate-400">• {gig.location || "United Kingdom"}</span>
                </p>
              </div>
            </div>
            <button className="text-xs font-extrabold text-pink-600 bg-pink-50 dark:bg-pink-950/40 px-3.5 py-2 rounded-xl group-hover:bg-pink-600 group-hover:text-white transition shrink-0">
              Profile
            </button>
          </div>

          {/* গিগ টাইটেল */}
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-pink-600 bg-pink-50 dark:bg-pink-950/30 px-3 py-1 rounded-lg">
                {gig.category} &gt; {gig.subCategory || 'Service'}
              </span>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs transition cursor-pointer ${isFavorite ? 'text-red-500 bg-red-50 dark:bg-red-950/30' : 'text-slate-400 hover:text-red-500'}`}
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-pink-600 text-xs transition cursor-pointer font-semibold"
                >
                  🔗 Share
                </button>
              </div>
            </div>

            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug pt-1">
              I will {gig.title}
            </h1>
          </div>

          {/* গিগ ইমেজ প্রিভিউ ও থাম্বনেইল */}
          <div className="space-y-3 bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="relative aspect-[16/10] bg-slate-100 dark:bg-[#0b0f19] rounded-xl overflow-hidden shadow-sm group">
              <img 
                src={imagesList[activeImageIndex]} 
                alt="Gig Preview" 
                className="w-full h-full object-cover" 
              />

              {imagesList.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-pink-600 text-white flex items-center justify-center font-bold transition cursor-pointer shadow"
                  >
                    ❮
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-pink-600 text-white flex items-center justify-center font-bold transition cursor-pointer shadow"
                  >
                    ❯
                  </button>
                </>
              )}
            </div>

            {imagesList.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
                {imagesList.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 aspect-[16/10] rounded-lg overflow-hidden cursor-pointer border-2 transition shrink-0 ${
                      activeImageIndex === idx ? 'border-pink-600 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* গিগ ডেসক্রিপশন */}
          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
            <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              Description:
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {gig.description}
            </p>
          </div>

          {/* Compare Package */}
          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 overflow-x-auto">
            <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              Compare Packages
            </h3>
            <table className="w-full text-left text-xs sm:text-sm min-w-[450px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="p-3 font-bold">Package</th>
                  <th className="p-3 font-bold">Price</th>
                  <th className="p-3 font-bold">Delivery</th>
                  <th className="p-3 font-bold">Revisions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                <tr>
                  <td className="p-3 font-extrabold text-pink-600">Basic</td>
                  <td className="p-3">${pricingData.basic.price}</td>
                  <td className="p-3">{pricingData.basic.delivery} Days</td>
                  <td className="p-3">{pricingData.basic.revision}</td>
                </tr>
                <tr>
                  <td className="p-3 font-extrabold text-pink-600">Premium</td>
                  <td className="p-3">${pricingData.standard.price}</td>
                  <td className="p-3">{pricingData.standard.delivery} Days</td>
                  <td className="p-3">{pricingData.standard.revision}</td>
                </tr>
                <tr>
                  <td className="p-3 font-extrabold text-pink-600">Advanced</td>
                  <td className="p-3">${pricingData.premium.price}</td>
                  <td className="p-3">{pricingData.premium.delivery} Days</td>
                  <td className="p-3">{pricingData.premium.revision}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Seller Portfolio */}
          {portfolioWorks.length > 0 && (
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                Seller Portfolio
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {portfolioWorks.map((workImg, idx) => (
                  <div key={idx} className="aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                    <img src={workImg} alt="Portfolio Work" className="w-full h-full object-cover hover:scale-105 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* রিভিউ সেকশন */}
          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            
            <div className="flex justify-between items-center text-xs sm:text-sm flex-wrap gap-2">
              <span className="text-slate-400 font-semibold">Project Feedback</span>
              <button onClick={() => showToast('Project reported successfully.','success')} className="text-emerald-500 hover:underline font-extrabold cursor-pointer">
                Report this project
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-xl">★</span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                4.6 <span className="text-slate-400 font-normal text-xs sm:text-sm">· {allSellerReviews.length} reviews</span>
              </h3>
            </div>

            {/* স্টার প্রোগ্রেস বার */}
            <div className="space-y-2 max-w-sm text-xs sm:text-sm text-slate-400 font-semibold">
              <div className="flex items-center gap-3">
                <span className="w-14 shrink-0">5 stars</span>
                <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[85%]"></div>
                </div>
                <span>(33)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-14 shrink-0">4 stars</span>
                <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[10%]"></div>
                </div>
                <span>(1)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-14 shrink-0">3 stars</span>
                <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-0"></div>
                </div>
                <span>(0)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-14 shrink-0">2 stars</span>
                <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-0"></div>
                </div>
                <span>(0)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-14 shrink-0">1 star</span>
                <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[5%]"></div>
                </div>
                <span>(3)</span>
              </div>
            </div>

            {/* ড্যাশবোর্ড ট্যাব স্টাইলের বাটন বার */}
            <div className="flex gap-2 bg-slate-100 dark:bg-[#0b0f19] p-1.5 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
              {[
                { id: 'thisGig', label: `This gig (${thisGigReviews.length})` },
                { id: 'allProjects', label: `All projects (${allSellerReviews.length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setReviewTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
                    reviewTab === tab.id 
                      ? 'bg-pink-600 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* রিভিউ লিস্ট */}
            <div className="space-y-3 pt-2">
              {displayedReviews.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs font-bold">
                  No reviews yet for this section.
                </div>
              ) : (
                displayedReviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 sm:p-4 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="font-extrabold text-slate-900 dark:text-white">{rev.client || rev.clientName}</span>
                      <span className="text-slate-400 font-medium">{rev.date}</span>
                    </div>
                    <div className="text-amber-400 text-xs">{'★'.repeat(rev.rating)}</div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">"{rev.comment}"</p>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* FAQs */}
          {gig.faqs && gig.faqs.length > 0 && (
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {gig.faqs.map((faq, index) => (
                  <div key={index} className="space-y-1.5">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">Q: {faq.question}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 pl-3 border-l-2 border-pink-600">A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ডান দিকের সাইডবার */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6 relative overflow-hidden">
            
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-pink-600/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="grid grid-cols-3 bg-slate-100 dark:bg-[#0b0f19] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-center relative z-10">
              {[
                { id: 'basic', label: 'Basic' },
                { id: 'standard', label: 'Premium' },
                { id: 'premium', label: 'Advanced' }
              ].map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer ${
                    selectedPackage === pkg.id 
                      ? 'bg-pink-600 text-white shadow-md font-extrabold scale-[1.02]' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {pkg.label}
                </button>
              ))}
            </div>

            <div className="text-center space-y-3 relative z-10">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                ${currentPricing.price}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-3 py-2 bg-slate-50 dark:bg-[#0b0f19] rounded-xl border border-slate-100 dark:border-slate-800/80 min-h-[52px] flex items-center justify-center">
                {currentPricing.desc || 'Professional project execution with clean design and standard delivery.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 dark:border-slate-800 relative z-10">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0b0f19] p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-base">⏱️</span>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Delivery</span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">{currentPricing.delivery} Days</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0b0f19] p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-base">🔄</span>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Revisions</span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">{currentPricing.revision}</span>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              {isSellerMode ? (
                <button
                  disabled
                  className="w-full py-4 rounded-2xl bg-slate-800 text-slate-400 text-xs sm:text-sm font-extrabold cursor-not-allowed uppercase tracking-wider text-center border border-slate-700 shadow-inner"
                >
                  Sellers Cannot Order
                </button>
              ) : isOwner ? (
                <button
                  disabled
                  className="w-full py-4 rounded-2xl bg-slate-800 text-slate-400 text-xs sm:text-sm font-extrabold cursor-not-allowed uppercase tracking-wider text-center border border-slate-700 shadow-inner"
                >
                  Your Own Gig (Cannot Order)
                </button>
              ) : (
                <button
                  onClick={handleOpenOrderModal}
                  className="w-full py-4 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-pink-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  Place Order (${currentPricing.price})
                </button>
              )}
            </div>

          </div>

          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
              Seller Reviews Summary
            </h4>
            <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
              <span className="text-slate-500">Total Reviews Received:</span>
              <span className="text-amber-500 text-sm">★ {allSellerReviews.length}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              All reviews are verified from genuine client orders completed on TaleGig.
            </p>
          </div>

          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <div 
              onClick={() => handleNavigateProfile(gig.sellerUsername)}
              className="flex items-center gap-3.5 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                <img 
                  src={gig.sellerImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                  alt="Seller" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-pink-600 transition">
                  {gig.sellerName || "Saidur R."} <span className="text-slate-400 font-normal text-xs">@{gig.sellerUsername || "srmarjan"}</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Online • {gig.location || "United Kingdom"}</p>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold">
                  <span className="text-amber-400">★ 4.6</span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="text-slate-500 dark:text-slate-400">💬 {allSellerReviews.length} reviews</span>
                </div>
              </div>
            </div>

            {!isOwner && (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleOpenChatModal}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold transition cursor-pointer shadow-sm"
                >
                  Chat
                </button>
                <button 
                  onClick={() => handleNavigateProfile(gig.sellerUsername)}
                  className="py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-extrabold transition cursor-pointer shadow-sm"
                >
                  View Profile
                </button>
              </div>
            )}

            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">On time</span>
                <span className="text-slate-900 dark:text-white">100%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">On budget</span>
                <span className="text-slate-900 dark:text-white">98%</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* -------------------- সেলারের অন্যান্য গিগ -------------------- */}
      {sellerGigs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            More projects from {gig.sellerName || "Md Saidur Rahman"}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellerGigs.map((item) => (
              <div 
                key={item.id}
                onClick={() => navigate(`/gig/${item.id}`)}
                className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:border-pink-600 transition flex flex-col justify-between"
              >
                <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img src={item.image || (item.images && item.images[0])} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                </div>

                <div className="p-5 space-y-3">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 hover:text-pink-600 transition">
                    {item.title}
                  </h4>
                  
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="flex items-center gap-1">⏱️ {item.pricingData?.basic?.delivery || '2'} day delivery</span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">From ${item.pricingData?.basic?.price || item.price || '10'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------- সিমিলার গিগ -------------------- */}
      {similarGigs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Similar Ranking Gigs You Might Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarGigs.map((item) => (
              <div 
                key={item.id}
                onClick={() => navigate(`/gig/${item.id}`)}
                className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:border-pink-600 transition flex flex-col justify-between"
              >
                <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800">
                  <img src={item.image || (item.images && item.images[0])} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5 space-y-3">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2">{item.title}</h4>
                  
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <span>@{item.sellerUsername || 'seller'}</span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">${item.pricingData?.basic?.price || '10'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Floating Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#16171a] border-t border-slate-200 dark:border-slate-800 p-3 px-5 flex justify-between items-center shadow-2xl">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-extrabold">{currentPricing.name} Package</span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white">${currentPricing.price} USD</span>
        </div>
        {isSellerMode ? (
          <button
            disabled
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-extrabold cursor-not-allowed uppercase tracking-wider border border-slate-700"
          >
            Sellers Cannot Order
          </button>
        ) : isOwner ? (
          <button
            disabled
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-extrabold cursor-not-allowed uppercase tracking-wider border border-slate-700"
          >
            Your Own Gig
          </button>
        ) : (
          <button
            onClick={handleOpenOrderModal}
            className="px-6 py-2.5 rounded-xl bg-pink-600 text-white text-xs font-extrabold shadow-md cursor-pointer uppercase tracking-wider"
          >
            Order Now
          </button>
        )}
      </div>

      {/* 1. Buyer Requirements Modal (Adjustable/Resizable Textarea) */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Submit Project Requirements
              </h3>
              <button 
                onClick={() => setIsOrderModalOpen(false)}
                className="text-slate-400 hover:text-red-500 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 block mb-1.5">
                  What do you need for this project? <span className="text-pink-600">*</span>
                </label>
                {/* টেক্সটবক্সটি এখন ওপর-নিচ সাইজ অ্যাডজাস্ট (resizable) করা যাবে */}
                <textarea 
                  rows="4"
                  required
                  value={requirementAnswer}
                  onChange={(e) => setRequirementAnswer(e.target.value)}
                  placeholder="Provide all details needed to get started..."
                  className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-pink-600 text-slate-900 dark:text-white resize-y min-h-[100px] shadow-inner"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-extrabold shadow-md cursor-pointer"
                >
                  Proceed to Payment (${currentPricing.price})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Mandatory Secure Payment Checkout Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Secure Checkout (${currentPricing.price})
              </h3>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-red-500 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPaymentAndOrder} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Card Number</label>
                <input 
                  type="text"
                  required
                  placeholder="4242 •••• •••• ••••"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-pink-600 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Expires (MM/YY)</label>
                  <input 
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-pink-600 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">CVC / Cvv</label>
                  <input 
                    type="password"
                    required
                    maxLength="4"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-pink-600 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md cursor-pointer uppercase tracking-wider"
                >
                  Pay & Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Chat Modal */}
      {isChatOpen && (
        <div className="fixed bottom-16 sm:bottom-4 right-4 z-50 w-80 sm:w-96 bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-slate-900 text-white p-3.5 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800">
                <img src={gig.sellerImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} alt="Seller" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm">{gig.sellerName || "Saidur R."}</h4>
                <p className="text-[10px] text-emerald-400 font-semibold">Online</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer text-sm">✕</button>
          </div>

          <div className="p-3.5 h-64 overflow-y-auto space-y-3 bg-slate-50 dark:bg-[#0b0f19] text-xs sm:text-sm">
            {chatMessagesList.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2.5 rounded-xl max-w-[85%] font-medium ${msg.sender === 'buyer' ? 'bg-pink-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-2.5 bg-white dark:bg-[#16171a] border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input 
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none text-slate-900 dark:text-white"
            />
            <button type="submit" className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer shadow">
              Send
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default GigDetails;