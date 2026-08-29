import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PrivateNavbar from './PrivateNavbar';
import PublicNavbar from './PublicNavbar';
import { useToast } from '../Home/ToastContext';

// 🟢 গ্লোবাল ডাইনামিক ফি ও কমিশন ক্যালকুলেটর হেল্পার
export const calculateDynamicEarnings = (totalAmount) => {
  const amount = Number(totalAmount) || 0;
  let sellerCommissionRate = 10; // সেলারের জন্য ডিফল্ট ১০%
  let buyerFeeRate = 5;         // বায়ারের জন্য ডিফল্ট ৫%

  try {
    const savedSellerComm = localStorage.getItem('talegig_seller_commission_rate');
    if (savedSellerComm !== null) sellerCommissionRate = Number(savedSellerComm);

    const savedBuyerFee = localStorage.getItem('talegig_buyer_fee_rate');
    if (savedBuyerFee !== null) buyerFeeRate = Number(savedBuyerFee);
  } catch (e) {}

  const buyerServiceFee = amount * (buyerFeeRate / 100);
  const totalPaidByBuyer = amount + buyerServiceFee;

  const sellerCommission = amount * (sellerCommissionRate / 100);
  const sellerNetEarnings = amount - sellerCommission;
  const { showToast } = useToast();

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

const GigOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('Activity');

  // চ্যাট স্টেট
  const [chatMessage, setChatMessage] = useState('');

  // ডেলিভারি ও ফাইল আপলোড স্টেট
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);

  // রিভিশন ও কাস্টম অফার স্টেট
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [isCustomOfferModalOpen, setIsCustomOfferModalOpen] = useState(false);
  const [customPrice, setCustomPrice] = useState('');

  // রিভিউ মডাল স্টেট
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // লাইভ কাউন্টডাউন টাইমার স্টেট
  const [timeLeft, setTimeLeft] = useState(0);

  // ইউজার ও ডাইনামিক ভিউ রোল স্টেট
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem('talegig_user') || '{"username": "srmarjan", "role": "seller"}');
    const storedRole = localStorage.getItem('userRole') || storedUser.role || 'seller';
    return { ...storedUser, role: storedRole };
  });

  useEffect(() => {
    loadSingleOrder();
  }, [id]);

  // নির্দিষ্ট অর্ডার আইডি অনুযায়ী ডেটা লোড করার সঠিক লজিক
  const loadSingleOrder = () => {
    const savedOrders = JSON.parse(localStorage.getItem('talegig_gig_orders') || localStorage.getItem('talegig_orders') || '[]');
    const activeOrderId = id || localStorage.getItem('talegig_active_order_id');

    let current = null;
    if (activeOrderId) {
      current = savedOrders.find(o => o.id.toString() === activeOrderId.toString());
    }
    
    if (!current && savedOrders.length > 0) {
      current = savedOrders[0];
    }

    if (current) {
      setSelectedOrder(current);
      initializeTimer(current);
    }
  };

  const initializeTimer = (order) => {
    if (!order) return;
    const timerKey = `order_deadline_${order.id}`;
    let deadline = localStorage.getItem(timerKey);

    if (!deadline) {
      const days = parseInt(order.deliveryDays || 3);
      deadline = new Date().getTime() + days * 24 * 60 * 60 * 1000;
      localStorage.setItem(timerKey, deadline);
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = parseInt(deadline) - now;
      if (distance < 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(distance);
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (selectedOrder) {
      initializeTimer(selectedOrder);
    }
  }, [selectedOrder]);

  const formatTime = (ms) => {
    if (ms <= 0) return "Time is up!";
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
  };

  const handleSwitchRole = (newRole) => {
    const updatedUser = { ...currentUser, role: newRole };
    setCurrentUser(updatedUser);
    localStorage.setItem('userRole', newRole);
    localStorage.setItem('talegig_user', JSON.stringify(updatedUser));
    window.location.reload();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      url: URL.createObjectURL(file)
    }));
    setAttachedFiles([...attachedFiles, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleDeliverSubmit = (e) => {
    e.preventDefault();
    if (!deliveryNote.trim() && attachedFiles.length === 0) {
      showToast('Please add a delivery note and attach at least one file!','error');
      return;
    }

    const deliveryPayload = {
      sender: 'seller',
      senderName: currentUser.username,
      text: `Work Delivered: ${deliveryNote}`,
      files: attachedFiles,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDelivery: true
    };

    const updatedChat = [...(selectedOrder.chatList || []), deliveryPayload];
    const savedOrders = JSON.parse(localStorage.getItem('talegig_gig_orders') || localStorage.getItem('talegig_orders') || '[]');

    const updatedOrders = savedOrders.map(ord => {
      if (ord.id.toString() === selectedOrder.id.toString()) {
        return {
          ...ord,
          status: 'delivered',
          deliveryNote,
          deliveredFiles: attachedFiles,
          chatList: updatedChat
        };
      }
      return ord;
    });

    localStorage.setItem('talegig_gig_orders', JSON.stringify(updatedOrders));
    setSelectedOrder(updatedOrders.find(o => o.id.toString() === selectedOrder.id.toString()));
    setIsDeliverModalOpen(false);
    setDeliveryNote('');
    setAttachedFiles([]);
    showToast('Files delivered successfully!','success');
  };

  // 🟢 বায়ার যখন ডেলিভারি এক্সেপ্ট করবে, তখন ডাইনামিক কমিশন অনুযায়ী অ্যাডমিন প্রফিট ও সেলার নিট ইনকাম সেভ হবে
  const handleAcceptDelivery = (orderId) => {
    if (window.confirm('Are you sure you want to accept this delivery and release payment?')) {
      const savedOrders = JSON.parse(localStorage.getItem('talegig_gig_orders') || localStorage.getItem('talegig_orders') || '[]');
      const updatedOrders = savedOrders.map(ord => {
        if (ord.id.toString() === orderId.toString()) {
          return { ...ord, status: 'complete' };
        }
        return ord;
      });

      localStorage.setItem('talegig_gig_orders', JSON.stringify(updatedOrders));
      setSelectedOrder({ ...selectedOrder, status: 'complete' });
      
      try {
        const rawPrice = Number(selectedOrder.price || 0);
        const dynamicFees = calculateDynamicEarnings(rawPrice);

        // অ্যাডমিন গ্রস ও নিট প্রফিট আপডেট
        const currentGross = parseFloat(localStorage.getItem('talegig_admin_gross_revenue') || '0');
        const currentNetProfit = parseFloat(localStorage.getItem('talegig_admin_total_revenue') || '0');
        localStorage.setItem('talegig_admin_gross_revenue', currentGross + dynamicFees.totalPaidByBuyer);
        localStorage.setItem('talegig_admin_total_revenue', currentNetProfit + dynamicFees.totalAdminRevenue);
        
        const existingTx = JSON.parse(localStorage.getItem('talegig_transactions') || '[]');
        const newTx = {
          id: Date.now(),
          type: 'add',
          amount: dynamicFees.sellerNetEarnings,
          buyerPaidTotal: dynamicFees.totalPaidByBuyer,
          adminProfit: dynamicFees.totalAdminRevenue,
          method: 'Gig Order Release',
          details: `Order #${selectedOrder.id}`,
          date: new Date().toLocaleDateString(),
          status: 'Successful'
        };
        localStorage.setItem('talegig_transactions', JSON.stringify([newTx, ...existingTx]));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {}

      showToast('Payment released successfully! Please leave a review.','success');
      setIsReviewModalOpen(true);
    }
  };

  const handleRequestRevision = (e) => {
    e.preventDefault();
    const maxRevisions = selectedOrder.maxRevisions || 2;
    const currentUsed = selectedOrder.revisionsUsed || 0;

    if (maxRevisions !== 'Unlimited' && currentUsed >= maxRevisions) {
      showToast('All available revisions used! Please request a custom offer for extra revisions.','error');
      setIsRevisionModalOpen(false);
      return;
    }

    const savedOrders = JSON.parse(localStorage.getItem('talegig_gig_orders') || localStorage.getItem('talegig_orders') || '[]');
    const updatedOrders = savedOrders.map(ord => {
      if (ord.id.toString() === selectedOrder.id.toString()) {
        return {
          ...ord,
          status: 'revision',
          revisionsUsed: currentUsed + 1,
          revisionNote
        };
      }
      return ord;
    });

    localStorage.setItem('talegig_gig_orders', JSON.stringify(updatedOrders));
    setSelectedOrder({ ...selectedOrder, status: 'revision', revisionsUsed: currentUsed + 1, revisionNote });
    setIsRevisionModalOpen(false);
    setRevisionNote('');
    showToast('Revision request sent to the seller.','success');
  };

  const handleSendCustomOffer = (e) => {
    e.preventDefault();
    const savedOrders = JSON.parse(localStorage.getItem('talegig_gig_orders') || localStorage.getItem('talegig_orders') || '[]');
    const updatedOrders = savedOrders.map(ord => {
      if (ord.id.toString() === selectedOrder.id.toString()) {
        return {
          ...ord,
          status: 'pending',
          maxRevisions: (typeof ord.maxRevisions === 'number' ? ord.maxRevisions : 2) + 2,
          price: parseFloat(ord.price) + parseFloat(customPrice || 10)
        };
      }
      return ord;
    });

    localStorage.setItem('talegig_gig_orders', JSON.stringify(updatedOrders));
    setSelectedOrder(updatedOrders.find(o => o.id.toString() === selectedOrder.id.toString()));
    setIsCustomOfferModalOpen(false);
    setCustomPrice('');
    showToast('Custom offer for extra revisions sent!','success');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMsg = {
      sender: currentUser.role,
      senderName: currentUser.username,
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChat = [...(selectedOrder.chatList || []), newMsg];
    const savedOrders = JSON.parse(localStorage.getItem('talegig_gig_orders') || localStorage.getItem('talegig_orders') || '[]');

    const updatedOrders = savedOrders.map(ord => {
      if (ord.id.toString() === selectedOrder.id.toString()) {
        return { ...ord, chatList: updatedChat };
      }
      return ord;
    });

    localStorage.setItem('talegig_gig_orders', JSON.stringify(updatedOrders));
    setSelectedOrder({ ...selectedOrder, chatList: updatedChat });
    setChatMessage('');
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newReview = {
      id: Date.now(),
      gigId: selectedOrder.gigId,
      client: currentUser.username,
      rating: parseInt(rating),
      comment,
      date: 'Just now'
    };

    const existingGigs = JSON.parse(localStorage.getItem('talegig_gigs') || '[]');
    const updatedGigs = existingGigs.map(g => {
      if (g.id.toString() === selectedOrder.gigId?.toString()) {
        const reviews = g.sellerReviews || [];
        return { ...g, sellerReviews: [newReview, ...reviews] };
      }
      return g;
    });
    localStorage.setItem('talegig_gigs', JSON.stringify(updatedGigs));

    const savedOrders = JSON.parse(localStorage.getItem('talegig_gig_orders') || localStorage.getItem('talegig_orders') || '[]');
    const updatedOrders = savedOrders.map(ord => {
      if (ord.id.toString() === selectedOrder.id.toString()) {
        return { ...ord, isReviewed: true };
      }
      return ord;
    });
    
    localStorage.setItem('talegig_gig_orders', JSON.stringify(updatedOrders));
    setSelectedOrder({ ...selectedOrder, isReviewed: true });
    setIsReviewModalOpen(false);
    setComment('');
    showToast('Review posted successfully!','success');
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-white min-h-screen pb-16 transition-colors">
      {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}

      <div className="bg-white dark:bg-[#16171a] border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Preview Mode:</span>
            <div className="inline-flex bg-slate-100 dark:bg-[#0b0f19] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => handleSwitchRole('seller')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${currentUser.role === 'seller' ? 'bg-pink-600 text-white shadow' : 'text-slate-500'}`}
              >
                Seller View
              </button>
              <button 
                onClick={() => handleSwitchRole('buyer')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${currentUser.role === 'buyer' ? 'bg-pink-600 text-white shadow' : 'text-slate-500'}`}
              >
                Buyer View
              </button>
            </div>
          </div>
          <span className="text-xs font-bold text-pink-600 bg-pink-50 dark:bg-pink-950/30 px-3 py-1 rounded-lg">
            Active Role: {currentUser.role.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        
        {!selectedOrder ? (
          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <h2 className="text-xl font-extrabold">No order selected or found!</h2>
            <p className="text-sm text-slate-400">Please click on 'View Order' from your All Projects or Gig Order list to manage the order.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                
                <div className="flex gap-2 bg-slate-100 dark:bg-[#0b0f19] p-1.5 mx-4 sm:mx-6 mt-4 sm:mt-6 rounded-2xl w-fit border border-slate-200 dark:border-slate-800">
                  {['Activity', 'Details', 'Requirements'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab)}
                      className={`px-4 sm:px-6 py-2 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                        activeSubTab === tab 
                          ? 'bg-pink-600 text-white shadow-md' 
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  
                  {activeSubTab === 'Activity' && (
                    <div className="space-y-6">
                      
                      <div className="p-4 sm:p-6 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-inner">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                            Order Status: <span className="uppercase text-pink-600">{selectedOrder.status}</span>
                          </h3>
                          <span className="text-xs font-extrabold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                            Time Left: {formatTime(timeLeft)}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                          {selectedOrder.status === 'pending' && 'Project is active. Seller is working on the requirements.'}
                          {selectedOrder.status === 'delivered' && 'Work has been delivered. Review files below and accept or request a revision.'}
                          {selectedOrder.status === 'revision' && `Revision requested (${selectedOrder.revisionsUsed || 1} used). Waiting for seller update.`}
                          {selectedOrder.status === 'complete' && 'Order completed successfully and payment released!'}
                        </p>

                        <div className="pt-1 flex gap-3 flex-wrap">
                          {currentUser.role === 'seller' && (selectedOrder.status === 'pending' || selectedOrder.status === 'revision') && (
                            <button 
                              onClick={() => setIsDeliverModalOpen(true)}
                              className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md cursor-pointer transition"
                            >
                              Deliver Work
                            </button>
                          )}

                          {selectedOrder.status === 'delivered' && currentUser.role === 'buyer' && (
                            <div className="space-y-3 w-full">
                              {selectedOrder.deliveredFiles && selectedOrder.deliveredFiles.length > 0 && (
                                <div className="p-4 bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                                  <p className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300">Delivered Files:</p>
                                  {selectedOrder.deliveredFiles.map((file, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-[#0b0f19] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">
                                      <span className="text-pink-600 truncate pr-2">📎 {file.name} ({file.size})</span>
                                      <a href={file.url} download={file.name} className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-extrabold shadow shrink-0">Download</a>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="flex gap-3 flex-wrap">
                                <button 
                                  onClick={() => handleAcceptDelivery(selectedOrder.id)}
                                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md cursor-pointer transition"
                                >
                                  Accept & Release Payment
                                </button>
                                <button 
                                  onClick={() => setIsRevisionModalOpen(true)}
                                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md cursor-pointer transition"
                                >
                                  Request Revision ({selectedOrder.maxRevisions || 2} available)
                                </button>
                              </div>
                            </div>
                          )}

                          {currentUser.role === 'seller' && (selectedOrder.revisionsUsed || 0) >= (selectedOrder.maxRevisions || 2) && selectedOrder.maxRevisions !== 'Unlimited' && (
                            <button 
                              onClick={() => setIsCustomOfferModalOpen(true)}
                              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md cursor-pointer transition"
                            >
                              Create Custom Offer (Extra Revisions)
                            </button>
                          )}

                          {selectedOrder.status === 'complete' && currentUser.role === 'buyer' && !selectedOrder.isReviewed && (
                            <button 
                              onClick={() => setIsReviewModalOpen(true)}
                              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md cursor-pointer transition"
                            >
                              Leave Review ★
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Project Communication & Chat</h4>
                        
                        <div className="h-80 overflow-y-auto space-y-3 p-3 bg-white dark:bg-[#16171a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner custom-scrollbar">
                          {(!selectedOrder.chatList || selectedOrder.chatList.length === 0) ? (
                            <p className="text-xs text-slate-400 text-center py-24 font-medium">No messages yet. Start conversation below.</p>
                          ) : (
                            selectedOrder.chatList.map((msg, idx) => (
                              <div key={idx} className={`flex ${msg.sender === currentUser.role ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs sm:text-sm font-medium shadow-sm leading-relaxed ${msg.sender === currentUser.role ? 'bg-pink-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700/60'}`}>
                                  <div className="flex justify-between items-center gap-3 mb-1">
                                    <span className={`font-bold text-[11px] ${msg.sender === currentUser.role ? 'text-pink-100' : 'text-slate-400'}`}>@{msg.senderName}</span>
                                    <span className={`text-[10px] ${msg.sender === currentUser.role ? 'text-pink-200' : 'text-slate-400'}`}>{msg.time}</span>
                                  </div>
                                  <p className="text-xs sm:text-sm whitespace-pre-line">{msg.text}</p>
                                  {msg.files && msg.files.map((f, fIdx) => (
                                    <div key={fIdx} className="mt-2.5 p-2.5 bg-black/20 rounded-lg flex justify-between items-center text-xs">
                                      <span className="truncate pr-2">📎 {f.name}</span>
                                      <a href={f.url} download={f.name} className="underline font-bold shrink-0">Download</a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <form onSubmit={handleSendMessage} className="flex items-end gap-2.5 bg-white dark:bg-[#16171a] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
                          <textarea 
                            rows="1"
                            value={chatMessage}
                            onChange={(e) => {
                              setChatMessage(e.target.value);
                              e.target.style.height = 'auto';
                              e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                            }}
                            placeholder="Type message..."
                            className="flex-1 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-pink-600 text-slate-900 dark:text-white resize-y max-h-[100px] min-h-[38px] leading-relaxed custom-scrollbar"
                          ></textarea>
                          
                          <button 
                            type="submit" 
                            className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs sm:text-sm font-extrabold cursor-pointer shadow transition shrink-0"
                          >
                            Send
                          </button>
                        </form>
                      </div>

                    </div>
                  )}

                  {activeSubTab === 'Details' && (
                    <div className="space-y-4 text-xs sm:text-sm">
                      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
                        <table className="w-full text-left min-w-[450px]">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-[#0b0f19] text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase text-[11px] tracking-wider">
                              <th className="p-3 font-extrabold">Item</th>
                              <th className="p-3 font-extrabold">Qty.</th>
                              <th className="p-3 font-extrabold">Duration</th>
                              <th className="p-3 font-extrabold">Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                            <tr>
                              <td className="p-3 space-y-1">
                                <p className="font-extrabold text-slate-900 dark:text-white uppercase">{selectedOrder.packageName || 'STANDARD'} PACKAGE</p>
                                <p className="text-slate-500 text-xs">{selectedOrder.title}</p>
                                <ul className="text-[11px] text-slate-400 list-disc pl-4 space-y-0.5 pt-1">
                                  <li>{selectedOrder.maxRevisions || 3} revisions</li>
                                  <li>2 concepts included</li>
                                  <li>Logo transparency & Printable file</li>
                                </ul>
                              </td>
                              <td className="p-3">1</td>
                              <td className="p-3">{selectedOrder.deliveryDays} days</td>
                              <td className="p-3 font-extrabold">${selectedOrder.price}</td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr className="bg-slate-50 dark:bg-[#0b0f19]/60 border-t border-slate-200 dark:border-slate-800 font-extrabold text-sm">
                              <td colSpan="3" className="p-3 text-right">Total</td>
                              <td className="p-3 text-pink-600">${selectedOrder.price} USD</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'Requirements' && (
                    <div className="space-y-3 text-xs sm:text-sm">
                      <h4 className="font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Dynamic Buyer Requirements</h4>
                      <div className="p-4 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner">
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line font-medium leading-relaxed">{selectedOrder.requirementAnswer}</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>

            <div className="space-y-6">
              
              <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Order details
                </h4>
                
                <div className="flex gap-3 items-center">
                  <div className="w-16 aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 shadow">
                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600" alt="Gig" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{selectedOrder.title}</h5>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md mt-1 inline-block ${selectedOrder.status === 'complete' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-pink-500/10 text-pink-600'}`}>
                      {selectedOrder.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs sm:text-sm pt-2 border-t border-slate-100 dark:border-slate-800 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ordered by</span>
                    <span className="font-extrabold">@{selectedOrder.client}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivery time (Live)</span>
                    <span className="font-extrabold text-pink-600">{formatTime(timeLeft)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total price</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">${selectedOrder.price} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order number</span>
                    <span className="font-mono font-extrabold text-pink-600">#FO{selectedOrder.id.toString().slice(-8)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Track Order
                </h4>

                <div className="space-y-4 text-xs sm:text-sm font-extrabold relative pl-5 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  
                  <div className="flex items-center gap-3 relative">
                    <span className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] shrink-0 z-10 shadow">✓</span>
                    <span className="text-slate-900 dark:text-white">Order placed</span>
                  </div>

                  <div className="flex items-center gap-3 relative">
                    <span className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] shrink-0 z-10 shadow">✓</span>
                    <span className="text-slate-900 dark:text-white">Requirements submitted</span>
                  </div>

                  <div className="flex items-center gap-3 relative">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 z-10 shadow ${selectedOrder.status !== 'pending' ? 'bg-pink-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      {selectedOrder.status !== 'pending' ? '✓' : '•'}
                    </span>
                    <span className={selectedOrder.status !== 'pending' ? 'text-slate-900 dark:text-white' : 'text-slate-400 font-medium'}>Order in progress</span>
                  </div>

                  <div className="flex items-center gap-3 relative">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 z-10 shadow ${selectedOrder.status === 'delivered' || selectedOrder.status === 'complete' ? 'bg-pink-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      {selectedOrder.status === 'delivered' || selectedOrder.status === 'complete' ? '✓' : '•'}
                    </span>
                    <span className={selectedOrder.status === 'delivered' || selectedOrder.status === 'complete' ? 'text-slate-900 dark:text-white' : 'text-slate-400 font-medium'}>Delivery reviewed</span>
                  </div>

                  <div className="flex items-center gap-3 relative">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 z-10 shadow ${selectedOrder.status === 'complete' ? 'bg-pink-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      {selectedOrder.status === 'complete' ? '✓' : '•'}
                    </span>
                    <span className={selectedOrder.status === 'complete' ? 'text-slate-900 dark:text-white' : 'text-slate-400 font-medium'}>Order completed</span>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {isDeliverModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">Deliver Completed Work</h3>
              <button onClick={() => setIsDeliverModalOpen(false)} className="text-slate-400 hover:text-red-500 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleDeliverSubmit} className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 block mb-1.5">Delivery Message *</label>
                <textarea 
                  rows="4"
                  required
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Here are your final files..."
                  className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm focus:outline-none focus:border-pink-600 text-slate-900 dark:text-white resize-none shadow-inner"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 block">Attach Project Files</label>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-pink-600 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-[#0b0f19] transition">
                  <input type="file" multiple onChange={handleFileChange} className="hidden" />
                  <span className="text-xs sm:text-sm font-extrabold text-pink-600">Browse Files to Upload</span>
                  <span className="text-[11px] text-slate-400 mt-1">Supports ZIP, PSD, AI, PNG, JPG</span>
                </label>

                {attachedFiles.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-100 dark:bg-[#0b0f19] p-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 font-bold">
                        <span className="truncate pr-2">📎 {file.name} ({file.size})</span>
                        <button type="button" onClick={() => handleRemoveFile(idx)} className="text-red-500 hover:underline cursor-pointer shrink-0">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsDeliverModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-extrabold shadow-md cursor-pointer">Submit Delivery</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRevisionModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">Request Revision</h3>
              <button onClick={() => setIsRevisionModalOpen(false)} className="text-slate-400 hover:text-red-500 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleRequestRevision} className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 block mb-1.5">Revision Note / Changes Needed *</label>
                <textarea 
                  rows="4"
                  required
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Specify the changes needed..."
                  className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm focus:outline-none focus:border-pink-600 text-slate-900 dark:text-white resize-none shadow-inner"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsRevisionModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-extrabold shadow-md cursor-pointer">Submit Revision</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCustomOfferModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">Create Custom Offer (Extra Revisions)</h3>
              <button onClick={() => setIsCustomOfferModalOpen(false)} className="text-slate-400 hover:text-red-500 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSendCustomOffer} className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 block mb-1.5">Extra Amount ($ USD) *</label>
                <input 
                  type="number"
                  required
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="10"
                  className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm focus:outline-none text-slate-900 dark:text-white shadow-inner"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCustomOfferModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-extrabold shadow-md cursor-pointer">Send Custom Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isReviewModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">Leave a Review</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-red-500 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 block mb-1.5">Rating (1 to 5 Stars)</label>
                <select 
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm font-bold focus:outline-none text-slate-900 dark:text-white shadow-inner"
                >
                  <option value="5">★★★★★ (5 Stars - Amazing)</option>
                  <option value="4">★★★★☆ (4 Stars - Good)</option>
                  <option value="3">★★★☆☆ (3 Stars - Average)</option>
                  <option value="2">★★☆☆☆ (2 Stars - Poor)</option>
                  <option value="1">★☆☆☆☆ (1 Star - Terrible)</option>
                </select>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 block mb-1.5">Your Feedback / Review *</label>
                <textarea 
                  rows="4"
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe your experience working with this seller..."
                  className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm focus:outline-none focus:border-pink-600 text-slate-900 dark:text-white resize-none shadow-inner"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsReviewModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-extrabold shadow-md cursor-pointer">Post Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GigOrder;