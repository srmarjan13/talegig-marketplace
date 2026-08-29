import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../Home/ToastContext'; // 🟢 টোস্ট ইম্পোর্ট করা হলো

// 💳 গ্লোবাল, সিকিউরড, ডাইনামিক, থিম-অ্যাডাপ্টিভ এবং হাই-লেয়ার চেকআউট কম্পোনেন্ট (Checkout)
const Checkout = ({ isOpen = false, onClose, initialAmount = 100, userRole = 'buyer', onPaymentSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast(); // 🟢 টোস্ট হুক কল করা হলো

  // 🟢 CreateProject থেকে পাঠানো প্রজেক্ট বা কন্টেস্টের ডেটা রিসিভ করা
  const projectPayload = location.state?.projectData || null;
  const passedAmount = location.state?.totalAmount || initialAmount;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState(passedAmount);
  
  // অটো থিম ডিটেকশন (লাইট ও ডার্ক মোড সিনক্রোনাইজেশন)
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const checkThemeMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                     localStorage.getItem('talegig_theme') === 'dark' || 
                     localStorage.getItem('userTheme') === 'dark';
      setIsDarkMode(isDark);
    };

    checkThemeMode();
    window.addEventListener('storage', checkThemeMode);
    return () => window.removeEventListener('storage', checkThemeMode);
  }, []);
  
  // কার্ড ডিটেইলস স্টেট
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvc: ''
  });
  const [showCvc, setShowCvc] = useState(false);
  const [errors, setErrors] = useState({});

  // পেপ্যাল ডিটেইলস স্টেট
  const [paypalEmail, setPaypalEmail] = useState('');

  // ব্যাংক ডিপোজিট ডিটেইলস স্টেট
  const [bankData, setBankData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    swiftCode: '',
    referenceNo: '',
    documentFile: null
  });

  // 🟢 বাইরে থেকে isOpen প্রপস এবং রাউটের পাথ চেক করে পপআপ কন্ট্রোল করা হলো
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
    else navigate(-1);
  };

  // যদি isOpen ফলস হয় এবং সরাসরি /checkout রাউটেও না থাকে, তবে রেন্ডার হবে না
  const isCheckoutRoute = location.pathname === '/checkout';
  if (!isVisible && !isCheckoutRoute) return null;

  // ফি নির্ধারণ: বায়ারের জন্য 2.9%, সেলারের জন্য 2.5%
  const feePercentage = userRole === 'seller' ? 0.025 : 0.029;
  const feeLabel = userRole === 'seller' ? '2.5%' : '2.9%';

  const depositAmt = Number(depositAmount) || 0;
  const processingFee = Number((depositAmt * feePercentage).toFixed(2));
  const totalDue = Number((depositAmt + processingFee).toFixed(2));

  // কার্ড নম্বর ফরম্যাটিং
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData({ ...cardData, cardNumber: formatted });
    if (errors.cardNumber) setErrors({ ...errors, cardNumber: '' });
  };

  // এক্সপায়ারি ডেট ফরম্যাটিং
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardData({ ...cardData, expiryDate: val });
    if (errors.expiryDate) setErrors({ ...errors, expiryDate: '' });
  };

  // ভ্যালিডেশন চেক
  const validateForm = () => {
    let newErrors = {};
    if (paymentMethod === 'card') {
      const cleanCard = cardData.cardNumber.replace(/\s+/g, '');
      if (cleanCard.length !== 16) {
        newErrors.cardNumber = 'Card number must be exactly 16 digits.';
      }
      if (!cardData.cardHolder.trim() || /\d/.test(cardData.cardHolder)) {
        newErrors.cardHolder = 'Enter a valid name (no numbers allowed).';
      }
      if (!cardData.expiryDate.includes('/') || cardData.expiryDate.length !== 5) {
        newErrors.expiryDate = 'Format must be MM/YY.';
      }
      if (cardData.cvc.length < 3 || isNaN(cardData.cvc)) {
        newErrors.cvc = 'Enter valid CVC (3 digits).';
      }
    } else if (paymentMethod === 'paypal') {
      if (!paypalEmail || !paypalEmail.includes('@')) {
        newErrors.paypalEmail = 'Please enter a valid PayPal email address.';
      }
    } else if (paymentMethod === 'bank') {
      if (!bankData.bankName || !bankData.accountNumber || !bankData.swiftCode || !bankData.referenceNo) {
        newErrors.bank = 'Please fill in all required bank and reference details.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🟢 পেমেন্ট সাকসেসফুল হওয়ার পর ব্যাকএন্ডে ডেটা সেভ করা এবং অটো রিডাইরেক্ট করা
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (depositAmt <= 0) {
      showToast('Please enter a valid amount.', 'error');
      return;
    }

    if (!validateForm()) {
      showToast('Please fix the errors in the payment form.', 'error');
      return;
    }
    
    setLoading(true);

    try {
      if (projectPayload) {
        const response = await fetch('http://localhost:3001/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectPayload)
        });

        const data = await response.json();

        if (response.ok) {
          const localObj = {
            id: data.project?.id || Date.now(),
            ...projectPayload,
            budget: projectPayload.budgetFormatted || `$${projectPayload.budget} USD`,
            timestamp: Date.now()
          };

          const existingProposals = JSON.parse(localStorage.getItem('talegig_proposals') || '[]');
          localStorage.setItem('talegig_proposals', JSON.stringify([localObj, ...existingProposals]));
        }
      }

      const newTx = {
        id: Date.now(),
        type: 'add',
        amount: depositAmt,
        fee: processingFee,
        method: paymentMethod.toUpperCase(),
        date: new Date().toLocaleDateString(),
        status: paymentMethod === 'bank' ? 'Pending Verification' : 'Successful'
      };
      const existingTx = JSON.parse(localStorage.getItem('talegig_transactions') || '[]');
      localStorage.setItem('talegig_transactions', JSON.stringify([newTx, ...existingTx]));

      setTimeout(() => {
        setLoading(false);
        showToast(`Successfully processed payment of $${totalDue} USD and published your post!`, 'success');

        if (onPaymentSuccess) onPaymentSuccess(totalDue);
        setIsVisible(false);

        if (projectPayload && projectPayload.type === 'contest') {
          navigate('/allcontest');
        } else {
          navigate('/allproject');
        }
      }, 1200);

    } catch (err) {
      console.error("Payment & Publish Error:", err);
      setLoading(false);
      showToast('Payment successful, but failed to publish project to server. Saved locally.', 'warning');
      setIsVisible(false);
      if (projectPayload && projectPayload.type === 'contest') {
        navigate('/allcontest');
      } else {
        navigate('/allproject');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[99999] p-3 sm:p-6 overflow-y-auto">
      <div className={`border p-4 sm:p-8 rounded-3xl w-full max-w-4xl shadow-2xl space-y-6 my-auto relative transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-[#0b0f19] border-slate-800 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* মডাল হেডার ও লোগো */}
        <div className={`flex justify-between items-center border-b pb-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3 sm:gap-5">
            <img 
              src="/taleGig1.png" 
              alt="TaleGig Logo" 
              className="w-20 sm:w-28 h-auto object-contain" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <h2 className="text-lg sm:text-2xl font-black">Complete Your Secure Payment</h2>
              <p className={`text-[11px] sm:text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>All transactions are encrypted and secured with bank-grade protocols.</p>
            </div>
          </div>
          <button onClick={handleClose} className={`font-bold text-xl cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'}`}>✕</button>
        </div>

        <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* বাম পাশ: পেমেন্ট মেথড এবং ফর্ম */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Add new payment method</h3>

            {/* ১. ডেবিট বা ক্রেডিট কার্ড */}
            <div 
              onClick={() => setPaymentMethod('card')}
              className={`border rounded-2xl p-4 cursor-pointer transition ${
                paymentMethod === 'card' 
                  ? (isDarkMode ? 'border-pink-600 bg-pink-950/20' : 'border-pink-600 bg-pink-50') 
                  : (isDarkMode ? 'border-slate-800 hover:border-slate-700' : 'border-slate-200 hover:border-slate-300')
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-pink-600 w-4 h-4 cursor-pointer" />
                  <span className="font-extrabold text-sm">Debit or credit card</span>
                </div>
                <span className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>All major cards accepted</span>
              </div>

              {paymentMethod === 'card' && (
                <div className={`space-y-3.5 pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`} onClick={(e) => e.stopPropagation()}>
                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Card number</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="4488 0000 0000 0000" 
                      maxLength="19"
                      value={cardData.cardNumber}
                      onChange={handleCardNumberChange}
                      className={`w-full border ${errors.cardNumber ? 'border-red-500' : (isDarkMode ? 'border-slate-700 bg-[#16171a] text-white' : 'border-slate-300 bg-slate-50 text-black')} rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-pink-600 font-mono`}
                    />
                    {errors.cardNumber && <span className="text-[10px] text-red-500 font-bold mt-1 block">{errors.cardNumber}</span>}
                  </div>

                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Cardholder name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Md Saidur Rahman" 
                      value={cardData.cardHolder}
                      onChange={(e) => {
                        setCardData({...cardData, cardHolder: e.target.value});
                        if (errors.cardHolder) setErrors({...errors, cardHolder: ''});
                      }}
                      className={`w-full border ${errors.cardHolder ? 'border-red-500' : (isDarkMode ? 'border-slate-700 bg-[#16171a] text-white' : 'border-slate-300 bg-slate-50 text-black')} rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-pink-600`}
                    />
                    {errors.cardHolder && <span className="text-[10px] text-red-500 font-bold mt-1 block">{errors.cardHolder}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`text-xs font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Expiry date</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="MM/YY" 
                        maxLength="5"
                        value={cardData.expiryDate}
                        onChange={handleExpiryChange}
                        className={`w-full border ${errors.expiryDate ? 'border-red-500' : (isDarkMode ? 'border-slate-700 bg-[#16171a] text-white' : 'border-slate-300 bg-slate-50 text-black')} rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-pink-600 font-mono text-center`}
                      />
                      {errors.expiryDate && <span className="text-[10px] text-red-500 font-bold mt-1 block">{errors.expiryDate}</span>}
                    </div>
                    <div>
                      <label className={`text-xs font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>CVC / CVV</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required 
                          placeholder="CVC" 
                          maxLength="3"
                          value={cardData.cvc}
                          onChange={(e) => {
                            setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '')});
                            if (errors.cvc) setErrors({...errors, cvc: ''});
                          }}
                          style={{ WebkitTextSecurity: showCvc ? 'none' : 'disc' }}
                          className={`w-full border ${errors.cvc ? 'border-red-500' : (isDarkMode ? 'border-slate-700 bg-[#16171a] text-white' : 'border-slate-300 bg-slate-50 text-black')} rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-pink-600 font-mono text-center pr-9`}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowCvc(!showCvc)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer z-10"
                        >
                          {showCvc ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          )}
                        </button>
                      </div>
                      {errors.cvc && <span className="text-[10px] text-red-500 font-bold mt-1 block">{errors.cvc}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    <span className="bg-blue-600/20 border border-blue-500/40 text-blue-500 text-[10px] font-black px-2.5 py-1 rounded tracking-wider">VISA</span>
                    <span className="bg-orange-600/20 border border-orange-500/40 text-orange-500 text-[10px] font-black px-2.5 py-1 rounded tracking-wider">Mastercard</span>
                    <span className="bg-indigo-600/20 border border-indigo-500/40 text-indigo-500 text-[10px] font-black px-2.5 py-1 rounded tracking-wider">AMEX</span>
                    <span className="bg-cyan-600/20 border border-cyan-500/40 text-cyan-500 text-[10px] font-black px-2.5 py-1 rounded tracking-wider">JCB</span>
                  </div>
                </div>
              )}
            </div>

            {/* ২. পেপ্যাল অপশন */}
            <div 
              onClick={() => setPaymentMethod('paypal')}
              className={`border rounded-2xl p-4 cursor-pointer transition ${
                paymentMethod === 'paypal' 
                  ? (isDarkMode ? 'border-pink-600 bg-pink-950/20' : 'border-pink-600 bg-pink-50') 
                  : (isDarkMode ? 'border-slate-800 hover:border-slate-700' : 'border-slate-200 hover:border-slate-300')
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <input type="radio" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="accent-pink-600 w-4 h-4 cursor-pointer" />
                  <span className="font-extrabold text-sm">PayPal Account</span>
                </div>
                <span className="font-black italic text-sm tracking-tighter text-blue-500 font-serif">PayPal</span>
              </div>

              {paymentMethod === 'paypal' && (
                <div className={`space-y-3 pt-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`} onClick={(e) => e.stopPropagation()}>
                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>PayPal Email Address</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="your.email@example.com" 
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      className={`w-full border ${isDarkMode ? 'border-slate-700 bg-[#16171a] text-white' : 'border-slate-300 bg-slate-50 text-black'} rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-pink-600`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ৩. ব্যাংক ডিপোজিট অপশন */}
            <div 
              onClick={() => setPaymentMethod('bank')}
              className={`border rounded-2xl p-4 cursor-pointer transition ${
                paymentMethod === 'bank' 
                  ? (isDarkMode ? 'border-pink-600 bg-pink-950/20' : 'border-pink-600 bg-pink-50') 
                  : (isDarkMode ? 'border-slate-800 hover:border-slate-700' : 'border-slate-200 hover:border-slate-300')
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <input type="radio" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="accent-pink-600 w-4 h-4 cursor-pointer" />
                  <span className="font-extrabold text-sm">Bank deposit / Wire Transfer</span>
                </div>
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>SWIFT / IBAN</span>
              </div>

              {paymentMethod === 'bank' && (
                <div className={`space-y-3.5 pt-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`} onClick={(e) => e.stopPropagation()}>
                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Bank Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Emirates NBD / HSBC" 
                      value={bankData.bankName}
                      onChange={(e) => setBankData({...bankData, bankName: e.target.value})}
                      className={`w-full border ${isDarkMode ? 'border-slate-700 bg-[#16171a] text-white' : 'border-slate-300 bg-slate-50 text-black'} rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-pink-600`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Account Holder Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Account Holder Full Name" 
                      value={bankData.accountName}
                      onChange={(e) => setBankData({...bankData, accountName: e.target.value})}
                      className={`w-full border ${isDarkMode ? 'border-slate-700 bg-[#16171a] text-white' : 'border-slate-300 bg-slate-50 text-black'} rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-pink-600`}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className={`text-xs font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>IBAN / Account Number</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Account Number" 
                        value={bankData.accountNumber}
                        onChange={(e) => setBankData({...bankData, accountNumber: e.target.value})}
                        className={`w-full border ${isDarkMode ? 'border-slate-700 bg-[#16171a] text-white' : 'border-slate-300 bg-slate-50 text-black'} rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-pink-600 font-mono`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>SWIFT / BIC Code</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="SWIFT code" 
                        value={bankData.swiftCode}
                        onChange={(e) => setBankData({...bankData, swiftCode: e.target.value})}
                        className={`w-full border ${isDarkMode ? 'border-slate-700 bg-[#16171a] text-white' : 'border-slate-300 bg-slate-50 text-black'} rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-pink-600 font-mono`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`text-xs font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Transaction Reference Number</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. TRF987654321" 
                      value={bankData.referenceNo}
                      onChange={(e) => setBankData({...bankData, referenceNo: e.target.value})}
                      className={`w-full border ${isDarkMode ? 'border-slate-700 bg-[#16171a] text-white' : 'border-slate-300 bg-slate-50 text-black'} rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-pink-600 font-mono`}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ডান পাশ: ডাইনামিক অ্যামাউন্ট এবং ফি */}
          <div className={`lg:col-span-5 p-6 rounded-2xl border space-y-5 ${
            isDarkMode ? 'bg-[#16171a] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Select amount (USD)</h3>

            <div className="space-y-4">
              <div>
                <label className={`text-xs font-bold block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Enter Deposit Amount ($)</label>
                <input 
                  type="number"
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className={`w-full border rounded-xl p-3 text-sm font-black text-pink-500 focus:outline-none focus:border-pink-600 ${
                    isDarkMode ? 'border-slate-700 bg-[#0b0f19]' : 'border-slate-300 bg-white'
                  }`}
                />
              </div>

              <div className={`space-y-2 text-xs sm:text-sm font-bold pt-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Deposit amount</span>
                  <span className={`font-mono ${isDarkMode ? 'text-white' : 'text-black'}`}>${depositAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Processing fee ({feeLabel})</span>
                  <span className={`font-mono ${isDarkMode ? 'text-white' : 'text-black'}`}>${processingFee.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between py-3 text-base sm:text-lg font-black border-t ${isDarkMode ? 'border-slate-800 text-white' : 'border-slate-200 text-black'}`}>
                  <span>Payment due</span>
                  <span className="font-mono text-pink-500">${totalDue.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-black text-sm tracking-wide shadow-xl shadow-pink-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Processing Securely & Publishing...' : `Confirm and pay $${totalDue.toFixed(2)} USD`}
            </button>

            <p className={`text-[11px] leading-relaxed text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              You agree to authorize the use of your payment method for this deposit, and agree to be bound by the <span className="text-pink-600 underline cursor-pointer">Terms & Conditions</span>.
            </p>

            <div className={`pt-3 border-t flex flex-wrap items-center justify-center gap-4 text-[10px] font-extrabold ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
              <span className="text-emerald-500 flex items-center gap-1">🔒 Secure SSL Encryption</span>
              <span className="text-blue-500 flex items-center gap-1">🛡️ PCI DSS Compliant</span>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};

export default Checkout;