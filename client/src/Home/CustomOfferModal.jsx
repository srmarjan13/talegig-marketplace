import React, { useState } from 'react';
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

export default function CustomOfferModal({ isOpen, onClose, targetName, senderRole, onOfferCreated }) {
  const [offerTitle, setOfferTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('3');
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!offerTitle.trim() || !price) {
      showToast('Please fill in the offer title and price!','error');
      return;
    }

    const rawPrice = Number(price);
    const dynamicFees = calculateDynamicEarnings(rawPrice);

    const newCustomOffer = {
      id: Date.now(),
      title: offerTitle,
      description,
      price: rawPrice,
      buyerPaidTotal: dynamicFees.totalPaidByBuyer,
      buyerServiceFee: dynamicFees.buyerServiceFee,
      sellerNetEarnings: dynamicFees.sellerNetEarnings,
      adminRevenue: dynamicFees.totalAdminRevenue,
      deliveryDays: Number(deliveryDays),
      targetUser: targetName || 'User',
      senderRole: senderRole || 'seller', // 'seller' অথবা 'buyer'
      status: 'Pending',
      createdAt: new Date().toLocaleDateString()
    };

    if (onOfferCreated) {
      onOfferCreated(newCustomOffer);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl text-slate-900 dark:text-white">
        
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-black text-lg">Send Custom Offer ({senderRole === 'seller' ? 'To Buyer' : 'To Seller'})</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 font-bold text-lg cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">Offer Title / Service</label>
            <input 
              type="text" 
              required
              value={offerTitle}
              onChange={(e) => setOfferTitle(e.target.value)}
              placeholder="e.g. Extra UI Screens & Design"
              className="w-full p-3.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl font-bold outline-none"
            />
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">Description & Scope</label>
            <textarea 
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is included in this offer..."
              className="w-full p-3.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl outline-none resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">Price ($ USD)</label>
              <input 
                type="number" 
                required
                min="5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150"
                className="w-full p-3.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl font-bold font-mono outline-none"
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">Delivery (Days)</label>
              <input 
                type="number" 
                required
                min="1"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                placeholder="3"
                className="w-full p-3.5 bg-slate-50 dark:bg-[#0b0f19] border border-slate-300 dark:border-slate-700 rounded-xl font-bold font-mono outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold cursor-pointer">Cancel</button>
            <button type="submit" className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold shadow-md cursor-pointer">Send Offer</button>
          </div>
        </form>

      </div>
    </div>
  );
}