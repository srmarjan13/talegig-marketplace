import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';

// ==========================================
// 🟢 গ্লোবাল হেল্পার: বায়ার ও সেলারের আলাদা কমিশন সহ হিসাব করার জন্য
// ==========================================
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

// ==========================================
// ১. Commission Tab Component
// ==========================================
export function CommissionTab({ settings, setSettings, onSave }) {
  const sampleAmount = 500; 
  const sellerRate = Number(settings.sellerCommissionRate) || 10;
  const buyerRate = Number(settings.buyerFeeRate) || 5;

  const buyerFeeAmt = sampleAmount * (buyerRate / 100);
  const totalBuyerPay = sampleAmount + buyerFeeAmt;

  const sellerCommAmt = sampleAmount * (sellerRate / 100);
  const sellerReceives = sampleAmount - sellerCommAmt;

  const totalPlatformEarn = buyerFeeAmt + sellerCommAmt;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-black text-white">Commission & Service Fee Configuration</h3>
        <p className="text-xs text-slate-400 mt-0.5">Configure separate commission deductions for freelancers and service fees for buyers.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Freelancer / Seller Commission (%)</label>
          <input 
            type="number" 
            value={settings.sellerCommissionRate}
            onChange={(e) => setSettings({ ...settings, sellerCommissionRate: e.target.value })}
            className="w-full p-3.5 bg-[#0b0f19] border border-slate-800 rounded-xl text-xs font-bold font-mono outline-none focus:border-blue-500 text-white" 
            placeholder="10" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Buyer Service Fee (%)</label>
          <input 
            type="number" 
            value={settings.buyerFeeRate}
            onChange={(e) => setSettings({ ...settings, buyerFeeRate: e.target.value })}
            className="w-full p-3.5 bg-[#0b0f19] border border-slate-800 rounded-xl text-xs font-bold font-mono outline-none focus:border-blue-500 text-white" 
            placeholder="5" 
          />
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-2">
          <span className="text-xs font-black text-blue-400 uppercase tracking-wider block">Live Calculation Preview ($500 Project)</span>
          <p className="text-xs text-slate-300">Buyer Pays Total: <strong className="font-mono text-purple-400">${totalBuyerPay.toFixed(2)}</strong></p>
          <p className="text-xs text-slate-300">Freelancer Net Earning: <strong className="font-mono text-blue-400">${sellerReceives.toFixed(2)}</strong></p>
          <p className="text-xs text-slate-300 pt-1 border-t border-blue-500/20">Total Platform Revenue: <strong className="font-mono text-emerald-400">${totalPlatformEarn.toFixed(2)}</strong></p>
        </div>
      </div>

      <div className="pt-2">
        <button 
          type="button" 
          onClick={() => onSave('commission')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-lg shadow-blue-600/20"
        >
          Save Commission Settings
        </button>
      </div>
    </div>
  );
}

// ==========================================
// ২. Payout Tab Component
// ==========================================
export function PayoutTab({ settings, setSettings, onSave }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-black text-white">Withdrawal & Escrow Holding Rules</h3>
        <p className="text-xs text-slate-400 mt-0.5">Define minimum payout thresholds and escrow holding safety periods.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Minimum Withdrawal Limit ($)</label>
          <input 
            type="number" 
            value={settings.minWithdrawal}
            onChange={(e) => setSettings({ ...settings, minWithdrawal: e.target.value })}
            className="w-full p-3.5 bg-[#0b0f19] border border-slate-800 rounded-xl text-xs font-bold font-mono outline-none focus:border-blue-500 text-white" 
            placeholder="50" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Escrow Holding Period (Days)</label>
          <input 
            type="number" 
            value={settings.escrowHoldingDays}
            onChange={(e) => setSettings({ ...settings, escrowHoldingDays: e.target.value })}
            className="w-full p-3.5 bg-[#0b0f19] border border-slate-800 rounded-xl text-xs font-bold font-mono outline-none focus:border-blue-500 text-white" 
            placeholder="5" 
          />
        </div>
      </div>

      <div className="pt-2">
        <button 
          type="button" 
          onClick={() => onSave('payout')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-lg shadow-blue-600/20"
        >
          Save Payout Settings
        </button>
      </div>
    </div>
  );
}

