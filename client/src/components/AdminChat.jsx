// client/src/pages/AdminChat.jsx
import React, { useState, useEffect, useRef } from 'react';

export default function AdminChat() {
  const [activeTab, setActiveTab] = useState('chat');

  // --- 1. Admin Chat States ---
  const [conversations, setConversations] = useState(() => {
    try {
      const savedConv = localStorage.getItem('talegig_admin_active_conversations');
      if (savedConv) return JSON.parse(savedConv);
    } catch (e) {}
    return [];
  });

  const [activeChat, setActiveChat] = useState(null);
  
  const [messages, setMessages] = useState(() => {
    try {
      const savedMsgs = localStorage.getItem('talegig_admin_chat_messages');
      if (savedMsgs) return JSON.parse(savedMsgs);
    } catch (e) {}
    return {};
  });

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const messagesEndRef = useRef(null);

  // --- 2. Live Chat States ---
  const [liveOrders, setLiveOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  
  const [liveMessages, setLiveMessages] = useState(() => {
    try {
      const savedLiveMsgs = localStorage.getItem('talegig_admin_live_messages');
      if (savedLiveMsgs) return JSON.parse(savedLiveMsgs);
    } catch (e) {}
    return {};
  });

  const [liveInputText, setLiveInputText] = useState('');

  // --- 3. Project Tab States (নতুন যুক্ত করা প্রজেক্ট ট্যাব স্টেট) ---
  const [adminProjects, setAdminProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, liveMessages, activeChat, activeOrder]);

  useEffect(() => {
  fetch('http://localhost:3001/api/projects')
    .then(res => res.json())
    .then(data => {
      setAdminProjects(data); // ব্যাকএন্ড থেকে আসা প্রজেক্ট লিস্ট
      if (data.length > 0) setActiveProject(data[0]);
    })
    .catch(err => console.error("Error fetching projects from backend:", err));
  }, []);

  // রিয়েল-টাইম ব্যাকগ্রাউন্ড সিংক
  useEffect(() => {
    const syncInterval = setInterval(() => {
      try {
        const savedMsgs = localStorage.getItem('talegig_admin_chat_messages');
        if (savedMsgs) {
          const parsedMsgs = JSON.parse(savedMsgs);
          setMessages(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(parsedMsgs)) {
              return parsedMsgs;
            }
            return prev;
          });
        }
      } catch (e) {}
    }, 600);

    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('talegig_admin_active_conversations', JSON.stringify(conversations));
    } catch (e) {}
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem('talegig_admin_chat_messages', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('talegig_admin_live_messages', JSON.stringify(liveMessages));
    } catch (e) {}
  }, [liveMessages]);

  // ডাইনামিক ইউজার, অর্ডার এবং প্রজেক্ট লোডিং
  useEffect(() => {
    try {
      const targetUser = localStorage.getItem('talegig_active_chat');
      const adminNotifRaw = localStorage.getItem('talegig_admin_notification');
      const standardChatId = 'admin_support_chat';
      
      let loadedConversations = [...conversations];

      if (targetUser) {
        const cleanUsername = targetUser.replace('@', '').toLowerCase();
        let foundUser = loadedConversations.find(c => c.username.toLowerCase().includes(cleanUsername));

        if (!foundUser) {
          let dynamicUser = {
            id: standardChatId,
            name: '-',
            username: targetUser.startsWith('@') ? targetUser : '@' + targetUser,
            tgId: '-',
            email: cleanUsername ? (cleanUsername + '@talegig.com') : '-',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
            status: '-',
            country: '-'
          };

          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const val = localStorage.getItem(key);
            if (val && val.startsWith('{') && val.toLowerCase().includes(cleanUsername)) {
              try {
                const parsed = JSON.parse(val);
                if (parsed.name || parsed.email || parsed.country || parsed.location) {
                  dynamicUser = {
                    id: standardChatId,
                    name: parsed.name || parsed.fullName || cleanUsername || '-',
                    username: parsed.username ? (parsed.username.startsWith('@' ) ? parsed.username : '@' + parsed.username) : dynamicUser.username,
                    tgId: parsed.tgId || '-',
                    email: parsed.email || dynamicUser.email,
                    avatar: parsed.avatar || dynamicUser.avatar,
                    status: parsed.status || dynamicUser.status,
                    country: parsed.country || parsed.location || '-'
                  };
                  break;
                }
              } catch(err) {}
            }
          }

          loadedConversations = [dynamicUser];
          setConversations(loadedConversations);
          setActiveChat(dynamicUser);
        } else {
          setActiveChat(foundUser);
        }

        if (adminNotifRaw) {
          try {
            const notif = JSON.parse(adminNotifRaw);
            const initMsg = {
              id: Date.now(),
              sender: 'admin',
              text: notif.message,
              time: notif.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => {
              const chatMsgs = prev[standardChatId] || [];
              const alreadyExists = chatMsgs.some(m => m.text === initMsg.text);
              if (alreadyExists) return prev;

              const updatedMsgs = {
                ...prev,
                [standardChatId]: [...chatMsgs, initMsg]
              };
              localStorage.setItem('talegig_admin_chat_messages', JSON.stringify(updatedMsgs));
              return updatedMsgs;
            });
          } catch(e){}
        }

        localStorage.removeItem('talegig_active_chat');
      } 

      // লাইভ অর্ডারস ফেচিং
      let ordersList = [];
      const savedOrders = localStorage.getItem('talegig_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        parsed.forEach((ord, index) => {
          ordersList.push({
            id: ord.id || 'ORDER-' + (index + 100),
            title: ord.title || '-',
            clientName: ord.clientName || '-',
            clientUsername: ord.clientUsername || '-',
            budget: ord.price ? `$${ord.price} USD` : '-',
            status: ord.status || '-',
            deliveryTime: ord.deliveryTime || '-',
            avatar: ord.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
            requirements: ord.requirements || '-'
          });
        });
      }
      setLiveOrders(ordersList);
      if (ordersList.length > 0 && !activeOrder) setActiveOrder(ordersList[0]);

      // 🟢 প্রজেক্ট ট্যাব ডেটা ফেচিং (লোকালস্টোরেজ বা ব্যাকএন্ড প্রজেক্ট লিস্ট থেকে)
      let projectsList = [];
      const savedProposals = localStorage.getItem('talegig_proposals');
      if (savedProposals) {
        const parsedProj = JSON.parse(savedProposals);
        parsedProj.forEach((proj, idx) => {
          projectsList.push({
            id: proj.id || 'PROJ-' + (idx + 500),
            title: proj.title || proj.description?.substring(0, 40) + '...' || 'Unnamed Project',
            description: proj.description || proj.details || 'No description provided.',
            budget: proj.budget || 'N/A',
            currency: proj.currency || 'USD',
            category: proj.category || 'General',
            authorName: proj.authorName || 'Guest Client',
            createdAt: proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : 'Recent'
          });
        });
      }
      setAdminProjects(projectsList);
      if (projectsList.length > 0 && !activeProject) setActiveProject(projectsList[0]);

    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() && attachedFiles.length === 0) return;
    if (!activeChat) return;

    const newMsg = {
      id: Date.now(),
      sender: 'admin',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const chatKey = activeChat.id;

    setMessages(prev => {
      const chatMsgs = prev[chatKey] || [];
      const updatedMsgs = {
        ...prev,
        [chatKey]: [...chatMsgs, newMsg]
      };
      
      try {
        localStorage.setItem('talegig_admin_chat_messages', JSON.stringify(updatedMsgs));
      } catch(err){}

      return updatedMsgs;
    });

    try {
      const userSavedMsgs = JSON.parse(localStorage.getItem('talegig_user_messages') || '{}');
      const existingUserMsgs = userSavedMsgs[chatKey] || [];
      
      const userFormattedMsg = {
        id: newMsg.id,
        sender: 'them',
        senderName: 'Super Admin',
        text: inputText,
        time: newMsg.time
      };

      userSavedMsgs[chatKey] = [...existingUserMsgs, userFormattedMsg];
      localStorage.setItem('talegig_user_messages', JSON.stringify(userSavedMsgs));

      localStorage.setItem('talegig_admin_notification', JSON.stringify({
        user: activeChat.username,
        message: inputText,
        time: newMsg.time,
        unread: true
      }));
    } catch(err) {
      console.error(err);
    }

    setInputText('');
    setAttachedFiles([]);
  };

  const handleSendLiveMessage = (e) => {
    e?.preventDefault();
    if (!liveInputText.trim() || !activeOrder) return;

    const newMsg = {
      id: Date.now(),
      sender: 'admin',
      text: liveInputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setLiveMessages(prev => ({
      ...prev,
      [activeOrder.id]: [...(prev[activeOrder.id] || []), newMsg]
    }));
    setLiveInputText('');
  };

  const currentMessages = activeChat ? (messages[activeChat.id] || []) : [];
  const currentLiveMsgs = activeOrder ? (liveMessages[activeOrder.id] || []) : [];
  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-[calc(100vh-40px)] max-h-[calc(100vh-40px)] bg-[#0b0f19] text-white font-sans flex flex-col overflow-hidden rounded-3xl border border-slate-800 shadow-2xl p-2 sm:p-4 box-border">
      
      {/* ওপরের তিনটি ট্যাব (Chat, Live Chat এবং নতুন Project ট্যাব) */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-2 shrink-0">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
              : 'bg-[#16171a] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setActiveTab('liveChat')}
          className={`px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'liveChat'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-[#16171a] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          ⚡ Live Chat
        </button>
        <button
          onClick={() => setActiveTab('project')}
          className={`px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'project'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-[#16171a] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          📁 Project ({adminProjects.length})
        </button>
      </div>

      {/* মেইন কন্টেইনার */}
      <div className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col">
        {activeTab === 'chat' ? (
          <div className="w-full h-full min-h-0 flex overflow-hidden relative">
            
            {/* ১. লেফট কনভার্সেশন লিস্ট */}
            <div className={`w-full md:w-[300px] lg:w-[320px] border-r border-slate-800 flex flex-col bg-[#0b0f19] h-full overflow-hidden shrink-0 ${
              activeChat ? 'hidden md:flex' : 'flex'
            }`}>
              <div className="p-3 border-b border-slate-800 space-y-2 shrink-0">
                <h2 className="text-xs font-bold tracking-tight text-pink-500 uppercase">Admin Chat</h2>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search active chats..."
                  className="w-full bg-[#16171a] border border-slate-800 p-2 rounded-xl text-xs outline-none text-white focus:border-pink-500 transition"
                />
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 min-h-0">
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs italic">
                    No active chats yet. Start a session from Recent Activities.
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div 
                      key={conv.id}
                      onClick={() => setActiveChat(conv)}
                      className={`p-3 flex items-center gap-3 cursor-pointer transition ${
                        activeChat?.id === conv.id ? 'bg-pink-600/10 border-l-4 border-pink-600' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img src={conv.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0b0f19] rounded-full"></span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-xs truncate">{conv.name}</h4>
                          <span className="text-[10px] text-slate-400">Secure</span>
                        </div>
                        <p className="text-[11px] text-pink-400 truncate">{conv.username}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ২. মাঝখানের চ্যাট উইন্ডো */}
            <div className={`flex-1 flex flex-col bg-[#0b0f19] h-full min-h-0 overflow-hidden border-r border-slate-800 ${
              !activeChat ? 'hidden md:flex' : 'flex'
            }`}>
              {activeChat ? (
                <div className="flex flex-col h-full min-h-0 overflow-hidden">
                  
                  {/* চ্যাট হেডার */}
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-[#0b0f19] shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <button 
                        onClick={() => setActiveChat(null)} 
                        className="md:hidden text-xs text-pink-500 font-bold p-1.5 bg-[#16171a] border border-slate-800 rounded-lg shrink-0 cursor-pointer"
                      >
                        ← Back
                      </button>
                      <img src={activeChat.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                          {activeChat.name} {activeChat.tgId !== '-' && <span className="text-[10px] font-mono text-pink-500">({activeChat.tgId})</span>}
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{activeChat.username} • Secure Chat</p>
                      </div>
                    </div>
                  </div>

                  {/* মেসেজ লিস্ট */}
                  <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-5 space-y-4">
                    {currentMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs italic space-y-1">
                        <p>Secure connection established with {activeChat.name}.</p>
                      </div>
                    ) : (
                      currentMessages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                              <span className="font-bold text-pink-400">{msg.sender === 'admin' ? 'Super Admin' : activeChat.name}</span>
                              <span>{msg.time}</span>
                            </div>
                            <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow ${
                              msg.sender === 'admin' ? 'bg-pink-600 text-white rounded-tr-none' : 'bg-[#16171a] text-slate-200 border border-slate-800 rounded-tl-none'
                            }`}>
                              <p className="break-words">{msg.text}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* ইনপুট বক্স */}
                  <div className="p-3 bg-[#0b0f19] border-t border-slate-800 shrink-0">
                    <div className="bg-[#16171a] rounded-2xl border border-slate-800 p-2.5 space-y-2">
                      <textarea 
                        rows="2"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="Type secure message..."
                        className="w-full bg-transparent text-xs text-white outline-none resize-none"
                      />
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                        <label className="text-slate-400 hover:text-pink-500 cursor-pointer text-xs flex items-center gap-1">
                          <span>📎 Attach</span>
                          <input type="file" multiple className="hidden" onChange={(e) => setAttachedFiles(Array.from(e.target.files))} />
                        </label>
                        <button onClick={handleSendMessage} className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition cursor-pointer">
                          Send
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs p-4 text-center">
                  Select a secure conversation from the left panel.
                </div>
              )}
            </div>

            {/* ৩. ডান পাশের ইউজার প্রোফাইল প্যানেল */}
            {activeChat && (
              <div className="hidden xl:flex flex-col w-[280px] bg-[#0b0f19] p-4 space-y-4 overflow-y-auto shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Credentials</span>
                <div className="flex flex-col items-center text-center space-y-2 pb-4 border-b border-slate-800">
                  <img src={activeChat.avatar} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-slate-700 shadow" />
                  <div>
                    <h3 className="font-bold text-sm">{activeChat.name}</h3>
                    <p className="text-xs text-pink-500 font-bold">{activeChat.username}</p>
                    {activeChat.tgId !== '-' && <p className="text-[11px] font-mono text-emerald-400 mt-0.5">TG ID: {activeChat.tgId}</p>}
                  </div>
                </div>
                <div className="space-y-2 text-xs bg-[#16171a] p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-medium truncate max-w-[150px]">{activeChat.email}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Country:</span>
                    <span>{activeChat.country}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    try {
                      localStorage.setItem('talegig_view_profile_user', JSON.stringify(activeChat));
                      window.location.href = '/superadmin/users';
                    } catch(e) {}
                  }}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-pink-600/20"
                >
                  View Full Profile
                </button>
              </div>
            )}

          </div>
        ) : activeTab === 'liveChat' ? (
          /* ================= LIVE CHAT INTERFACE ================= */
          <div className="w-full h-full min-h-0 flex overflow-hidden">
            <div className={`w-full md:w-[300px] lg:w-[340px] border-r border-slate-800 flex flex-col bg-[#0b0f19] h-full overflow-hidden shrink-0 ${
              activeOrder ? 'hidden md:flex' : 'flex'
            }`}>
              <div className="p-3 border-b border-slate-800 space-y-1 shrink-0">
                <h2 className="text-xs font-bold tracking-tight text-emerald-400 uppercase">Live Chat</h2>
                <p className="text-[10px] text-slate-400">Active orders & deliverables.</p>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 min-h-0">
                {liveOrders.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs italic">
                    No active orders in storage
                  </div>
                ) : (
                  liveOrders.map((ord) => (
                    <div 
                      key={ord.id}
                      onClick={() => setActiveOrder(ord)}
                      className={`p-3.5 cursor-pointer transition space-y-1 ${
                        activeOrder?.id === ord.id ? 'bg-emerald-500/10 border-l-4 border-emerald-500' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono bg-slate-800 text-emerald-400 px-2 py-0.5 rounded">{ord.id}</span>
                        <span className="text-xs font-bold text-emerald-400">{ord.budget}</span>
                      </div>
                      <h4 className="font-bold text-xs truncate text-white">{ord.title}</h4>
                      <p className="text-[11px] text-slate-400">Client: <span className="text-pink-400">{ord.clientName}</span></p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={`flex-1 flex flex-col bg-[#0b0f19] h-full min-h-0 overflow-hidden border-r border-slate-800 ${
              !activeOrder ? 'hidden md:flex' : 'flex'
            }`}>
              {activeOrder ? (
                <div className="flex flex-col h-full min-h-0 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-[#0b0f19] shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <button 
                        onClick={() => setActiveOrder(null)} 
                        className="md:hidden text-xs text-emerald-400 font-bold p-1.5 bg-[#16171a] border border-slate-800 rounded-lg shrink-0 cursor-pointer"
                      >
                        ← Back
                      </button>
                      <img src={activeOrder.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-emerald-500/50 shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 truncate">
                          <span className="truncate">{activeOrder.title}</span> 
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Client: {activeOrder.clientName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-5 space-y-4">
                    {currentLiveMsgs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs italic space-y-1">
                        <p>Live workspace session active for {activeOrder.id}.</p>
                      </div>
                    ) : (
                      currentLiveMsgs.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                              <span className="font-bold text-emerald-400">{msg.sender === 'admin' ? 'Admin / Support' : activeOrder.clientName}</span>
                              <span>{msg.time}</span>
                            </div>
                            <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow ${
                              msg.sender === 'admin' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-[#16171a] text-slate-200 border border-slate-800 rounded-tl-none'
                            }`}>
                              <p className="break-words">{msg.text}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-3 bg-[#0b0f19] border-t border-slate-800 shrink-0">
                    <div className="bg-[#16171a] rounded-2xl border border-slate-800 p-2.5 space-y-2">
                      <textarea 
                        rows="2"
                        value={liveInputText}
                        onChange={(e) => setLiveInputText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendLiveMessage(); } }}
                        placeholder="Type live milestone message..."
                        className="w-full bg-transparent text-xs text-white outline-none resize-none"
                      />
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-400 hidden sm:inline">Workspace Stream</span>
                        <button onClick={handleSendLiveMessage} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition cursor-pointer">
                          Send Live Msg
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs p-4 text-center">
                  No active order selected
                </div>
              )}
            </div>

            {activeOrder && (
              <div className="hidden xl:flex flex-col w-[280px] bg-[#0b0f19] p-4 space-y-4 overflow-y-auto shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Specifications</span>
                <div className="bg-[#16171a] p-3.5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gig Title:</span>
                    <p className="font-bold text-white mt-0.5">{activeOrder.title}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Client Requirements:</span>
                    <p className="text-slate-300 mt-0.5 bg-slate-900/50 p-2 rounded-xl text-[11px]">{activeOrder.requirements}</p>
                  </div>
                  <div className="flex justify-between py-1 border-t border-slate-800">
                    <span className="text-slate-400">Budget:</span>
                    <span className="font-bold text-emerald-400">{activeOrder.budget}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= 📁 PROJECT TAB INTERFACE (নতুন যুক্ত করা প্রজেক্ট ট্যাব) ================= */
          <div className="w-full h-full min-h-0 flex overflow-hidden">
            {/* প্রজেক্ট লিস্ট বাম পাশ */}
            <div className={`w-full md:w-[320px] lg:w-[360px] border-r border-slate-800 flex flex-col bg-[#0b0f19] h-full overflow-hidden shrink-0 ${
              activeProject ? 'hidden md:flex' : 'flex'
            }`}>
              <div className="p-3 border-b border-slate-800 space-y-1 shrink-0">
                <h2 className="text-xs font-bold tracking-tight text-blue-400 uppercase">Buyer Projects Requests</h2>
                <p className="text-[10px] text-slate-400">Projects submitted by clients from home page.</p>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 min-h-0">
                {adminProjects.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs italic">
                    No project requests found in database.
                  </div>
                ) : (
                  adminProjects.map((proj) => (
                    <div 
                      key={proj.id}
                      onClick={() => setActiveProject(proj)}
                      className={`p-3.5 cursor-pointer transition space-y-1.5 ${
                        activeProject?.id === proj.id ? 'bg-blue-600/10 border-l-4 border-blue-500' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-800/50">{proj.category}</span>
                        <span className="text-xs font-bold text-pink-500">{proj.budget} {proj.currency}</span>
                      </div>
                      <h4 className="font-bold text-xs truncate text-white">{proj.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">By: <span className="text-blue-300">{proj.authorName}</span></p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* প্রজেক্ট ডিটেইলস ডান পাশ */}
            <div className={`flex-1 flex flex-col bg-[#0b0f19] h-full min-h-0 overflow-hidden ${
              !activeProject ? 'hidden md:flex' : 'flex'
            }`}>
              {activeProject ? (
                <div className="flex flex-col h-full min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                      <button 
                        onClick={() => setActiveProject(null)} 
                        className="md:hidden text-xs text-blue-400 font-bold p-1.5 bg-[#16171a] border border-slate-800 rounded-lg mb-2 cursor-pointer"
                      >
                        ← Back to Projects
                      </button>
                      <span className="text-xs font-mono text-blue-400 bg-blue-950 px-2.5 py-1 rounded-md border border-blue-800/40">ID: {activeProject.id}</span>
                      <h2 className="text-lg sm:text-xl font-bold text-white mt-2">{activeProject.title}</h2>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Proposed Budget</span>
                      <span className="text-base sm:text-lg font-black text-pink-500">{activeProject.budget} {activeProject.currency}</span>
                    </div>
                  </div>

                  <div className="space-y-4 bg-[#16171a] p-4 sm:p-6 rounded-2xl border border-slate-800">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Description / Details</h3>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">{activeProject.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                        <span className="text-[10px] text-slate-400 block">Client / Author</span>
                        <span className="text-xs font-bold text-white">{activeProject.authorName}</span>
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                        <span className="text-[10px] text-slate-400 block">Category</span>
                        <span className="text-xs font-bold text-blue-400">{activeProject.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button 
                      onClick={() => alert(`Project ${activeProject.id} approved and marked active!`)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-600/20"
                    >
                      Approve & Publish Project
                    </button>
                    <button 
                      onClick={() => {
                        try {
                          localStorage.setItem('talegig_active_chat', activeProject.authorName);
                          setActiveTab('chat');
                        } catch(e) {}
                      }}
                      className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-pink-600/20"
                    >
                      Chat with Client
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs p-4 text-center">
                  Select a project from the left panel to review details.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}