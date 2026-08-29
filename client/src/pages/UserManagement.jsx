// client/src/pages/UserManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../components/PageLayout';

// ==========================================
// ১. Stat Cards Component
// ==========================================
const StatCardsSection = ({ userList }) => {
  const stats = [
    { title: 'Total Users', value: userList.length }, 
    { title: 'Active Today', value: userList.filter(u => u.status === 'Active').length }, 
    { title: 'Pending Verification', value: userList.filter(u => u.verificationStatus === 'Pending' || u.verificationStatus === 'Pending Review' || u.kyc?.submitted === true).length } 
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-sm dark:shadow-lg backdrop-blur-md">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// ২. Search and Export Bar Component
// ==========================================
const SearchBarSection = ({ searchTerm, setSearchTerm, onExport }) => (
  <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
    <input 
      type="text" 
      placeholder="Search by name or email..." 
      className="p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1a202c] text-gray-900 dark:text-white w-full md:w-72 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <button 
      onClick={onExport}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition cursor-pointer shadow-lg shadow-blue-600/20"
    >
      Export CSV
    </button>
  </div>
);

// ==========================================
// ৩. Seller Users Tab Component
// ==========================================
const SellerUsersTab = ({ users, activeMenuId, setActiveMenuId, handleAction }) => (
  <div className="bg-white dark:bg-[#16171a] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-visible">
    <table className="w-full text-left">
      <thead className="bg-gray-50 dark:bg-[#111318] text-gray-400 border-b border-gray-200 dark:border-slate-800">
        <tr>
          <th className="p-5 text-xs uppercase font-extrabold tracking-wider">Name</th>
          <th className="p-5 text-xs uppercase font-extrabold tracking-wider">Email</th>
          <th className="p-5 text-xs uppercase font-extrabold tracking-wider">Status</th>
          <th className="p-5 text-xs uppercase font-extrabold tracking-wider text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
        {users.length === 0 ? (
          <tr>
            <td colSpan="4" className="p-8 text-center text-gray-400 text-sm italic">No sellers found.</td>
          </tr>
        ) : (
          users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition relative">
              <td className="p-5 font-bold text-gray-900 dark:text-white">{user.name}</td>
              <td className="p-5 text-gray-500 dark:text-gray-400 font-mono text-xs">{user.email || 'N/A'}</td>
              <td className="p-5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {user.status}
                </span>
              </td>
              <td className="p-5 text-center relative action-menu-container">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === user.id ? null : user.id); }}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer shadow-sm"
                >
                  Actions ▾
                </button>
                {activeMenuId === user.id && (
                  <div className="absolute right-10 bottom-full mb-2 w-48 bg-white dark:bg-[#16171a] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-1.5 text-left">
                    <button onClick={() => { handleAction('view', user); setActiveMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-gray-800 dark:text-white">View Profile & ID</button>
                    {user.status === 'Active' ? (
                      <>
                        <button onClick={() => { handleAction('suspend', user); setActiveMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer font-bold">Suspend User</button>
                        <button onClick={() => { handleAction('custom_suspend', user); setActiveMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs text-amber-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer font-bold">Custom Suspend</button>
                      </>
                    ) : (
                      <button onClick={() => { handleAction('activate', user); setActiveMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs text-emerald-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer font-bold">Re-activate</button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

// ==========================================
// ৪. Buyer Users Tab Component
// ==========================================
const BuyerUsersTab = ({ users, activeMenuId, setActiveMenuId, handleAction }) => (
  <div className="bg-white dark:bg-[#16171a] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-visible">
    <table className="w-full text-left">
      <thead className="bg-gray-50 dark:bg-[#111318] text-gray-400 border-b border-gray-200 dark:border-slate-800">
        <tr>
          <th className="p-5 text-xs uppercase font-extrabold tracking-wider">Name</th>
          <th className="p-5 text-xs uppercase font-extrabold tracking-wider">Email</th>
          <th className="p-5 text-xs uppercase font-extrabold tracking-wider">Status</th>
          <th className="p-5 text-xs uppercase font-extrabold tracking-wider text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
        {users.length === 0 ? (
          <tr>
            <td colSpan="4" className="p-8 text-center text-gray-400 text-sm italic">No buyers found.</td>
          </tr>
        ) : (
          users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition relative">
              <td className="p-5 font-bold text-gray-900 dark:text-white">{user.name}</td>
              <td className="p-5 text-gray-500 dark:text-gray-400 font-mono text-xs">{user.email || 'N/A'}</td>
              <td className="p-5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {user.status}
                </span>
              </td>
              <td className="p-5 text-center relative action-menu-container">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === user.id ? null : user.id); }}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer shadow-sm"
                >
                  Actions ▾
                </button>
                {activeMenuId === user.id && (
                  <div className="absolute right-10 bottom-full mb-2 w-48 bg-white dark:bg-[#16171a] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-1.5 text-left">
                    <button onClick={() => { handleAction('view', user); setActiveMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-gray-800 dark:text-white">View Profile & ID</button>
                    {user.status === 'Active' ? (
                      <>
                        <button onClick={() => { handleAction('suspend', user); setActiveMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer font-bold">Suspend User</button>
                        <button onClick={() => { handleAction('custom_suspend', user); setActiveMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs text-amber-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer font-bold">Custom Suspend</button>
                      </>
                    ) : (
                      <button onClick={() => { handleAction('activate', user); setActiveMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs text-emerald-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer font-bold">Re-activate</button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

// ==========================================
// ৫. Pending Verification Tab Component
// ==========================================
const PendingVerificationTab = ({ users, activeMenuId, setActiveMenuId, handleAction }) => (
  <div className="bg-white dark:bg-[#16171a] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-visible">
    <table className="w-full text-left">
      <thead className="bg-gray-50 dark:bg-[#111318] text-gray-400 border-b border-gray-200 dark:border-slate-800">
        <tr>
          <th className="p-5 text-xs uppercase font-extrabold tracking-wider">Name</th>
          <th className="p-5 text-xs uppercase font-extrabold tracking-wider">Email</th>
          <th className="p-5 text-xs uppercase font-extrabold tracking-wider">KYC Status</th>
          <th className="p-5 text-xs uppercase font-extrabold tracking-wider text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
        {users.length === 0 ? (
          <tr>
            <td colSpan="4" className="p-8 text-center text-gray-400 text-sm italic">No pending verifications found.</td>
          </tr>
        ) : (
          users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition relative">
              <td className="p-5 font-bold text-gray-900 dark:text-white">{user.name}</td>
              <td className="p-5 text-gray-500 dark:text-gray-400 font-mono text-xs">{user.email || 'N/A'}</td>
              <td className="p-5">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {user.verificationStatus || 'Pending'}
                </span>
              </td>
              <td className="p-5 text-center relative action-menu-container">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === user.id ? null : user.id); }}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer shadow-sm"
                >
                  Actions ▾
                </button>
                {activeMenuId === user.id && (
                  <div className="absolute right-10 bottom-full mb-2 w-48 bg-white dark:bg-[#16171a] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-1.5 text-left">
                    <button onClick={() => { handleAction('view', user); setActiveMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-gray-800 dark:text-white">View Profile & ID</button>
                    <button onClick={() => { handleAction('approve_verification', user); setActiveMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs text-emerald-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer font-extrabold">Approve ID</button>
                    <button onClick={() => { handleAction('reject_verification', user); setActiveMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer font-extrabold">Reject ID</button>
                  </div>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

// ==========================================
// ৬. User Profile Drawer Component
// ==========================================
const UserProfileDrawer = ({ selectedUser, onClose, onPreviewImage }) => {
  if (!selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end">
      <div className="w-full max-w-lg bg-white dark:bg-[#16171a] h-full shadow-2xl p-6 overflow-y-auto text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-black">User Profile & Verification</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-base font-bold cursor-pointer">✕</button>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-2xl flex items-center justify-center font-black text-xl">
              {selectedUser?.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-black text-base">{selectedUser?.name}</h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedUser?.email || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Role / Type', value: selectedUser?.type },
              { label: 'Status', value: selectedUser?.status },
              { label: 'KYC Status', value: selectedUser?.verificationStatus },
              { label: 'Joined', value: selectedUser?.joined }
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-[#111318] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-gray-400 uppercase font-extrabold">{item.label}</p>
                <p className="font-bold text-xs mt-1">{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <button 
              onClick={() => {
                onClose();
                window.location.href = `/profile`;
              }} 
              className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-extrabold text-xs transition cursor-pointer shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2"
            >
              <span>View Full Profile</span>
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-[#111318] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Submitted KYC Document</h4>
              {selectedUser?.kyc?.documentImage && (
                <a 
                  href={selectedUser.kyc.documentImage} 
                  download={selectedUser.kyc.fileName || 'ID_Document'}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-extrabold transition flex items-center gap-1 shadow cursor-pointer"
                >
                  <span>Download ID</span>
                </a>
              )}
            </div>

            <div className="text-xs space-y-1 font-medium bg-white dark:bg-[#16171a] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <p><span className="text-slate-400">Document Type:</span> <strong className="text-blue-500">{selectedUser?.kyc?.idType || 'N/A'}</strong></p>
              <p><span className="text-slate-400">ID / Passport No:</span> <strong className="font-mono text-emerald-500">{selectedUser?.kyc?.idNumber || 'N/A'}</strong></p>
            </div>

            <div>
              <p className="text-[10px] text-slate-400 uppercase font-extrabold mb-2">Document Preview (Click to View Larger):</p>
              {selectedUser?.kyc?.documentImage ? (
                selectedUser?.kyc?.fileType === 'application/pdf' ? (
                  <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold border border-red-500/20 text-center flex flex-col items-center gap-2">
                    <span>{selectedUser?.kyc?.fileName || 'PDF Document Uploaded'}</span>
                    <a 
                      href={selectedUser.kyc.documentImage} 
                      download="ID_Document.pdf"
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                    >
                      Download PDF
                    </a>
                  </div>
                ) : (
                  <div className="relative group cursor-pointer" onClick={() => onPreviewImage(selectedUser.kyc.documentImage)}>
                    <img 
                      src={selectedUser?.kyc?.documentImage} 
                      alt="Submitted ID" 
                      className="w-full h-56 object-cover rounded-xl border border-slate-700 shadow-md transition group-hover:opacity-90" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center text-white font-bold text-xs">
                      Click to Enlarge
                    </div>
                  </div>
                )
              ) : (
                <p className="text-xs text-slate-400 italic p-4 text-center bg-white dark:bg-[#16171a] rounded-xl border border-slate-200 dark:border-slate-800">No document uploaded by user yet.</p>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="mt-8 w-full py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold text-xs transition cursor-pointer"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};

// ==========================================
// ৭. Main UserManagement Component
// ==========================================
export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('seller');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState(null);
  const [customDays, setCustomDays] = useState(3);
  const [showProfile, setShowProfile] = useState(false); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [activeMenuId, setActiveMenuId] = useState(null); 
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setActiveMenuId(null);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const [userList, setUserList] = useState(() => {
    try {
      const rawData = localStorage.getItem('user');
      const list = rawData ? (Array.isArray(JSON.parse(rawData)) ? JSON.parse(rawData) : [JSON.parse(rawData)]) : [];
      
      const kycData = JSON.parse(localStorage.getItem('talegig_id_verification') || '{}');
      const settingsData = JSON.parse(localStorage.getItem('talegig_user_settings') || '{}').idVerification || {};

      let uniqueUsersMap = new Map();

      list.forEach((u) => {
        if (u && typeof u === 'object') {
          const userName = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'User';
          const userEmail = u.email || 'N/A'; 
          const rawRole = (u.role || '').toLowerCase() === 'buyer' ? 'buyer' : 'seller';
          
          const uniqueKey = userEmail !== 'N/A' ? userEmail : (u.username || userName);

          if (userName && !uniqueUsersMap.has(uniqueKey)) {
            // 🟢 সাসপেনশন এক্সপায়ারি চেক লজিক (সময় শেষ হয়ে গেলে অটোভেক্টরি সক্রিয় করা)
            let isCurrentlySuspended = u.isSuspended || false;
            if (isCurrentlySuspended && u.suspendUntil) {
              if (new Date().getTime() > u.suspendUntil) {
                isCurrentlySuspended = false;
              }
            }

            let userStatus = isCurrentlySuspended ? (u.suspendReason || 'Suspended') : (u.status || 'Active');

            // 🟢 কেওয়াইসি স্ট্যাটাস ও সাবমিট ফ্ল্যাগ নিখুঁতভাবে চেক করার লজিক
            let verificationStatus = 'Not Submitted';
            const currentStatus = kycData.verifiedStatus || settingsData.verifiedStatus;
            const isSubmitted = kycData.submitted || settingsData.submitted || u.kycSubmitted;

            if (isSubmitted || currentStatus === 'Pending' || currentStatus === 'Pending Review') {
              verificationStatus = currentStatus === 'Rejected' ? 'Rejected' : 'Pending';
            } else if (currentStatus) {
              verificationStatus = currentStatus;
            }

            const kycDetails = {
              idType: kycData.idType || settingsData.idType || 'Not Selected',
              idNumber: kycData.idNumber || settingsData.idNumber || 'N/A',
              documentImage: kycData.documentImage || settingsData.documentImage || null,
              fileName: kycData.fileName || settingsData.fileName || null,
              fileType: kycData.fileType || settingsData.fileType || null,
              submitted: isSubmitted || false
            };

            uniqueUsersMap.set(uniqueKey, {
              id: u.id || uniqueKey,
              name: userName,
              email: userEmail,
              status: userStatus,
              verificationStatus: verificationStatus,
              kyc: kycDetails,
              type: rawRole, 
              projects: u.projects || 0,
              rating: u.rating || 5.0,
              joined: u.joinDate || u.joined || 'Recently',
              isSuspended: isCurrentlySuspended,
              restrictions: u.restrictions || {},
              suspendUntil: u.suspendUntil || null
            });
          }
        }
      });

      return Array.from(uniqueUsersMap.values());
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const kycData = JSON.parse(localStorage.getItem('talegig_id_verification') || '{}');
        const settingsData = JSON.parse(localStorage.getItem('talegig_user_settings') || '{}').idVerification || {};
        
        setUserList(prevList => 
          prevList.map(user => {
            const currentStatus = kycData.verifiedStatus || settingsData.verifiedStatus;
            const isSubmitted = kycData.submitted || settingsData.submitted;
            
            let newVerificationStatus = user.verificationStatus;
            if (isSubmitted || currentStatus === 'Pending' || currentStatus === 'Pending Review') {
              newVerificationStatus = 'Pending';
            } else if (currentStatus) {
              newVerificationStatus = currentStatus;
            }

            return {
              ...user,
              verificationStatus: newVerificationStatus,
              kyc: {
                ...user.kyc,
                submitted: isSubmitted || user.kyc.submitted,
                idType: kycData.idType || settingsData.idType || user.kyc.idType,
                idNumber: kycData.idNumber || settingsData.idNumber || user.kyc.idNumber,
                documentImage: kycData.documentImage || settingsData.documentImage || user.kyc.documentImage,
                fileName: kycData.fileName || settingsData.fileName || user.kyc.fileName,
                fileType: kycData.fileType || settingsData.fileType || user.kyc.fileType
              }
            };
          })
        );
      } catch (e) {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Status", "Type"];
    const csvContent = [
      headers.join(","),
      ...userList.map(u => [u.name, u.email, u.status, u.type].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'user_list.csv');
    a.click();
  };

  const handleAction = (action, user) => {
    if (action === 'view') {
      setSelectedUser(user);    
      setShowProfile(true);    
    } else if (action === 'suspend') {
      setUserToSuspend(user);
      setShowModal(true);
    } else if (action === 'custom_suspend') {
      setUserToSuspend(user);
      setShowCustomModal(true);
    } else if (action === 'activate' || action === 'unsuspend') {
      // 🟢 অ্যাডমিন ম্যানুয়ালি সাসপেনশন তুলে নেওয়ার হ্যান্ডলার
      setUserList(userList.map(u => u.id === user.id ? { ...u, status: 'Active', isSuspended: false, restrictions: {}, suspendUntil: null } : u));
      try {
        const activeUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (activeUser.email === user.email || activeUser.name === user.name) {
          activeUser.isSuspended = false;
          delete activeUser.suspendReason;
          delete activeUser.suspendUntil;
          activeUser.restrictions = {};
          localStorage.setItem('user', JSON.stringify(activeUser));
        }
      } catch (e) {}
      alert(`Suspension lifted successfully for ${user.name}.`);
    } else if (action === 'approve_verification') {
      setUserList(userList.map(u => u.id === user.id ? { ...u, verificationStatus: 'Verified' } : u));
      try {
        const kyc = JSON.parse(localStorage.getItem('talegig_id_verification') || '{}');
        kyc.verifiedStatus = 'Verified';
        kyc.submitted = false;
        localStorage.setItem('talegig_id_verification', JSON.stringify(kyc));

        const settings = JSON.parse(localStorage.getItem('talegig_user_settings') || '{}');
        if (!settings.idVerification) settings.idVerification = {};
        settings.idVerification.verifiedStatus = 'Verified';
        settings.idVerification.submitted = false;
        localStorage.setItem('talegig_user_settings', JSON.stringify(settings));

        window.dispatchEvent(new Event('storage'));
      } catch(e) {}
      alert(`Verification approved successfully for ${user.name}.`);
    } else if (action === 'reject_verification') {
      setUserList(userList.map(u => u.id === user.id ? { ...u, verificationStatus: 'Rejected' } : u));
      try {
        const kyc = JSON.parse(localStorage.getItem('talegig_id_verification') || '{}');
        kyc.verifiedStatus = 'Rejected';
        kyc.submitted = false;
        localStorage.setItem('talegig_id_verification', JSON.stringify(kyc));

        const settings = JSON.parse(localStorage.getItem('talegig_user_settings') || '{}');
        if (!settings.idVerification) settings.idVerification = {};
        settings.idVerification.verifiedStatus = 'Rejected';
        settings.idVerification.submitted = false;
        localStorage.setItem('talegig_user_settings', JSON.stringify(settings));

        window.dispatchEvent(new Event('storage'));
      } catch(e) {}
      alert(`Verification rejected for ${user.name}. User can now re-apply.`);
    }
  };

  // 🟢 আপডেট করা confirmSuspend ফাংশন (দিন বা এক্সপায়ারি টাইম হিসাব করে সেভ করার জন্য)
  const confirmSuspend = (reason = 'Suspended', restrictions = {}, days = 0) => {
    if (!userToSuspend) return;
    
    // বর্তমান সময়ের সাথে কাস্টম দিনগুলো যোগ করে এক্সপায়ারি ডেট (টাইমস্ট্যাম্প) হিসাব করা হলো
    const expiryTime = days > 0 ? new Date().getTime() + (days * 24 * 60 * 60 * 1000) : null;
    
    setUserList(userList.map(u => u.id === userToSuspend.id ? { 
      ...u, 
      status: reason, 
      isSuspended: true, 
      restrictions, 
      suspendUntil: expiryTime 
    } : u));
    
    try {
      const activeUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (activeUser.email === userToSuspend.email || activeUser.name === userToSuspend.name) {
        activeUser.isSuspended = true;
        activeUser.suspendReason = reason;
        activeUser.restrictions = restrictions;
        activeUser.suspendUntil = expiryTime;
        localStorage.setItem('user', JSON.stringify(activeUser));
      }
    } catch(e) {}

    setShowModal(false);
    setShowCustomModal(false);
    alert(`User ${userToSuspend.name} has been suspended successfully.`);
  };

  // 🟢 ট্যাব অনুযায়ী আলাদা আলাদা কম্পোনেন্টে ডেটা পাস করার ফিল্টারিং
  const sellerUsers = userList.filter(u => u.type === 'seller' && (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())));
  const buyerUsers = userList.filter(u => u.type === 'buyer' && (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())));
  
  const pendingUsers = userList.filter(u => 
    (u.verificationStatus === 'Pending' || u.verificationStatus === 'Pending Review' || u.kyc?.submitted === true) && 
    (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <PageLayout title="User Management">
      <StatCardsSection userList={userList} />

      <SearchBarSection 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        onExport={exportToCSV} 
      />

      {/* Tab Bar */}
      <div className="flex space-x-6 mb-6 border-b border-gray-200 dark:border-slate-800">
        {[
          { key: 'seller', label: 'Seller' },
          { key: 'buyer', label: 'Buyer' },
          { key: 'pending_verification', label: 'Pending Verification' }
        ].map((tab) => (
          <button 
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 font-extrabold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer ${activeTab === tab.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* আলাদা করা ট্যাব কম্পোনেন্ট রেন্ডারিং */}
      {activeTab === 'seller' && (
        <SellerUsersTab 
          users={sellerUsers} 
          activeMenuId={activeMenuId} 
          setActiveMenuId={setActiveMenuId} 
          handleAction={handleAction} 
        />
      )}

      {activeTab === 'buyer' && (
        <BuyerUsersTab 
          users={buyerUsers} 
          activeMenuId={activeMenuId} 
          setActiveMenuId={setActiveMenuId} 
          handleAction={handleAction} 
        />
      )}

      {activeTab === 'pending_verification' && (
        <PendingVerificationTab 
          users={pendingUsers} 
          activeMenuId={activeMenuId} 
          setActiveMenuId={setActiveMenuId} 
          handleAction={handleAction} 
        />
      )}

      {/* 🟢 পার্মানেন্ট সাসপেন্ড মডাল (Full Lockout) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#16171a] p-6 sm:p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Confirm Permanent Suspension</h3>
            <p className="text-xs text-gray-400">Are you sure you want to permanently suspend <strong className="text-white">{userToSuspend?.name}</strong>? This will block all user features and access.</p>
            <div className="flex space-x-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-slate-700 rounded-xl text-xs font-bold text-gray-300 cursor-pointer hover:bg-slate-800 transition">Cancel</button>
              <button 
                onClick={() => confirmSuspend('Permanently Suspended', { blockGigs: true, blockChat: true, blockProjects: true, hideProfile: true, blockWithdrawals: true }, 0)} 
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 cursor-pointer shadow-lg shadow-red-600/20 transition"
              >
                Confirm Permanent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 কাস্টম দিন ও নতুন রেস্ট্রিকশনসহ কাস্টম সাসপেন্ড মডাল */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#16171a] p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 space-y-5 text-slate-900 dark:text-white">
            <div>
              <h3 className="text-lg font-black">Custom Suspend: {userToSuspend?.name}</h3>
              <p className="text-xs text-gray-400 mt-1">Set the duration and restrict specific features for this user.</p>
            </div>

            {/* দিন ইনপুট সেকশন */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Suspension Duration (Days):</label>
              <input 
                type="number"
                min="1"
                className="w-full p-3 bg-slate-50 dark:bg-[#111318] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold font-mono outline-none focus:border-amber-500 text-white"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="e.g. 3"
              />
            </div>

            {/* কাস্টম রেস্ট্রিকশন চেকবাক্স অপশনস */}
            <div className="bg-slate-50 dark:bg-[#111318] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Restrict Specific Actions During Suspension:</p>
              
              <label className="flex items-center gap-3 text-xs font-bold cursor-pointer">
                <input 
                  type="checkbox" 
                  id="custom_restrict_gigs" 
                  defaultChecked 
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
                <span>Block New Gigs & Hide Gigs from Public Feed</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-bold cursor-pointer">
                <input 
                  type="checkbox" 
                  id="custom_restrict_chat" 
                  defaultChecked 
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
                <span>Block New Chat & Messaging (Running orders allowed)</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-bold cursor-pointer">
                <input 
                  type="checkbox" 
                  id="custom_restrict_projects" 
                  defaultChecked 
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
                <span>Block New Projects, Contests & Custom Offers</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-bold cursor-pointer">
                <input 
                  type="checkbox" 
                  id="custom_restrict_profile" 
                  defaultChecked 
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
                <span>Hide Profile from Public View</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-bold cursor-pointer">
                <input 
                  type="checkbox" 
                  id="custom_restrict_withdrawals" 
                  defaultChecked 
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
                <span>Block Financial Withdrawals</span>
              </label>
            </div>

            <div className="flex space-x-3 pt-2">
              <button 
                onClick={() => setShowCustomModal(false)} 
                className="flex-1 px-4 py-3 border border-slate-700 rounded-xl text-xs font-bold text-gray-300 cursor-pointer hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const daysNum = parseInt(customDays) || 1;
                  const restrictions = {
                    blockGigs: document.getElementById('custom_restrict_gigs')?.checked || false,
                    blockChat: document.getElementById('custom_restrict_chat')?.checked || false,
                    blockProjects: document.getElementById('custom_restrict_projects')?.checked || false,
                    hideProfile: document.getElementById('custom_restrict_profile')?.checked || false,
                    blockWithdrawals: document.getElementById('custom_restrict_withdrawals')?.checked || false
                  };
                  confirmSuspend(`Suspended (${daysNum} days)`, restrictions, daysNum);
                }} 
                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 cursor-pointer shadow-lg shadow-amber-600/20 transition"
              >
                Apply Custom Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <UserProfileDrawer 
          selectedUser={selectedUser} 
          onClose={() => setShowProfile(false)} 
          onPreviewImage={(img) => setPreviewImage(img)} 
        />
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button 
              onClick={() => setPreviewImage(null)} 
              className="absolute -top-12 right-0 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition shadow-lg"
            >
              Close ✕
            </button>
            <img 
              src={previewImage} 
              alt="Fullscreen ID Preview" 
              className="w-full max-h-[85vh] object-contain rounded-2xl border border-slate-800 shadow-2xl bg-black" 
            />
            <div className="text-center mt-4">
              <a 
                href={previewImage} 
                download="ID_Document"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-block shadow-lg cursor-pointer shadow-blue-600/20"
              >
                Download This Image
              </a>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}