// ==========================================
// ৩. Verification Tab Component
// ==========================================
export function VerificationTab({ settings, setSettings, onSave }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-black text-white">Security & Upload Policies</h3>
        <p className="text-xs text-slate-400 mt-0.5">Manage identity requirements and attachment constraints.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[#0b0f19] border border-slate-800 rounded-2xl">
          <div>
            <span className="font-extrabold text-xs block text-white">Require ID Verification for Payouts</span>
            <span className="text-[11px] text-slate-400">Freelancers must verify government ID before withdrawing.</span>
          </div>
          <input 
            type="checkbox" 
            checked={settings.idVerificationRequired}
            onChange={(e) => setSettings({ ...settings, idVerificationRequired: e.target.checked })}
            className="w-5 h-5 accent-blue-600 cursor-pointer" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Max File Upload Size (MB)</label>
          <input 
            type="number" 
            value={settings.maxUploadSizeMB}
            onChange={(e) => setSettings({ ...settings, maxUploadSizeMB: e.target.value })}
            className="w-full p-3.5 bg-[#0b0f19] border border-slate-800 rounded-xl text-xs font-bold font-mono outline-none focus:border-blue-500 text-white" 
            placeholder="25" 
          />
        </div>
      </div>

      <div className="pt-2">
        <button 
          type="button" 
          onClick={() => onSave('verification')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-lg shadow-blue-600/20"
        >
          Save Security Settings
        </button>
      </div>
    </div>
  );
}

// ==========================================
// ৪. Rules Tab Component
// ==========================================
export function RulesTab({ settings, setSettings, onSave }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-black text-white">Marketplace Rules & Terms</h3>
        <p className="text-xs text-slate-400 mt-0.5">Define global terms of service and marketplace guidelines.</p>
      </div>

      <div className="space-y-4">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Terms & Guidelines</label>
        <textarea 
          rows="8"
          value={settings.platformRules}
          onChange={(e) => setSettings({ ...settings, platformRules: e.target.value })}
          className="w-full p-4 bg-[#0b0f19] border border-slate-800 rounded-2xl text-xs font-normal text-white outline-none leading-relaxed focus:border-blue-500" 
          placeholder="Enter marketplace rules..."
        ></textarea>
      </div>

      <div className="pt-2">
        <button 
          type="button" 
          onClick={() => onSave('rules')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-lg shadow-blue-600/20"
        >
          Save Rules & Regulations
        </button>
      </div>
    </div>
  );
}

// ==========================================
// ৫. Marketplace Pages Tab (Columns + Links + Social Icons Only)
// ==========================================
export function PagesTab({ settings, setSettings, onSave }) {

  const handleAddColumn = () => {
    const newColKey = 'col_' + Date.now();
    const updatedColumns = [...(settings.footerColumns || []), { key: newColKey, title: 'New Category', links: [] }];
    setSettings({ ...settings, footerColumns: updatedColumns });
  };

  const handleRemoveColumn = (colKey) => {
    setSettings({ ...settings, footerColumns: settings.footerColumns.filter(c => c.key !== colKey) });
  };

  const handleColumnTitleChange = (colKey, newTitle) => {
    const updatedColumns = settings.footerColumns.map(col => col.key === colKey ? { ...col, title: newTitle } : col);
    setSettings({ ...settings, footerColumns: updatedColumns });
  };

  const handleAddLink = (colKey) => {
    const updatedColumns = settings.footerColumns.map(col => 
      col.key === colKey ? { ...col, links: [...col.links, { id: Date.now(), label: 'New Link', url: '/' }] } : col
    );
    setSettings({ ...settings, footerColumns: updatedColumns });
  };

  const handleRemoveLink = (colKey, linkId) => {
    const updatedColumns = settings.footerColumns.map(col => 
      col.key === colKey ? { ...col, links: col.links.filter(l => l.id !== linkId) } : col
    );
    setSettings({ ...settings, footerColumns: updatedColumns });
  };

  const handleLinkChange = (colKey, linkId, field, value) => {
    const updatedColumns = settings.footerColumns.map(col => {
      if (col.key === colKey) {
        return { ...col, links: col.links.map(l => l.id === linkId ? { ...l, [field]: value } : l) };
      }
      return col;
    });
    setSettings({ ...settings, footerColumns: updatedColumns });
  };

  const handleAddContact = () => {
    const updatedContacts = [...(settings.footerContacts || []), { id: Date.now(), platform: 'Gmail', value: '' }];
    setSettings({ ...settings, footerContacts: updatedContacts });
  };

  const handleRemoveContact = (id) => {
    const updatedContacts = (settings.footerContacts || []).filter(c => c.id !== id);
    setSettings({ ...settings, footerContacts: updatedContacts });
  };

  const handleContactChange = (id, field, value) => {
    const updatedContacts = (settings.footerContacts || []).map(c => c.id === id ? { ...c, [field]: value } : c);
    setSettings({ ...settings, footerContacts: updatedContacts });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-base font-bold text-white">Footer Management Control</h3>
        <p className="text-xs text-slate-400 mt-0.5">Manage footer navigation columns, sub-links, and social/contact icons.</p>
      </div>

      {/* কলাম এবং লিংক কন্ট্রোল */}
      <div className="space-y-4 bg-[#0b0f19] p-4 rounded-2xl border border-slate-800">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Footer Navigation Columns</label>
          <button type="button" onClick={handleAddColumn} className="bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-lg text-white transition flex items-center gap-1 cursor-pointer">
            <FaPlus /> ADD COLUMN
          </button>
        </div>

        {settings.footerColumns?.map((col) => (
          <div key={col.key} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex gap-2 items-center">
              <input value={col.title} onChange={(e) => handleColumnTitleChange(col.key, e.target.value)} className="flex-1 p-2 bg-[#0b0f19] border border-slate-700 rounded-lg text-xs font-bold text-white outline-none" placeholder="Column Title" />
              <button type="button" onClick={() => handleAddLink(col.key)} className="bg-blue-600/20 text-blue-400 px-2.5 py-2 rounded-lg text-[10px] font-bold cursor-pointer">+ Add Link</button>
              <button type="button" onClick={() => handleRemoveColumn(col.key)} className="bg-red-500/10 text-red-400 p-2 rounded-lg text-xs cursor-pointer"><FaTrash size={12}/></button>
            </div>
            {col.links.map(link => (
              <div key={link.id} className="flex gap-2 items-center pl-3">
                <input value={link.label} onChange={(e) => handleLinkChange(col.key, link.id, 'label', e.target.value)} className="flex-1 p-1.5 bg-[#0b0f19] border border-slate-700 rounded-md text-[11px] text-white outline-none" placeholder="Link Name (e.g. Explore Gigs)" />
                <input value={link.url} onChange={(e) => handleLinkChange(col.key, link.id, 'url', e.target.value)} className="flex-1 p-1.5 bg-[#0b0f19] border border-slate-700 rounded-md text-[11px] font-mono text-white outline-none" placeholder="URL (e.g. /gigs)" />
                <button onClick={() => handleRemoveLink(col.key, link.id)} className="text-red-400 p-1 cursor-pointer"><FaTrash size={10}/></button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* সোশ্যাল ও কন্টাক্ট আইকন ম্যানেজার */}
      <div className="bg-[#0b0f19] p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Social & Contact Icons</label>
          <button type="button" onClick={handleAddContact} className="bg-emerald-600 text-[10px] font-bold px-3 py-1.5 rounded-lg text-white cursor-pointer">+ ADD ICON</button>
        </div>
        {settings.footerContacts?.map((c) => (
          <div key={c.id} className="flex gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 items-center">
            <select value={c.platform} onChange={(e) => handleContactChange(c.id, 'platform', e.target.value)} className="w-28 bg-[#0b0f19] text-[11px] p-2 rounded-lg text-white border border-slate-700 outline-none">
              <option value="Gmail">Gmail</option><option value="Facebook">Facebook</option><option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option><option value="Twitter">Twitter</option><option value="LinkedIn">LinkedIn</option>
            </select>
            <input value={c.value} onChange={(e) => handleContactChange(c.id, 'value', e.target.value)} className="flex-1 bg-[#0b0f19] border border-slate-700 p-2 rounded-lg text-[11px] text-white outline-none font-mono" placeholder="URL or Email (e.g. info@talegig.com)" />
            <button onClick={() => handleRemoveContact(c.id)} className="text-red-400 p-2 cursor-pointer"><FaTrash size={12}/></button>
          </div>
        ))}
      </div>

      <button type="button" onClick={() => onSave('pages')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md">
        Save Changes
      </button>
    </div>
  );
}

// ==========================================
// মূল Controller Component (MarketplaceSettings)
// ==========================================
export default function MarketplaceSettings() {
  const [activeTab, setActiveTab] = useState('commission');
  const tabs = ['commission', 'payout', 'verification', 'rules', 'pages'];

  const [settings, setSettings] = useState({
    sellerCommissionRate: 10,
    buyerFeeRate: 5,
    minWithdrawal: 50,
    escrowHoldingDays: 5,
    maxUploadSizeMB: 25,
    idVerificationRequired: true,
    platformRules: '1. Sellers must complete projects within the agreed timeframe.\n2. Funds remain in escrow during the holding period.\n3. Platform automatically deducts commission upon successful release.',
    pages: {
      terms: { title: 'Terms & Conditions', content: 'Welcome to TaleGig. Please read these terms carefully before using our platform.', contacts: [] },
      about: { title: 'About Us', content: 'TaleGig is a premier worldwide freelancer marketplace connecting top talent with global clients.', contacts: [] },
      privacy: { title: 'Privacy Policy', content: 'Your privacy is important to us. This policy outlines how we collect and protect your data.', contacts: [] }
    }
  });

  // লোকালস্টোরেজ থেকে রিয়েল-টাইম সেটিংস লোড করা
  useEffect(() => {
    try {
      const savedSellerComm = localStorage.getItem('talegig_seller_commission_rate');
      const savedBuyerFee = localStorage.getItem('talegig_buyer_fee_rate');
      const savedMinWith = localStorage.getItem('talegig_min_withdrawal');
      const savedHold = localStorage.getItem('talegig_holding_days');
      const savedUpload = localStorage.getItem('talegig_max_upload');
      
      let verifyVal = true;
      const savedVerify = localStorage.getItem('talegig_id_verification');
      if (savedVerify !== null) {
        if (savedVerify === 'false') verifyVal = false;
        else if (savedVerify === 'true') verifyVal = true;
        else {
          try {
            const parsedObj = JSON.parse(savedVerify);
            verifyVal = parsedObj.verifiedStatus === 'Verified' || Boolean(parsedObj.submitted);
          } catch (err) {
            verifyVal = true;
          }
        }
      }

      const savedRules = localStorage.getItem('talegig_platform_rules');
      const savedPages = localStorage.getItem('talegig_marketplace_pages');
      let parsedPages = null;
      if (savedPages) {
        try {
          parsedPages = JSON.parse(savedPages);
        } catch (e) {}
      }

      setSettings(prev => ({
        ...prev,
        sellerCommissionRate: savedSellerComm ? Number(savedSellerComm) : prev.sellerCommissionRate,
        buyerFeeRate: savedBuyerFee ? Number(savedBuyerFee) : prev.buyerFeeRate,
        minWithdrawal: savedMinWith ? Number(savedMinWith) : prev.minWithdrawal,
        escrowHoldingDays: savedHold ? Number(savedHold) : prev.escrowHoldingDays,
        maxUploadSizeMB: savedUpload ? Number(savedUpload) : prev.maxUploadSizeMB,
        idVerificationRequired: verifyVal,
        platformRules: savedRules ? savedRules : prev.platformRules,
        pages: parsedPages ? parsedPages : prev.pages
      }));
    } catch (e) {
      console.error(e);
    }
  }, []);

const handleSave = (tabName) => {
    try {
      // সব সেটিংস এবং ডাইনামিক ফুটার কলামগুলো লোকালস্টোরেজে পার্মানেন্ট সেভ করা
      localStorage.setItem('talegig_seller_commission_rate', settings.sellerCommissionRate);
      localStorage.setItem('talegig_buyer_fee_rate', settings.buyerFeeRate);
      localStorage.setItem('talegig_min_withdrawal', settings.minWithdrawal);
      localStorage.setItem('talegig_holding_days', settings.escrowHoldingDays);
      localStorage.setItem('talegig_max_upload', settings.maxUploadSizeMB);
      localStorage.setItem('talegig_id_verification', settings.idVerificationRequired);
      localStorage.setItem('talegig_platform_rules', settings.platformRules);
      
      // ডাইনামিক পেজ এবং কলাম ডেটা একসাথে সেভ
      const marketplaceData = {
        pages: settings.pages,
        footerColumns: settings.footerColumns
      };
      localStorage.setItem('talegig_marketplace_pages', JSON.stringify(marketplaceData));

      // গ্লোবাল ইভেন্ট ট্রিগার যাতে ফুটার ইনস্ট্যান্ট আপডেট হয়
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('talegig_settings_updated'));

      alert(`✅ Marketplace settings (${tabName.toUpperCase()}) updated successfully!`);
    } catch (e) {
      console.error(e);
      alert('❌ Failed to save settings.');
    }
  };

  return (
    <PageLayout title="Marketplace Control Center">
      <div className="w-full bg-[#16171a] p-4 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl text-white space-y-6">
        
        <div>
          <h2 className="text-2xl font-black tracking-wide">Marketplace Settings</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage global fees, payout limits, security protocols, and operational rules.</p>
        </div>

        {/* টপ ট্যাব সুইচিং বার (প্রিমিয়াম গ্লাস লুক) */}
        <div className="flex gap-2 bg-[#0b0f19] p-2 rounded-2xl w-fit border border-slate-800 overflow-x-auto max-w-full shadow-inner">
          {tabs.map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`px-4 sm:px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all capitalize whitespace-nowrap cursor-pointer ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab === 'pages' ? 'Marketplace Pages' : tab}
            </button>
          ))}
        </div>

        {/* ট্যাবের ভিত্তিতে নির্দিষ্ট কম্পোনেন্ট রেন্ডারিং */}
        <div className="max-w-4xl pt-2">
          {activeTab === 'commission' && (
            <CommissionTab settings={settings} setSettings={setSettings} onSave={handleSave} />
          )}

          {activeTab === 'payout' && (
            <PayoutTab settings={settings} setSettings={setSettings} onSave={handleSave} />
          )}

          {activeTab === 'verification' && (
            <VerificationTab settings={settings} setSettings={setSettings} onSave={handleSave} />
          )}

          {activeTab === 'rules' && (
            <RulesTab settings={settings} setSettings={setSettings} onSave={handleSave} />
          )}

          {activeTab === 'pages' && (
            <PagesTab settings={settings} setSettings={setSettings} onSave={handleSave} />
          )}
        </div>

      </div>
    </PageLayout>
  );
}