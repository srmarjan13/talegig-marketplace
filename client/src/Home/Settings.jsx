import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../Home/ToastContext';

// ==========================================
// ১. Contact Info Tab Component
// ==========================================
const ContactInfoTab = ({ profileData, setProfileData, onSave }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const countriesList = [
    { name: 'United Arab Emirates', code: '+971', flagImg: 'https://flagcdn.com/w40/ae.png', length: 9 },
    { name: 'Bangladesh', code: '+880', flagImg: 'https://flagcdn.com/w40/bd.png', length: 10 },
    { name: 'United States', code: '+1', flagImg: 'https://flagcdn.com/w40/us.png', length: 10 },
    { name: 'United Kingdom', code: '+44', flagImg: 'https://flagcdn.com/w40/gb.png', length: 10 },
    { name: 'Canada', code: '+1', flagImg: 'https://flagcdn.com/w40/ca.png', length: 10 },
    { name: 'India', code: '+91', flagImg: 'https://flagcdn.com/w40/in.png', length: 10 },
    { name: 'Saudi Arabia', code: '+966', flagImg: 'https://flagcdn.com/w40/sa.png', length: 9 },
    { name: 'Pakistan', code: '+92', flagImg: 'https://flagcdn.com/w40/pk.png', length: 10 },
    { name: 'Germany', code: '+49', flagImg: 'https://flagcdn.com/w40/de.png', length: 10 },
    { name: 'Australia', code: '+61', flagImg: 'https://flagcdn.com/w40/au.png', length: 9 },
    { name: 'Qatar', code: '+974', flagImg: 'https://flagcdn.com/w40/qa.png', length: 8 },
    { name: 'Oman', code: '+968', flagImg: 'https://flagcdn.com/w40/om.png', length: 8 }
  ];

  const [selectedCountryCode, setSelectedCountryCode] = useState(profileData.countryCode || '+971');
  const [phoneError, setPhoneError] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(profileData.phoneVerified || false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [detectedLocation] = useState({
    country: profileData.autoCountry || 'United Arab Emirates',
    timezone: profileData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dubai'
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentUserId = user?.tgId || profileData.tgId || user?.id || `TG-${Math.floor(10000 + Math.random() * 90000)}`;
  
  let rawUsername = user?.username || profileData.username || user?.name?.toLowerCase().replace(/\s+/g, '_') || 'saidur_user';
  if (rawUsername.startsWith('@')) rawUsername = rawUsername.substring(1);
  const currentUsername = `@${rawUsername}`;

  const currentEmail = user?.email || profileData.email || 'user@talegig.com';

  const validatePhoneNumber = (phone, code) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const activeCountry = countriesList.find(c => c.code === code);
    
    if (activeCountry && cleanPhone.length !== activeCountry.length) {
      return `Phone number must be exactly ${activeCountry.length} digits.`;
    }
    if (cleanPhone.length < 7 || cleanPhone.length > 12) {
      return 'Please enter a valid phone number format.';
    }
    return '';
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setProfileData({ ...profileData, phone: val });
    const err = validatePhoneNumber(val, selectedCountryCode);
    setPhoneError(err);
  };

  const handleVerifyClick = () => {
    if (phoneError || !profileData.phone) {
      showToast('⚠️ Please enter a valid phone number before verification.','error');
      return;
    }
    setIsPhoneVerified(true);
    setProfileData({...profileData, phoneVerified: true});
    showToast('✅ Phone number verified successfully via OTP!','success');
  };

  const activeCountryObj = countriesList.find(c => c.code === selectedCountryCode) || countriesList[0];

  return (
    <div className="w-full h-auto bg-white dark:bg-[#0b0f19] p-4 sm:p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-slate-900 dark:text-white">
      
      {/* হেডার */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Contact & Location Information</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your personal credentials, verified contact channels, and system location details.</p>
      </div>
      
      {/* ১. নন-এডিটেবল ইউজার আইডি, ইউজারনেম এবং ইমেইল */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-[#16171a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <label className="text-[11px] font-extrabold text-slate-400 uppercase block mb-1">User ID (TG ID)</label>
          <input 
            type="text" 
            disabled 
            value={currentUserId} 
            className="w-full bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono font-bold opacity-75 cursor-not-allowed truncate"
          />
        </div>
        <div>
          <label className="text-[11px] font-extrabold text-slate-400 uppercase block mb-1">Username (Dynamic)</label>
          <input 
            type="text" 
            disabled 
            value={currentUsername} 
            className="w-full bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono font-bold opacity-75 cursor-not-allowed truncate"
          />
        </div>
        <div>
          <label className="text-[11px] font-extrabold text-slate-400 uppercase block mb-1">Email Address (Dynamic)</label>
          <input 
            type="text" 
            disabled 
            value={currentEmail} 
            className="w-full bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold opacity-75 cursor-not-allowed truncate"
          />
        </div>
      </div>

      {/* ২. ফুল নেম এবং ফোন ভেরিফিকেশন সিস্টেম */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1.5">Full Name (Legal Name)</label>
          <input 
            type="text" 
            value={profileData.name || ''}
            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
            className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold focus:outline-none focus:border-pink-600"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-500">Phone Number & Verification</label>
            
            {!isPhoneVerified ? (
              <button 
                type="button"
                onClick={handleVerifyClick}
                className="text-[10px] font-black px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition cursor-pointer border border-amber-500/20 flex items-center gap-1 shadow-sm"
              >
                <span>Tap to Verify</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            ) : (
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                <span>✓ Verified</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full">
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-3.5 text-xs font-bold flex items-center gap-2 cursor-pointer hover:border-pink-600 transition select-none"
              >
                <img src={activeCountryObj.flagImg} alt="flag" className="w-5 h-3.5 object-cover rounded-sm shadow-xs flex-shrink-0" />
                <span className="font-mono">{activeCountryObj.code}</span>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 max-h-60 overflow-y-auto bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 py-2 divide-y divide-slate-100 dark:divide-slate-800">
                  {countriesList.map((c) => (
                    <div 
                      key={c.code + c.name}
                      onClick={() => {
                        setSelectedCountryCode(c.code);
                        setProfileData({...profileData, countryCode: c.code});
                        setPhoneError(validatePhoneNumber(profileData.phone || '', c.code));
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                    >
                      <img src={c.flagImg} alt="flag" className="w-5 h-3.5 object-cover rounded-sm shadow-xs flex-shrink-0" />
                      <span className="font-mono text-pink-600 w-12">{c.code}</span>
                      <span className="text-slate-700 dark:text-slate-300 truncate">{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input 
              type="text" 
              placeholder="1700000000"
              value={profileData.phone || ''}
              onChange={handlePhoneChange}
              className={`flex-1 w-full bg-slate-50 dark:bg-[#16171a] border ${phoneError ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-xl p-3.5 text-xs font-bold focus:outline-none focus:border-pink-600 font-mono`}
            />
          </div>
          {phoneError && <span className="text-[10px] font-bold text-red-500 mt-1 block">{phoneError}</span>}
        </div>
      </div>

      {/* ৩. অটো লোকেশন ও টাইমজোন লকড ফিল্ড */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1.5">
            Detected Country / Region (Locked by IP)
          </label>
          <div className="relative">
            <input 
              type="text" 
              disabled 
              value={detectedLocation.country}
              className="w-full bg-slate-100 dark:bg-[#16171a] border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 text-xs font-bold opacity-80 cursor-not-allowed pr-10 font-mono"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1.5">
            System Timezone (Locked)
          </label>
          <div className="relative">
            <input 
              type="text" 
              disabled 
              value={detectedLocation.timezone}
              className="w-full bg-slate-100 dark:bg-[#16171a] border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 text-xs font-bold opacity-80 cursor-not-allowed pr-10 font-mono"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </span>
          </div>
        </div>
      </div>

      {/* ৪. এড্রেস লাইন ১ ও ২, সিটি, স্টেট, জিপ কোড */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Billing & Physical Address</h4>
        
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1.5">Address Line 1</label>
          <input 
            type="text" 
            placeholder="Street address, building name, apartment"
            value={profileData.addressLine1 || ''}
            onChange={(e) => setProfileData({...profileData, addressLine1: e.target.value})}
            className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold focus:outline-none focus:border-pink-600"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1.5">Address Line 2 (Optional)</label>
          <input 
            type="text" 
            placeholder="Suite, unit, floor, landmark"
            value={profileData.addressLine2 || ''}
            onChange={(e) => setProfileData({...profileData, addressLine2: e.target.value})}
            className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold focus:outline-none focus:border-pink-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">City</label>
            <input 
              type="text" 
              placeholder="e.g. Dubai / Sylhet"
              value={profileData.city || ''}
              onChange={(e) => setProfileData({...profileData, city: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold focus:outline-none focus:border-pink-600"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">State / Province</label>
            <input 
              type="text" 
              placeholder="e.g. Dubai / Dhaka Division"
              value={profileData.state || ''}
              onChange={(e) => setProfileData({...profileData, state: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold focus:outline-none focus:border-pink-600"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">Zip / Postal Code</label>
            <input 
              type="text" 
              placeholder="00000"
              value={profileData.zipCode || ''}
              onChange={(e) => setProfileData({...profileData, zipCode: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold focus:outline-none focus:border-pink-600 font-mono"
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button onClick={() => onSave('profile')} className="bg-pink-600 hover:bg-pink-700 text-white px-7 py-3 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-lg shadow-pink-600/25">
          Save Contact Info
        </button>
      </div>
    </div>
  );
};

// ==========================================
// ২. Profile Tab Component
// ==========================================
const ProfileTab = ({ profileData, setProfileData, onSave }) => {
  const experienceLevels = [
    { level: 'Entry level', desc: 'I am relatively new to this field' },
    { level: 'Intermediate', desc: 'I have substantial experience in this field' },
    { level: 'Expert', desc: 'I have comprehensive and deep expertise in this field' }
  ];

  const currentLevel = profileData.experienceLevel || 'Intermediate';

  const skillsArray = typeof profileData.skills === 'string' 
    ? profileData.skills.split(',').map(s => s.trim()).filter(Boolean) 
    : (Array.isArray(profileData.skills) ? profileData.skills : []);

  const [currentSkillInput, setCurrentSkillInput] = useState('');

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = currentSkillInput.trim().replace(/,/g, '');
      if (val) {
        if (!skillsArray.includes(val)) {
          const updatedSkills = [...skillsArray, val];
          setProfileData({ ...profileData, skills: updatedSkills.join(', ') });
        }
        setCurrentSkillInput('');
      }
    }
  };

  const removeSkillTag = (skillToRemove) => {
    const updatedSkills = skillsArray.filter(s => s !== skillToRemove);
    setProfileData({ ...profileData, skills: updatedSkills.join(', ') });
  };

  return (
    <div className="w-full h-auto bg-white dark:bg-[#0b0f19] p-4 sm:p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-slate-900 dark:text-white">
      
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Professional Profile Settings</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your experience level, professional title, description, skills, and portfolio links.</p>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Experience Level</label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {experienceLevels.map((item) => {
            const isSelected = currentLevel === item.level;
            return (
              <div 
                key={item.level}
                onClick={() => setProfileData({ ...profileData, experienceLevel: item.level })}
                className={`p-5 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-slate-50 dark:bg-[#16171a] border-pink-600 shadow-md shadow-pink-600/10 ring-1 ring-pink-600' 
                    : 'bg-slate-50/50 dark:bg-[#12141c] border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{item.level}</h4>
                  
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-pink-600' : 'border-slate-400 dark:border-slate-600'}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-pink-600"></div>}
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2">
        <label className="text-xs font-bold text-slate-500 block mb-1.5">Professional Title</label>
        <input 
          type="text" 
          placeholder="e.g. Senior Frontend Developer & UI/UX Designer"
          value={profileData.professionalTitle || ''}
          onChange={(e) => setProfileData({...profileData, professionalTitle: e.target.value})}
          className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold focus:outline-none focus:border-pink-600"
        />
      </div>
      
      <div>
        <label className="text-xs font-bold text-slate-500 block mb-1.5">Professional Description / Bio</label>
        <textarea 
          rows="4"
          placeholder="Tell clients about your expertise, years of experience, and workflow..."
          value={profileData.bio || ''}
          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
          className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold focus:outline-none focus:border-pink-600 leading-relaxed"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 block">Skills & Expertise (Type & Press Enter)</label>
        
        {skillsArray.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-[#12141c] rounded-xl border border-slate-200 dark:border-slate-800">
            {skillsArray.map((skill, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 rounded-lg text-xs font-bold">
                {skill}
                <button 
                  type="button" 
                  onClick={() => removeSkillTag(skill)} 
                  className="hover:text-red-500 font-bold cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <input 
          type="text" 
          placeholder="Type a skill and press Enter..."
          value={currentSkillInput}
          onChange={(e) => setCurrentSkillInput(e.target.value)}
          onKeyDown={handleSkillKeyDown}
          className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold focus:outline-none focus:border-pink-600"
        />
        <span className="text-[10px] text-slate-400 block">Press <strong>Enter</strong> to add a skill tag.</span>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 block mb-1.5">Hourly Rate ($ USD)</label>
        <input 
          type="text" 
          placeholder="e.g. $25/hr"
          value={profileData.hourlyRate || ''}
          onChange={(e) => setProfileData({...profileData, hourlyRate: e.target.value})}
          className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold focus:outline-none focus:border-pink-600 font-mono"
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Social Media & Portfolio Links</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">Portfolio Website / Behance</label>
            <input 
              type="text" 
              placeholder="https://behance.net/yourprofile"
              value={profileData.portfolioUrl || ''}
              onChange={(e) => setProfileData({...profileData, portfolioUrl: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold focus:outline-none focus:border-pink-600 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">GitHub / LinkedIn URL</label>
            <input 
              type="text" 
              placeholder="https://github.com/yourusername"
              value={profileData.socialUrl || ''}
              onChange={(e) => setProfileData({...profileData, socialUrl: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold focus:outline-none focus:border-pink-600 font-mono"
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button onClick={() => onSave('profile')} className="bg-pink-600 hover:bg-pink-700 text-white px-7 py-3 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-lg shadow-pink-600/25">
          Save Profile Settings
        </button>
      </div>
    </div>
  );
};

// ==========================================
// ৩. Identity Verification Tab Component (Fully Dynamic with Re-apply & Admin Approval Sync)
// ==========================================
const IdentityVerificationTab = ({ idVerification, setIdVerification, onSave }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [idError, setIdError] = useState('');
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const documentTypes = [
    { title: 'Passport', desc: 'Government issued international travel document' },
    { title: 'National ID Card', desc: 'Official state or national identity card' },
    { title: 'Driving License', desc: 'Valid state or national driving permit' }
  ];

  // অ্যাডমিন প্যানেল থেকে স্ট্যাটাস পরিবর্তনের রিয়েল-টাইম সিঙ্ক লজিক
  useEffect(() => {
    const handleStorageSync = () => {
      try {
        const kyc = JSON.parse(localStorage.getItem('talegig_id_verification') || '{}');
        const settings = JSON.parse(localStorage.getItem('talegig_user_settings') || '{}').idVerification || {};
        
        const currentStatus = kyc.verifiedStatus || settings.verifiedStatus;
        if (currentStatus && currentStatus !== idVerification.verifiedStatus) {
          setIdVerification(prev => ({
            ...prev,
            verifiedStatus: currentStatus
          }));
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, [idVerification.verifiedStatus, setIdVerification]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateIdNumber = (number, type) => {
    const cleanNum = (number || '').trim();
    if (!cleanNum) return 'ID / Passport number cannot be empty.';
    
    if (type === 'Passport' && cleanNum.length < 6) {
      return 'Passport number must be at least 6 characters.';
    }
    if ((type === 'National ID Card' || type === 'Driving License') && cleanNum.length < 5) {
      return 'Please enter a valid ID / License number.';
    }
    return '';
  };

  const handleIdNumberChange = (e) => {
    const val = e.target.value;
    setIdVerification({ ...idVerification, idNumber: val });
    const err = validateIdNumber(val, idVerification.idType || 'Passport');
    setIdError(err);
  };

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 🟢 ফাইল টাইপ চেক
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        showToast('Only JPG, PNG, and PDF files are supported.','error');
        e.target.value = '';
        return;
      }

      // 🟢 সর্বোচ্চ ২ মেগাবাইট (2MB) সাইজ লিমিট চেক
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > MAX_SIZE) {
        showToast('File size exceeds 2MB limit. Please upload a smaller file.','error');
        e.target.value = '';
        return;
      }

      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            setIdVerification(prev => ({ 
              ...prev, 
              documentImage: reader.result,
              fileName: file.name,
              fileType: file.type 
            }));
          } catch (err) {
            showToast('File is too large for browser storage.','error');
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);

          try {
            setIdVerification(prev => ({ 
              ...prev, 
              documentImage: compressedDataUrl,
              fileName: file.name,
              fileType: file.type 
            }));
          } catch (err) {
            showToast('Storage limit exceeded.','error');
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setIdVerification(prev => ({ 
      ...prev, 
      documentImage: null,
      fileName: null,
      fileType: null 
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectedDocTitle = idVerification.idType || 'Passport';
  const isVerified = idVerification.verifiedStatus === 'Verified';
  const isPending = idVerification.verifiedStatus === 'Pending' || idVerification.verifiedStatus === 'Pending Review';
  const isRejected = idVerification.verifiedStatus === 'Rejected';

  return (
    <div className="bg-white dark:bg-[#0b0f19] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fadeIn text-slate-900 dark:text-white">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Identity Verification (KYC)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Verify your government-issued ID to unlock trusted badges.</p>
        </div>
        <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold ${
          isVerified ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
          isPending ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
          isRejected ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
          'bg-slate-500/10 text-slate-400 border border-slate-500/20'
        }`}>
          {idVerification.verifiedStatus || 'Not Submitted'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Document Type Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <label className="text-xs font-bold text-slate-500 block mb-1.5">Document Type</label>
          <div 
            onClick={() => !isVerified && setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold flex justify-between items-center ${isVerified ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-slate-400'} transition select-none`}
          >
            <span className="text-slate-900 dark:text-white">{selectedDocTitle}</span>
            {!isVerified && <svg className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>}
          </div>

          {isDropdownOpen && !isVerified && (
            <div className="absolute left-0 mt-2 w-full bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 py-2 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {documentTypes.map((doc) => (
                <div 
                  key={doc.title}
                  onClick={() => {
                    const newType = doc.title;
                    setIdVerification({...idVerification, idType: newType});
                    setIdError(validateIdNumber(idVerification.idNumber, newType));
                    setIsDropdownOpen(false);
                  }}
                  className="px-4 py-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition flex flex-col gap-0.5"
                >
                  <span className="font-extrabold text-slate-900 dark:text-white">{doc.title}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{doc.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1.5">ID / Passport Number</label>
          <input 
            type="text" 
            placeholder="Enter ID number"
            value={idVerification.idNumber || ''}
            onChange={handleIdNumberChange}
            disabled={isVerified}
            className={`w-full bg-slate-50 dark:bg-[#16171a] border ${idError ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-xl p-3.5 text-xs font-bold focus:outline-none font-mono ${isVerified ? 'opacity-70 cursor-not-allowed' : ''}`}
          />
          {idError && <span className="text-[10px] font-bold text-red-500 mt-1 block">{idError}</span>}
        </div>
      </div>

      {/* Upload Box */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 block">Upload ID Document (JPG, PNG, or PDF only)</label>
        
        <input 
          type="file" 
          ref={fileInputRef}
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileChange}
          disabled={isVerified}
          className="hidden"
        />

        {!idVerification.documentImage ? (
          <div 
            onClick={() => !isVerified && fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#16171a]/50 rounded-3xl p-6 text-center transition flex flex-col items-center justify-center space-y-2 ${isVerified ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-pink-600'}`}
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Click to browse or drag & drop your ID</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Supports: JPG, PNG, PDF (Max file size 10MB)</p>
            </div>
            {!isVerified && <span className="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow transition mt-1">Browse File</span>}
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-2xl">
            <div className="flex items-center gap-3">
              {idVerification.fileType === 'application/pdf' ? (
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-black text-xs border border-red-500/20">
                  PDF
                </div>
              ) : (
                <img src={idVerification.documentImage} alt="ID Preview" className="w-12 h-12 object-cover rounded-xl border border-slate-700 shadow-sm" />
              )}
              <div className="space-y-0.5">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate max-w-xs">
                  {idVerification.fileName || 'Uploaded Document'}
                </span>
                <span className="text-[10px] text-emerald-500 font-bold block">✓ Document attached</span>
              </div>
            </div>

            {!isVerified && (
              <button 
                type="button"
                onClick={handleRemoveFile}
                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition cursor-pointer border border-red-500/20"
              >
                Remove ×
              </button>
            )}
          </div>
        )}

        {isVerified && (
          <span className="text-xs text-emerald-500 font-bold block">✓ Your ID has been successfully verified by admin.</span>
        )}
        {isRejected && (
          <span className="text-xs text-red-500 font-bold block">❌ Your previous verification was rejected. Please update your document or ID number and re-submit.</span>
        )}
      </div>

      {!isVerified && (
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button 
            onClick={() => { 
              const err = validateIdNumber(idVerification.idNumber, idVerification.idType || 'Passport');
              if (err) {
                setIdError(err);
                showToast('Please fix the ID number before submitting.','error');
                return;
              }
              if (!idVerification.documentImage) {
                showToast('Please upload your ID document before submitting.','error');
                return;
              }
              
              // সাবমিট করার পর স্ট্যাটাস 'Pending' হবে এবং অ্যাডমিন প্যানেলে চলে যাবে
              const updated = {
                ...idVerification, 
                verifiedStatus: 'Pending',
                submitted: true
              };
              setIdVerification(updated);
              localStorage.setItem('talegig_id_verification', JSON.stringify(updated));

              // ইউজার সেটিংস সিঙ্ক আপডেট
              const settings = JSON.parse(localStorage.getItem('talegig_user_settings') || '{}');
              if (!settings.idVerification) settings.idVerification = {};
              settings.idVerification.verifiedStatus = 'Pending';
              settings.idVerification.submitted = true;
              localStorage.setItem('talegig_user_settings', JSON.stringify(settings));

              window.dispatchEvent(new Event('storage'));
              showToast('Successfully submitted for Admin Verification!','success');
              onSave('idVerification'); 
            }} 
            className="bg-pink-600 hover:bg-pink-700 text-white px-7 py-3 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-lg shadow-pink-600/20"
          >
            {isRejected ? 'Re-submit for Verification' : 'Submit for Verification'}
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// ৪. Withdrawals Tab Component (Multi-Method up to 3 with Professional Dropdown & Dynamic Fields)
// ==========================================
const WithdrawalsTab = ({ withdrawalData, setWithdrawalData, onSave }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // সেভ করা মেথডগুলোর লিস্ট (সর্বোচ্চ ৩টি)
  const [savedMethods, setSavedMethods] = useState(() => {
    try {
      const stored = localStorage.getItem('talegig_saved_withdrawal_methods');
      if (stored) return JSON.parse(stored);
      // যদি পুরনো সিঙ্গেল ডাটা থাকে সেটি দিয়ে শুরু করবে
      if (withdrawalData && withdrawalData.method) {
        return [{ id: Date.now(), ...withdrawalData }];
      }
    } catch(e) {}
    return [];
  });

  // বর্তমান ফর্ম স্টেট
  const [currentMethod, setCurrentMethod] = useState('PayPal');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [branchName, setBranchName] = useState('');

  const payoutOptions = [
    { title: 'PayPal', desc: 'Global Email Payout' },
    { title: 'Payoneer', desc: 'Global Account Payout' },
    { title: 'Wise', desc: 'Multi-Currency Transfer' },
    { title: 'Crypto (USDT)', desc: 'USDT TRC20 Wallet' },
    { title: 'Bank Transfer', desc: 'International SWIFT / IBAN' },
    { title: 'Bkash', desc: 'Bangladesh Mobile Banking' },
    { title: 'Nagad', desc: 'Bangladesh Mobile Banking' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddMethod = () => {
    if (!accountName.trim() || !accountNumber.trim()) {
      showToast('⚠️ Please fill in Account Holder Name and Number/Email.','error');
      return;
    }
    if (currentMethod === 'Bank Transfer' && (!bankName.trim() || !swiftCode.trim())) {
      showToast('⚠️ Please fill in Bank Name and SWIFT code.','error');
      return;
    }

    if (savedMethods.length >= 3) {
      showToast('⚠️ You can add a maximum of 3 withdrawal methods. Please remove one to add a new one.','error');
      return;
    }

    const newMethodObj = {
      id: Date.now(),
      method: currentMethod,
      accountName,
      accountNumber,
      bankName: currentMethod === 'Bank Transfer' ? bankName : '',
      swiftCode: currentMethod === 'Bank Transfer' ? swiftCode : '',
      branchName: currentMethod === 'Bank Transfer' ? branchName : ''
    };

    const updatedList = [...savedMethods, newMethodObj];
    setSavedMethods(updatedList);
    localStorage.setItem('talegig_saved_withdrawal_methods', JSON.stringify(updatedList));

    // মূল সেটিংসে প্রথম বা ডিফল্ট হিসেবে সেট করে দেওয়া
    setWithdrawalData(newMethodObj);
    onSave('withdrawals');

    // ফর্ম রিসেট
    setAccountName('');
    setAccountNumber('');
    setBankName('');
    setSwiftCode('');
    setBranchName('');
    showToast('✅ Payout method added successfully!','success');
  };

  const handleRemoveMethod = (idToRemove) => {
    const filtered = savedMethods.filter(m => m.id !== idToRemove);
    setSavedMethods(filtered);
    localStorage.setItem('talegig_saved_withdrawal_methods', JSON.stringify(filtered));
    if (filtered.length > 0) {
      setWithdrawalData(filtered[0]);
    } else {
      setWithdrawalData({});
    }
    onSave('withdrawals');
    showToast('🗑️ Payout method removed.','success');
  };

  return (
    <div className="bg-white dark:bg-[#0b0f19] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fadeIn text-slate-900 dark:text-white">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Withdrawal & Payout Methods</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure up to 3 global accounts to withdraw your earnings.</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
          {savedMethods.length} / 3 Added
        </span>
      </div>

      {/* সেভ করা মেথডগুলোর লিস্ট */}
      {savedMethods.length > 0 && (
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Your Saved Payout Accounts</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedMethods.map((m) => (
              <div key={m.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">{m.method}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">{m.accountNumber}</span>
                  <span className="text-[10px] text-slate-400 block">{m.accountName}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => handleRemoveMethod(m.id)}
                  className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold transition cursor-pointer border border-red-500/20"
                >
                  Remove ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* নতুন মেথড অ্যাড করার ফর্ম (যদি ৩টির কম থাকে) */}
      {savedMethods.length < 3 ? (
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Add New Payout Method</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* প্রফেশনাল কাস্টম ড্রপডাউন */}
            <div className="relative" ref={dropdownRef}>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Select Payout Method</label>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold flex justify-between items-center cursor-pointer hover:border-slate-400 transition select-none"
              >
                <span className="text-slate-900 dark:text-white">{currentMethod}</span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-full bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 py-2 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                  {payoutOptions.map((opt) => (
                    <div 
                      key={opt.title}
                      onClick={() => {
                        setCurrentMethod(opt.title);
                        setIsDropdownOpen(false);
                      }}
                      className="px-4 py-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition flex flex-col gap-0.5"
                    >
                      <span className="font-extrabold text-slate-900 dark:text-white">{opt.title}</span>
                      <span className="text-[10px] text-slate-500">{opt.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Account Holder Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. Md Saidur Rahman" 
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">
              {currentMethod === 'PayPal' ? 'PayPal Email Address' : 
               currentMethod === 'Crypto (USDT)' ? 'USDT Wallet Address (TRC20)' : 
               currentMethod === 'Bank Transfer' ? 'International IBAN / Account Number' : 'Account / Phone Number'}
            </label>
            <input 
              type="text" 
              placeholder={currentMethod === 'PayPal' ? 'user@example.com' : 'Enter account number or details...'} 
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold font-mono"
            />
          </div>

          {currentMethod === 'Bank Transfer' && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Bank Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Emirates NBD / HSBC / EBL" 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1.5">SWIFT / BIC Code</label>
                  <input 
                    type="text" 
                    placeholder="SWIFT code" 
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1.5">Branch Name (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Branch name" 
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button 
              type="button" 
              onClick={handleAddMethod} 
              className="bg-pink-600 hover:bg-pink-700 text-white px-7 py-3 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-lg shadow-pink-600/20"
            >
              + Add This Payout Method
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-amber-500 font-bold">⚠️ You have reached the maximum limit of 3 saved payment methods.</p>
      )}
    </div>
  );
};

// ==========================================
// ৫. Notification Tab Component
// ==========================================
const NotificationTab = ({ notifications, setNotifications, onSave }) => {
  return (
    <div className="bg-white dark:bg-[#0b0f19] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fadeIn text-slate-900 dark:text-white">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-black text-pink-600">Notification Preferences</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Choose how and when you want to receive alerts.</p>
      </div>
      
      <div className="space-y-4 bg-slate-50 dark:bg-[#16171a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold">Email Alerts on Orders & Milestones</span>
          <input 
            type="checkbox" 
            checked={notifications.emailAlerts}
            onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
            className="w-4 h-4 accent-pink-600 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold">Project Updates & Proposals</span>
          <input 
            type="checkbox" 
            checked={notifications.projectUpdates}
            onChange={(e) => setNotifications({...notifications, projectUpdates: e.target.checked})}
            className="w-4 h-4 accent-pink-600 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold">SMS Notifications</span>
          <input 
            type="checkbox" 
            checked={notifications.smsAlerts}
            onChange={(e) => setNotifications({...notifications, smsAlerts: e.target.checked})}
            className="w-4 h-4 accent-pink-600 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold">Marketing & Promotional Offers</span>
          <input 
            type="checkbox" 
            checked={notifications.marketingEmails}
            onChange={(e) => setNotifications({...notifications, marketingEmails: e.target.checked})}
            className="w-4 h-4 accent-pink-600 cursor-pointer"
          />
        </label>
      </div>

      <div className="pt-2">
        <button onClick={() => onSave('notifications')} className="bg-pink-600 hover:bg-pink-700 text-white px-7 py-3 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-lg shadow-pink-600/20">
          Save Preferences
        </button>
      </div>
    </div>
  );
};

// ==========================================
// মূল Settings Component
// ==========================================
const Settings = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('Contact Info');
  const tabs = ['Contact Info', 'Profile', 'Identity Verification', 'Withdrawals', 'Notification'];

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    tgId: user?.tgId || `TG-${Math.floor(10000 + Math.random() * 90000)}`,
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    countryCode: '+971',
    phoneVerified: false,
    professionalTitle: '',
    bio: '',
    skills: '',
    hourlyRate: '',
    experienceLevel: 'Intermediate',
    portfolioUrl: '',
    socialUrl: ''
  });

  const [withdrawalData, setWithdrawalData] = useState({
    method: 'bank',
    accountName: '',
    accountNumber: '',
    bankName: '',
    swiftCode: '',
    bkashNumber: ''
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    projectUpdates: true,
    marketingEmails: false,
    smsAlerts: false
  });

  const [idVerification, setIdVerification] = useState({
    idType: 'Passport',
    idNumber: '',
    verifiedStatus: 'Not Verified'
  });

useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('talegig_user_settings');
      const savedProfile = localStorage.getItem('talegig_user_profile');
      const savedKYC = localStorage.getItem('talegig_id_verification');
      const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.profile) {
          setProfileData(prev => ({ 
            ...prev, 
            ...parsed.profile, 
            tgId: loggedUser.tgId || parsed.profile.tgId || prev.tgId 
          }));
        }
        if (parsed.withdrawals) setWithdrawalData(parsed.withdrawals);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.idVerification) setIdVerification(parsed.idVerification);
      } else if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileData(prev => ({ 
          ...prev, 
          ...parsedProfile, 
          tgId: loggedUser.tgId || parsedProfile.tgId || prev.tgId 
        }));
      }

      // যদি সেটিংসে tgId না থাকে কিন্তু লগইন করা ইউজার অবজেক্টে থাকে
      if (loggedUser.tgId) {
        setProfileData(prev => ({ ...prev, tgId: loggedUser.tgId }));
      }

      if (savedKYC) {
        setIdVerification(JSON.parse(savedKYC));
      }
    } catch (e) {}
  }, []);

  const handleSave = (sectionName) => {
    try {
      const currentSettings = JSON.parse(localStorage.getItem('talegig_user_settings') || '{}');
      if (sectionName === 'profile') {
        currentSettings.profile = profileData;
        localStorage.setItem('talegig_user_profile', JSON.stringify(profileData));
        
        if (profileData.skills) {
          const skillsArr = typeof profileData.skills === 'string' 
            ? profileData.skills.split(',').map(s => s.trim()).filter(Boolean) 
            : profileData.skills;
          localStorage.setItem('talegig_user_skills', JSON.stringify(skillsArr));
        }

        const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...existingUser,
          name: profileData.name,
          email: existingUser.email || profileData.email, // 🟢 ইমেইল যেন কোনোভাবেই মিসিং বা রিমুভ না হয়
          title: profileData.professionalTitle,
          bio: profileData.bio,
          hourlyRateNum: profileData.hourlyRate ? profileData.hourlyRate.replace(/[^0-9]/g, '') : existingUser.hourlyRateNum
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      if (sectionName === 'withdrawals') currentSettings.withdrawals = withdrawalData;
      if (sectionName === 'notifications') currentSettings.notifications = notifications;
      if (sectionName === 'idVerification') {
        currentSettings.idVerification = idVerification;
        localStorage.setItem('talegig_id_verification', JSON.stringify(idVerification));
      }

      localStorage.setItem('talegig_user_settings', JSON.stringify(currentSettings));
      window.dispatchEvent(new Event('storage'));

      showToast(`✅ ${activeTab} updated successfully and synced with your Profile!`,'success');
    } catch (err) {
      showToast('Failed to update settings.','error');
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0b0f19] p-4 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white space-y-6">
      
      <div>
        <h2 className="text-2xl font-black">Account Settings</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your professional profile, payout methods, and security preferences.</p>
      </div>

      <div className="flex gap-2 bg-slate-100 dark:bg-[#16171a] p-1.5 rounded-xl w-fit border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`px-4 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab 
                ? 'bg-pink-600 text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Contact Info' && (
        <ContactInfoTab profileData={profileData} setProfileData={setProfileData} onSave={handleSave} />
      )}

      {activeTab === 'Profile' && (
        <ProfileTab profileData={profileData} setProfileData={setProfileData} onSave={handleSave} />
      )}

      {activeTab === 'Identity Verification' && (
        <IdentityVerificationTab idVerification={idVerification} setIdVerification={setIdVerification} onSave={handleSave} />
      )}

      {activeTab === 'Withdrawals' && (
        <WithdrawalsTab withdrawalData={withdrawalData} setWithdrawalData={setWithdrawalData} onSave={handleSave} />
      )}

      {activeTab === 'Notification' && (
        <NotificationTab notifications={notifications} setNotifications={setNotifications} onSave={handleSave} />
      )}

    </div>
  );
};

export default Settings;