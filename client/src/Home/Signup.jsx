// client/src/pages/Signup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 🟢 লগইন মোড ট্র্যাক করার স্টেট (সাইনআপ নাকি লগইন)
  const [isLoginMode, setIsLoginMode] = useState(false);

  useEffect(() => {
    const existingUser = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');
    if (existingUser) {
      if (userRole === 'BUYER' || userRole === 'buyer') {
        navigate('/buyer-dashboard', { replace: true });
      } else if (userRole === 'SELLER' || userRole === 'seller') {
        navigate('/sellerdashboard', { replace: true });
      }
    }
  }, [navigate]);

  const getInitialRole = () => {
    const stateRole = location.state?.role;
    const queryRole = searchParams.get('role');
    if (stateRole === 'seller' || stateRole === 'buyer') return stateRole;
    if (queryRole === 'seller' || queryRole === 'buyer') return queryRole;
    return 'buyer';
  };

  const [role, setRole] = useState(getInitialRole);

  useEffect(() => {
    const stateRole = location.state?.role;
    const queryRole = searchParams.get('role');

    if (stateRole === 'seller' || stateRole === 'buyer') {
      setRole(stateRole);
    } else if (queryRole === 'seller' || queryRole === 'buyer') {
      setRole(queryRole);
    }
  }, [location, searchParams]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      const formattedUsername = value.replace(/\s+/g, '_').toLowerCase();
      setFormData({ ...formData, [name]: formattedUsername });
    } else if (name === 'email') {
      const cleanEmail = value.replace(/\s+/g, '');
      setFormData({ ...formData, [name]: cleanEmail });
      if (isEmailVerified) {
        setIsEmailVerified(false);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateGmail = (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(cleanEmail);
  };

  // 🟢 শতভাগ নিখুঁত ও ব্রাউজার-সাপোর্টেড অটো লোকেশন এবং জয়েন ডেট বের করার ফাংশন
  const fetchAutoUserMetadata = async () => {
    let detectedLocation = '';

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && tz.includes('/')) {
        const parts = tz.split('/');
        const city = parts[parts.length - 1].replace(/_/g, ' ');
        const region = parts[0].replace(/_/g, ' ');
        detectedLocation = `${city}, ${region}`;
      }
    } catch (err) {}

    if (!detectedLocation) {
      try {
        const lang = navigator.language || navigator.userLanguage; 
        if (lang && lang.includes('-')) {
          const countryCode = lang.split('-')[1];
          detectedLocation = `Region (${countryCode})`;
        } else {
          detectedLocation = 'Global User';
        }
      } catch (err) {
        detectedLocation = 'Online';
      }
    }

    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const exactJoinDate = new Date().toLocaleDateString('en-US', options); 

    return {
      location: detectedLocation,
      joinDate: exactJoinDate,
      createdAt: new Date().toISOString()
    };
  };

  // 🟢 রিয়েল জিমেইলে ইনস্ট্যান্ট ওটিপি পাঠানোর ডাইনামিক হ্যান্ডলার (শুধুমাত্র সেলারের জন্য ব্যবহৃত হবে)
  const handleSendOtp = async () => {
    if (!formData.email) {
      showToast('⚠️ Please enter your email address first!', 'error');
      return;
    }
    if (!validateGmail(formData.email)) {
      showToast('Invalid Email! Only valid @gmail.com accounts are allowed.', 'error');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    try {
      showToast('Sending verification code to your email...', 'success');
      
      const response = await fetch('http://localhost:3001/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: code })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowOtpModal(true);
        showToast(`✅ Verification code sent successfully to ${formData.email}!`, 'success');
      } else {
        showToast(data.error || 'Failed to send OTP email.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server connection error. Make sure backend is running.', 'error');
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode === generatedOtp) {
      setIsEmailVerified(true);
      setShowOtpModal(false);
      setOtpCode('');
      showToast('✅ Email verified successfully!', 'success');
    } else {
      showToast('Incorrect verification code. Please try again.', 'error');
    }
  };

  const handleGoogleLoginSimulation = async () => {
    const simulatedGoogleEmail = `user_${Math.floor(Math.random() * 10000)}@gmail.com`;
    setFormData(prev => ({
      ...prev,
      email: simulatedGoogleEmail,
      firstName: 'Google',
      lastName: 'User',
      username: 'google_user_' + Math.floor(Math.random() * 1000)
    }));
    setIsEmailVerified(true);
    showToast(`Successfully connected with Google! Email: ${simulatedGoogleEmail}`, 'success');
  };

  // 🟢 সাবমিট হ্যান্ডলার (বায়ারের জন্য ভেরিফিকেশন ছাড়া, এবং সেলারের জন্য ভেরিফিকেশনসহ)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const metaData = await fetchAutoUserMetadata();

    if (isLoginMode) {
      // --- লগইন লজিক ---
      if (!formData.email || !formData.password) {
        showToast('Please fill in email and password!', 'error');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          showToast('Login Successful!', 'success');
          
          const userSessionData = {
            firstName: data.firstName || data.name?.split(' ')[0] || 'User',
            lastName: data.lastName || data.name?.split(' ').slice(1).join(' ') || '',
            name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User',
            username: data.username || '@' + formData.email.split('@')[0],
            email: data.email,
            role: data.role || role.toUpperCase(),
            location: data.location || metaData.location,
            joinDate: data.joinDate || metaData.joinDate,
            createdAt: data.createdAt || metaData.createdAt
          };

          localStorage.setItem('user', JSON.stringify(userSessionData));
          localStorage.setItem('talegig_user', JSON.stringify(userSessionData)); 
          localStorage.setItem('userRole', role);
          localStorage.setItem('token', data.token || 'neon-db-token-12345');
          
          // ফ্রন্টএন্ডে লগইন সাকসেস হলে:
localStorage.setItem('talegig_token', data.token);

// ব্যাকএন্ডে সুরক্ষিত রিকোয়েস্ট পাঠানোর সময়:
fetch('http://localhost:3001/api/some-protected-route', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('talegig_token')}`,
    'Content-Type': 'application/json'
  }
});

          // 🟢 লগইন সফল হওয়ার পর সেশন স্টোরেজে পেন্ডিং প্রজেক্ট থাকলে সরাসরি ব্যাকএন্ডে পাঠিয়ে দেওয়া
          const savedProject = sessionStorage.getItem('pendingProject');
          if (savedProject) {
            try {
              const projectData = JSON.parse(savedProject);
              await fetch('http://localhost:3001/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
              });
              sessionStorage.removeItem('pendingProject');
            } catch (err) {
              console.error("Auto project submit error after login:", err);
            }
          }

          setTimeout(() => {
            navigate(role === 'buyer' ? '/buyer-dashboard' : '/sellerdashboard');
          }, 1000);
        } else {
          showToast(data.error || 'Login failed. Please check credentials.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Login failed. Please check backend server.', 'error');
      }
    
    } else {
      // --- সাইন আপ লজিক ---
      if (!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password) {
        showToast('Please fill in all mandatory fields!', 'error');
        return;
      }

      if (!validateGmail(formData.email)) {
        showToast('Only valid @gmail.com emails are permitted.', 'error');
        return;
      }

      if (formData.password.length < 6) {
        showToast('Password must be at least 6 characters long.', 'error');
        return;
      }

      // 🟢 শর্ত: যদি রোল সেলার (seller) হয়, তবে ইমেইল ভেরিফিকেশন বাধ্যতামূলক থাকবে। বায়ারের জন্য লাগবে না।
      if (role === 'seller' && !isEmailVerified) {
        showToast('⚠️ Sellers must verify their email address before creating an account.', 'error');
        return;
      }

      const cleanUsername = formData.username.startsWith('@' ) ? formData.username : '@' + formData.username;
      const fullProcessedName = `${formData.firstName} ${formData.lastName}`.trim();

      try {
        const response = await fetch('http://localhost:3001/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            name: fullProcessedName,
            username: cleanUsername,
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            role: role.toUpperCase(),
            location: metaData.location,
            joinDate: metaData.joinDate
          })
        });

        const data = await response.json();

        if (response.ok) {
          showToast(`Account Created Successfully in Database!`, 'success');
          
          const newAccountData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            name: fullProcessedName,
            username: cleanUsername,
            email: formData.email.trim().toLowerCase(),
            role: role.toUpperCase(),
            location: metaData.location,
            joinDate: metaData.joinDate,
            createdAt: metaData.createdAt,
            ...(data || {}) 
          };

          localStorage.setItem('user', JSON.stringify(newAccountData));
          localStorage.setItem('talegig_user', JSON.stringify(newAccountData)); 
          localStorage.setItem('userRole', role);
          localStorage.setItem('token', data.token || 'neon-db-token-12345');
          
          // 🟢 সাইনআপ করার পরও পেন্ডিং প্রজেক্ট ব্যাকএন্ডে পাঠানোর লজিক (যদি বায়ার হয়)
          const savedProject = sessionStorage.getItem('pendingProject');
          if (savedProject) {
            try {
              const projectData = JSON.parse(savedProject);
              await fetch('http://localhost:3001/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
              });
              sessionStorage.removeItem('pendingProject');
            } catch (err) {
              console.error("Auto project submit error after signup:", err);
            }
          }

          setTimeout(() => {
            if (role === 'buyer') {
              navigate('/buyer-dashboard'); 
            } else {
              navigate('/sellerdashboard'); 
            }
          }, 1000);
        } else {
          showToast(data.error || 'Failed to create account. Username or Email may already exist.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to connect to backend server!', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050b1a] text-white relative">
      <PublicNavbar />

      {toast.visible && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold border backdrop-blur-md transition-all duration-300 flex items-center gap-3 ${
          toast.type === 'error' ? 'bg-red-950/80 border-red-500/50 text-red-200' : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-center p-4 py-10">
        <div className="flex flex-col md:flex-row w-full max-w-4xl bg-[#0a1226] rounded-2xl overflow-hidden shadow-2xl border border-blue-500/10">
          
          <div className="w-full md:w-1/2 p-8 md:p-10 bg-[#050b1a] flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Find freelancer and manage projects online
            </h1>
            <div className="space-y-3">
              <button 
                type="button" 
                onClick={handleGoogleLoginSimulation}
                className="w-full py-2.5 border border-blue-500 rounded-lg text-white text-sm hover:bg-blue-900/30 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue to Google (Auto Gmail)</span>
              </button>
              <button type="button" className="w-full py-2.5 border border-blue-500 rounded-lg text-white text-sm hover:bg-blue-900/30 transition cursor-pointer">Continue to Facebook</button>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-10 bg-[#0a1226]">
            <h2 className="text-2xl font-bold text-white mb-6">
              {isLoginMode ? 'Log In to Account' : 'Sign up / Log in'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {!isLoginMode && (
                <div className="flex gap-2">
                  <input 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    placeholder="First Name *" 
                    className="w-1/2 bg-[#050b1a] border border-blue-500/20 p-2.5 rounded-lg text-white text-sm outline-none" 
                  />
                  <input 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    placeholder="Last Name *" 
                    className="w-1/2 bg-[#050b1a] border border-blue-500/20 p-2.5 rounded-lg text-white text-sm outline-none" 
                  />
                </div>
              )}

              {!isLoginMode && (
                <input 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  placeholder="Username (no spaces) *" 
                  className="w-full bg-[#050b1a] border border-blue-500/20 p-2.5 rounded-lg text-white text-sm outline-none font-mono" 
                />
              )}
              
              <div className="relative">
                <input 
                  name="email" 
                  type="email"
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder={isLoginMode ? "Gmail address *" : "Gmail (@gmail.com only) *"} 
                  className="w-full bg-[#050b1a] border border-blue-500/20 p-2.5 pr-24 rounded-lg text-white text-sm outline-none" 
                />
                {/* 🟢 শুধুমাত্র সেলার (Seller) সিলেক্ট করা থাকলে ইমেইল ভেরিফাই বাটনটি শো করবে */}
                {!isLoginMode && role === 'seller' && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {!isEmailVerified ? (
                      <button 
                        type="button" 
                        onClick={handleSendOtp}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold cursor-pointer"
                      >
                        Verify
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-xs font-bold px-2 flex items-center gap-1">✓ Verified</span>
                    )}
                  </div>
                )}
              </div>

              {!isLoginMode && role === 'seller' && !isEmailVerified && formData.email && (
                <p className="text-[10px] text-gray-400 px-1">Sellers must verify email before registration.</p>
              )}

              <input 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Password *" 
                className="w-full bg-[#050b1a] border border-blue-500/20 p-2.5 rounded-lg text-white text-sm outline-none" 
              />

              {!isLoginMode && (
                <div className="flex items-center text-[11px] md:text-xs text-gray-400 gap-2">
                  <input type="checkbox" className="accent-blue-500" required />
                  <span>I agree to the <span className="text-yellow-500">User Agreement</span> and <span className="text-yellow-500">Privacy Policy</span>.</span>
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setRole('buyer')} 
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition cursor-pointer ${role === 'buyer' ? 'bg-[#e91e63] text-white' : 'bg-[#1e2732] text-gray-400'}`}
                >
                  I'm Buyer
                </button>
                <button 
                  type="button" 
                  onClick={() => setRole('seller')} 
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition cursor-pointer ${role === 'seller' ? 'bg-[#e91e63] text-white' : 'bg-[#1e2732] text-gray-400'}`}
                >
                  I'm Seller
                </button>
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 py-2.5 rounded-lg font-bold text-white text-sm hover:bg-blue-700 transition cursor-pointer"
              >
                {isLoginMode ? 'Log In' : 'Create Account'}
              </button>
            </form>
            
            <p className="text-center text-gray-400 mt-4 text-xs">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <span 
                onClick={() => setIsLoginMode(!isLoginMode)} 
                className="text-yellow-500 font-bold cursor-pointer hover:underline"
              >
                {isLoginMode ? 'Sign Up' : 'Log In'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a1226] border border-blue-500/30 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Enter Verification Code</h3>
            <p className="text-xs text-gray-400">We have sent a 6-digit code to <strong className="text-white">{formData.email}</strong></p>
            <input 
              type="text" 
              maxLength="6"
              placeholder="Enter 6-digit code" 
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full bg-[#050b1a] border border-blue-500/20 p-3 rounded-xl text-center text-lg font-mono tracking-widest text-white outline-none"
            />
            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel / Change Email
              </button>
              <button 
                type="button" 
                onClick={handleVerifyOtp}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Verify Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;