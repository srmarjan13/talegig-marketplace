// client/src/components/Inbox.jsx
import React, { useState, useEffect, useRef } from 'react';
import PrivateNavbar from '../Home/PrivateNavbar';
import CustomOfferModal from '../Home/CustomOfferModal';
import { useToast } from '../Home/ToastContext';

const Inbox = ({ location, hideNavbar = false }) => {
  const [currentUserRole] = useState(() => localStorage.getItem('userRole') || 'buyer');

  // রোল অনুযায়ী সম্পূর্ণ আলাদা লোকালস্টোরেজ কি নির্ধারণ
  const convStorageKey = `talegig_${currentUserRole}_conversations`;
  const msgStorageKey = `talegig_${currentUserRole}_messages`;

  const [conversations, setConversations] = useState(() => {
    try {
      const savedConv = localStorage.getItem(convStorageKey);
      if (savedConv) return JSON.parse(savedConv);
    } catch (e) {}
    return [
      {
        id: 1,
        name: currentUserRole === 'buyer' ? 'George Sameh, George' : 'Client John',
        username: '@georgesameh',
        projectTitle: 'Urgent Logo Re-Design (Delivery within 1 hour)',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        lastMessage: 'You: hello',
        time: 'Thursday',
        unread: 0,
        status: 'online',
        isFavorite: false,
        isGroup: false,
        budget: '$350 USD',
        rating: '4.9',
        totalReviews: 8,
        country: 'United Arab Emirates',
        localTime: '5:36 AM local time',
        totalSpend: '$2,450',
        totalProjects: '12',
        totalHire: '8',
        runningProjects: '1',
        paymentVerified: true,
        memberSince: 'Jan 2024',
        isNewUser: false
      },
      {
        id: 2,
        name: 'Labiba Tarannum',
        username: '@labibatarannum',
        projectTitle: 'Logo Redesign & Manual Vectorization',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        lastMessage: 'Labiba: Take care',
        time: '7/26/26',
        unread: 1,
        status: 'online',
        isFavorite: true,
        isGroup: false,
        budget: '$150 USD',
        rating: '5.0',
        totalReviews: 3,
        country: 'Bangladesh',
        localTime: '7:36 PM local time',
        totalSpend: '$450',
        totalProjects: '3',
        totalHire: '2',
        runningProjects: '0',
        paymentVerified: true,
        memberSince: 'Mar 2025',
        isNewUser: true
      }
    ];
  });

  const [activeTab, setActiveTab] = useState('All');
  const [activeChat, setActiveChat] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const { showToast } = useToast();

  const [messages, setMessages] = useState(() => {
    try {
      const savedMsgs = localStorage.getItem(msgStorageKey);
      if (savedMsgs) return JSON.parse(savedMsgs);
    } catch (e) {}
    return {
      1: [
        { id: 1, sender: 'them', senderName: 'George', text: 'Hello', time: '11:03 AM' },
        { id: 2, sender: 'them', senderName: 'George', text: 'Are you there ?', time: '11:03 AM' },
        { id: 3, sender: 'me', senderName: 'You', text: 'yes', time: '7:20 PM' }
      ],
      2: [
        { id: 1, sender: 'them', senderName: 'Labiba', text: 'Take care', time: '7:26 PM' }
      ]
    };
  });

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [enterToSend, setEnterToSend] = useState(true);
  
  // Group States & Selected Sellers
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [selectedSellers, setSelectedSellers] = useState(['George Sameh, George', 'Labiba Tarannum']);

  const [openAccordions, setOpenAccordions] = useState({
    activity: false,
    search: false,
    profile: false,
    files: false
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  // ১. রোলভিত্তিক আলাদা লোকালস্টোরেজে কনভার্সেশন সেভ করার লজিক
  useEffect(() => {
    try {
      localStorage.setItem(convStorageKey, JSON.stringify(conversations));
    } catch (e) {}
  }, [conversations, convStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(msgStorageKey, JSON.stringify(messages));
    } catch (e) {}
  }, [messages, msgStorageKey]);

  // ২. এডমিন প্যানেল বা রিসেন্ট অ্যাক্টিভিটি থেকে রিয়েল-টাইম চ্যাট রিসিভ করার লজিক
  useEffect(() => {
    const adminNotification = localStorage.getItem('talegig_admin_notification');
    const targetChatUser = localStorage.getItem('talegig_active_chat');

    if (adminNotification || targetChatUser) {
      try {
        const notifData = adminNotification ? JSON.parse(adminNotification) : null;
        const chatId = 'admin_support_chat';
        
        const adminConv = {
          id: chatId,
          name: 'Super Admin (Support)',
          username: '@admin_support',
          projectTitle: notifData ? notifData.message : 'Direct Admin Support',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
          lastMessage: notifData ? notifData.message : 'Hello, how can we help you?',
          time: notifData ? notifData.time : 'Just now',
          unread: 1,
          status: 'online',
          isFavorite: true,
          isGroup: false,
          budget: 'N/A',
          rating: '5.0',
          totalReviews: 1,
          country: 'Admin Hub',
          localTime: 'Local time',
          totalSpend: '$0',
          totalProjects: '1',
          totalHire: '1',
          runningProjects: '1',
          paymentVerified: true,
          memberSince: '2026',
          isNewUser: false
        };

        setConversations(prev => {
          const exists = prev.find(c => c.id === chatId);
          if (exists) {
            return prev.map(c => c.id === chatId ? { ...c, lastMessage: adminConv.lastMessage } : c);
          }
          return [adminConv, ...prev];
        });

        setMessages(prev => {
          const existingMsgs = prev[chatId] || [];
          const newMsgText = notifData ? notifData.message : 'Hello! Admin initiated this chat session with you.';
          
          const alreadyHas = existingMsgs.some(m => m.text === newMsgText);
          if (alreadyHas) return prev;

          const updatedChatMsgs = [
            ...existingMsgs,
            {
              id: Date.now(),
              sender: 'them',
              senderName: 'Super Admin',
              text: newMsgText,
              time: notifData ? notifData.time : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];

          return {
            ...prev,
            [chatId]: updatedChatMsgs
          };
        });

        setActiveChat(adminConv);
        localStorage.removeItem('talegig_admin_notification');
        localStorage.removeItem('talegig_active_chat');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (location?.state?.chatUser) {
      const matched = conversations.find(c => c.name.toLowerCase().includes(location.state.chatUser.toLowerCase()));
      if (matched) setActiveChat(matched);
    } else {
      if (window.innerWidth >= 768 && conversations.length > 0 && !activeChat) {
        setActiveChat(conversations[0]);
      }
    }
  }, [location]);

  const getStatusColor = (status) => {
    if (status === 'online') return 'bg-emerald-500';
    if (status === 'away') return 'bg-amber-400';
    return 'bg-slate-500';
  };

  const toggleAccordion = (section) => {
    setOpenAccordions(prev => {
      const newState = { ...prev, [section]: !prev[section] };
      if (section === 'search' && newState.search) {
        setTimeout(() => {
          const searchInputEl = document.getElementById('chat-search-input');
          searchInputEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
      return newState;
    });
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setConversations(conversations.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles([...attachedFiles, ...files]);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() && attachedFiles.length === 0) return;
    if (!activeChat) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      senderName: 'You',
      text: inputText,
      files: [...attachedFiles],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => {
      const chatMessages = Array.isArray(prev) ? prev : (prev[activeChat.id] || []);
      const updatedChatMsgs = [...chatMessages, newMsg];
      
      const newMessagesState = {
        ...prev,
        [activeChat.id]: updatedChatMsgs
      };

      try {
        localStorage.setItem(msgStorageKey, JSON.stringify(newMessagesState));
      } catch(err){}

      return newMessagesState;
    });

    try {
      const adminSavedMsgs = JSON.parse(localStorage.getItem('talegig_admin_chat_messages') || '{}');
      const adminChatKey = activeChat.id === 'admin_support_chat' ? 'admin_support_chat' : activeChat.id; 
      const existingAdminMsgs = adminSavedMsgs[adminChatKey] || [];
      
      const adminFormattedMsg = {
        id: newMsg.id,
        sender: 'user', 
        text: inputText,
        time: newMsg.time
      };

      adminSavedMsgs[adminChatKey] = [...existingAdminMsgs, adminFormattedMsg];
      localStorage.setItem('talegig_admin_chat_messages', JSON.stringify(adminSavedMsgs));
    } catch(err) {
      console.error(err);
    }

    setInputText('');
    setAttachedFiles([]);
  };

  // 🟢 Custom Offer Handler (চ্যাটবক্স থেকে অফার পাঠানোর লজিক)
  const handleCreateCustomOffer = (newOffer) => {
    if (!activeChat) return;

    const offerMsg = {
      id: Date.now(),
      sender: 'me',
      senderName: 'You',
      isOffer: true,
      offerId: newOffer.id,
      offerTitle: newOffer.title,
      offerAmount: newOffer.price,
      deliveryDays: newOffer.deliveryDays,
      description: newOffer.description,
      status: 'Pending',
      text: `Custom Offer: ${newOffer.title} ($${newOffer.price} USD)`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => {
      const chatMessages = Array.isArray(prev) ? prev : (prev[activeChat.id] || []);
      const updated = {
        ...prev,
        [activeChat.id]: [...chatMessages, offerMsg]
      };
      try {
        localStorage.setItem(msgStorageKey, JSON.stringify(updated));
      } catch(e) {}
      return updated;
    });

    setShowOfferModal(false);
    setShowChatMenu(false);
  };

  // 🟢 কাস্টম অফার এক্সেপ্ট করার লজিক এবং গিগ অর্ডারে সিঙ্ক করা
  const handleAcceptCustomOfferInChat = (msgId) => {
    if (window.confirm('Are you sure you want to accept this custom offer? This will create an active order!')) {
      setMessages(prev => {
        const chatMessages = Array.isArray(prev) ? prev : (prev[activeChat.id] || []);
        const updatedMsgs = chatMessages.map(m => {
          if (m.id === msgId) {
            return { ...m, status: 'Accepted' };
          }
          return m;
        });
        const updatedState = { ...prev, [activeChat.id]: updatedMsgs };
        try {
          localStorage.setItem(msgStorageKey, JSON.stringify(updatedState));
        } catch (e) {}
        return updatedState;
      });

      try {
        const currentMsgs = Array.isArray(messages) ? messages : (messages[activeChat.id] || []);
        const offerMsg = currentMsgs.find(m => m.id === msgId);
        if (offerMsg) {
          const newOrder = {
            id: Date.now(),
            title: offerMsg.offerTitle,
            price: offerMsg.offerAmount,
            deliveryDays: offerMsg.deliveryDays || 3,
            client: activeChat.name,
            status: 'pending',
            createdAt: new Date().toLocaleDateString(),
            chatList: []
          };
          const existingOrders = JSON.parse(localStorage.getItem('talegig_gig_orders') || localStorage.getItem('talegig_orders') || '[]');
          localStorage.setItem('talegig_gig_orders', JSON.stringify([newOrder, ...existingOrders]));
        }
      } catch(e) {}

      showToast('🎉 Custom offer accepted successfully! Order created in All Projects.','success');
    }
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (currentUserRole !== 'buyer') {
      showToast('Only buyers can create group chats.','error');
      return;
    }
    if (!groupName.trim()) return;

    const groupAvatarUrl = groupImage 
      ? URL.createObjectURL(groupImage) 
      : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=200&auto=format&fit=crop';

    const newGroupId = Date.now();

    const newGroup = {
      id: newGroupId,
      name: groupName,
      username: '@group_' + newGroupId,
      projectTitle: 'Group Collaboration',
      avatar: groupAvatarUrl,
      lastMessage: 'Group chat created',
      time: 'Just now',
      unread: 0,
      status: 'online',
      isFavorite: false,
      isGroup: true,
      groupMembers: selectedSellers,
      budget: 'N/A',
      rating: '5.0',
      totalReviews: 1,
      country: 'Global',
      localTime: 'Local time',
      totalSpend: '$0',
      totalProjects: '1',
      totalHire: selectedSellers.length,
      runningProjects: '1',
      paymentVerified: true,
      memberSince: '2026',
      isNewUser: false
    };

    setMessages(prev => ({
      ...prev,
      [newGroupId]: []
    }));

    setConversations([newGroup, ...conversations]);
    setActiveChat(newGroup);
    setShowGroupModal(false);
    setGroupName('');
    setGroupImage(null);
  };

  // Safe message retrieval and filtering
  const currentMessages = activeChat 
    ? (Array.isArray(messages) ? messages : (messages[activeChat.id] || []))
    : [];

  const filteredMessages = currentMessages.filter(msg => 
    msg.text.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.projectTitle.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'Unread') return matchesSearch && c.unread > 0;
    if (activeTab === 'Favorites') return matchesSearch && c.isFavorite;
    if (activeTab === 'Offers') return matchesSearch && c.projectTitle.includes('Offer');
    if (activeTab === 'Saved') return matchesSearch && c.isFavorite;
    return matchesSearch;
  });

  return (
    <div className={`w-full bg-transparent font-sans flex flex-col overflow-hidden ${hideNavbar ? 'h-full' : 'h-screen'}`}>
      {!hideNavbar && <PrivateNavbar />}
      
      <div className={`flex-1 w-full flex overflow-hidden ${hideNavbar ? 'h-full p-0' : 'p-2 sm:p-4 h-[calc(100vh-60px)]'}`}>
        <div className="flex h-full w-full bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative text-sm">
          
          {/* 1. LEFT COLUMN: Conversations List */}
          <div className={`flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] shrink-0 transition-all duration-300 ${
            activeChat ? 'hidden md:flex' : 'flex'
          } ${isSidebarCollapsed ? 'w-20' : 'w-full md:w-[300px] lg:w-[330px]'} h-full overflow-hidden`}>
            
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-[#0b0f19] shrink-0">
              <div className="flex justify-between items-center">
                {!isSidebarCollapsed && (
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Messages</h2>
                )}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowGroupModal(true)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                    title="Create Group"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                  </button>
                  <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    title="Settings"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                  </button>
                  <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="hidden md:flex p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    {isSidebarCollapsed ? '▶' : '◀'}
                  </button>
                </div>
              </div>

              {!isSidebarCollapsed && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {['All', 'Unread', 'Favorites', 'Offers', 'Saved'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        activeTab === tab 
                          ? 'bg-pink-600 text-white shadow-md' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
              {filteredConversations.map((conv) => (
                <div 
                  key={conv.id} 
                  onClick={() => setActiveChat(conv)} 
                  className={`p-3.5 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'items-start gap-3'} cursor-pointer transition-all relative ${
                    activeChat?.id === conv.id 
                      ? 'bg-pink-500/10 border-l-4 border-pink-600' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img src={conv.avatar} className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow" alt="" />
                    <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${getStatusColor(conv.status)} border-2 border-white dark:border-[#0b0f19] rounded-full`}></span>
                  </div>

                  {!isSidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{conv.name}</h4>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={(e) => toggleFavorite(e, conv.id)} 
                            className={`p-1 transition cursor-pointer ${conv.isFavorite ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`}
                            title={conv.isFavorite ? "Unfavorite" : "Favorite"}
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                          </button>
                          <span className="text-[10px] text-slate-400 shrink-0">{conv.time}</span>
                        </div>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate mb-1">{conv.projectTitle}</p>
                      <p className="text-[11px] text-slate-400 truncate">{conv.lastMessage}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. MIDDLE COLUMN: Chat Area */}
          <div className={`flex-1 min-w-0 flex flex-col bg-white dark:bg-[#0b0f19] relative ${activeChat ? 'flex' : 'hidden md:flex'} h-full overflow-hidden border-r border-slate-200 dark:border-slate-800`}>
            {activeChat ? (
              <div className="flex flex-col h-full overflow-hidden">
                
                <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-[#0b0f19] shrink-0">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button onClick={() => setActiveChat(null)} className="md:hidden text-xs text-pink-600 font-bold p-2 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer">
                      ← Back
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{activeChat.name}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                          {activeChat.localTime}
                        </span>
                        <span>•</span>
                        <span className="text-pink-500 font-semibold truncate">{activeChat.projectTitle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 relative">
                    <button 
                      onClick={() => setShowOfferModal(true)} 
                      className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition shadow cursor-pointer flex items-center gap-1.5"
                      title="Create Custom Offer"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                      <span>Offer</span>
                    </button>

                    <div className="relative">
                      <button 
                        onClick={() => setShowChatMenu(!showChatMenu)}
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition cursor-pointer"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                      </button>

                      {showChatMenu && (
                        <div className="absolute right-0 top-11 bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-48 z-50 overflow-hidden py-1.5">
                          <button 
                            onClick={() => { setShowOfferModal(true); setShowChatMenu(false); }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2.5 cursor-pointer"
                          >
                            <svg className="w-4 h-4 text-pink-500 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                            <span>Custom Offer</span>
                          </button>
                          <button 
                            onClick={(e) => { toggleFavorite(e, activeChat.id); setShowChatMenu(false); }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2.5 cursor-pointer"
                          >
                            <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            <span>{activeChat.isFavorite ? 'Unfavorite' : 'Favorite'}</span>
                          </button>
                          <button 
                            onClick={() => { showToast('Chat ended','success'); setShowChatMenu(false); }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2.5 text-amber-500 cursor-pointer"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/></svg>
                            <span>End chat</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages History */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 min-h-0">
                  {filteredMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs italic">
                      No matching messages found.
                    </div>
                  ) : (
                    filteredMessages.map((msg) => (
                      <div key={msg.id} className={`flex gap-3.5 ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <img 
                          src={msg.sender === 'me' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' : activeChat.avatar} 
                          className="w-9 h-9 rounded-full object-cover shrink-0 mt-1 border border-slate-300 dark:border-slate-700" 
                          alt="" 
                        />
                        <div className={`max-w-[78%] space-y-1 ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1 font-medium">
                            <span className="font-bold text-slate-300">{msg.sender === 'me' ? 'You' : activeChat.name}</span>
                            <span>{msg.time}</span>
                          </div>
                          
                          {/* 🟢 Custom Offer Card Render inside Chat Box */}
                          {msg.isOffer ? (
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white space-y-3 shadow-md">
                              <div className="flex justify-between items-center border-b border-white/20 pb-2">
                                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">📦 Custom Milestone Offer</span>
                                <span className="text-base font-black">${msg.offerAmount} USD</span>
                              </div>
                              <div>
                                <h5 className="font-extrabold text-sm">{msg.offerTitle}</h5>
                                {msg.description && <p className="text-xs opacity-90 mt-1">{msg.description}</p>}
                                <p className="text-[11px] opacity-80 mt-1">Delivery Time: {msg.deliveryDays || 3} Days</p>
                              </div>
                              <div className="pt-1 flex justify-end">
                                {msg.status === 'Accepted' ? (
                                  <span className="bg-white text-emerald-600 font-extrabold text-xs px-4 py-2 rounded-xl">Accepted ✓</span>
                                ) : msg.sender === 'me' ? (
                                  <span className="text-xs font-bold bg-black/20 px-3 py-1.5 rounded-xl">Pending Acceptance</span>
                                ) : (
                                  <button 
                                    onClick={() => handleAcceptCustomOfferInChat(msg.id)}
                                    className="bg-white hover:bg-slate-100 text-purple-700 font-extrabold text-xs px-5 py-2 rounded-xl shadow cursor-pointer transition"
                                  >
                                    Accept Offer
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className={`p-3.5 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed ${
                              msg.sender === 'me' 
                                ? 'bg-pink-600 text-white rounded-tr-sm' 
                                : 'bg-slate-100 dark:bg-[#16171a] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-sm'
                            }`}>
                              <p className="leading-relaxed">{msg.text}</p>
                            </div>
                          )}

                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white dark:bg-[#0b0f19] border-t border-slate-200 dark:border-slate-800 shrink-0">
                  <div className="bg-slate-50 dark:bg-[#16171a] rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-inner space-y-2">
                    <textarea 
                      rows="2"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => { 
                        if (e.key === 'Enter' && !e.shiftKey && enterToSend) { 
                          e.preventDefault(); 
                          handleSendMessage(); 
                        } 
                      }}
                      placeholder="Type a message..." 
                      className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none resize-none font-medium"
                    />

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <label className="text-slate-400 hover:text-pink-500 transition cursor-pointer p-1" title="Attach file">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
                          <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                        </label>
                      </div>

                      <button 
                        onClick={handleSendMessage}
                        className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-xl transition shadow cursor-pointer flex items-center justify-center"
                        title="Send message"
                      >
                        <svg className="w-4 h-4 fill-current transform rotate-90" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                <svg className="w-12 h-12 fill-current opacity-40" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
                <p className="text-base font-semibold">Select a conversation</p>
              </div>
            )}
          </div>

          {/* 3. RIGHT COLUMN: Dynamic Profile & Timeline Panel with SVG Collapse/Expand */}
          {activeChat && (
            <div className={`hidden lg:flex flex-col bg-white dark:bg-[#0b0f19] transition-all duration-300 shrink-0 border-l border-slate-200 dark:border-slate-800 relative overflow-hidden h-full ${
              isRightCollapsed ? 'w-20 items-center py-4' : 'w-[280px] xl:w-[320px] p-4 space-y-4 overflow-y-auto'
            }`}>
              
              {/* Collapsed State View (Showing left-pointing SVG expand icon) */}
              {isRightCollapsed ? (
                <div className="flex flex-col items-center space-y-6 w-full">
                  <button 
                    onClick={() => setIsRightCollapsed(false)}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition cursor-pointer shadow flex items-center justify-center"
                    title="Expand Panel"
                  >
                    <svg className="w-4 h-4 fill-current transform rotate-180" viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
                  </button>
                  <div className="relative cursor-pointer" onClick={() => setIsRightCollapsed(false)} title="Client Profile">
                    <img src={activeChat.avatar} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-slate-700 shadow" />
                    <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${getStatusColor(activeChat.status)} border-2 border-white dark:border-[#0b0f19] rounded-full`}></span>
                  </div>
                </div>
              ) : (
                /* Expanded State View */
                <>
                  <div className="flex justify-between items-center -mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Details</span>
                    <button 
                      onClick={() => setIsRightCollapsed(true)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title="Close Panel"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-2 pt-1 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="relative">
                      <img src={activeChat.avatar} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-slate-700 shadow-md" />
                      <span className={`absolute bottom-0 right-1 w-4 h-4 ${getStatusColor(activeChat.status)} border-2 border-white dark:border-[#0b0f19] rounded-full`}></span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{activeChat.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">George</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-1">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                        <span>{activeChat.localTime}</span>
                      </p>
                    </div>
                    <button onClick={() => showToast('View Project','success')} className="mt-2 bg-pink-600/10 hover:bg-pink-600/20 text-pink-600 dark:text-pink-400 border border-pink-500/30 font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                      <span>View Project</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    
                    {/* 1. Project Activity (Default closed) */}
                    <div className="bg-slate-50 dark:bg-[#16171a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                      <button onClick={() => toggleAccordion('activity')} className="w-full flex justify-between items-center p-3.5 font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-slate-400 fill-current" viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
                          <span>Project Activity</span>
                        </div>
                        <span>{openAccordions.activity ? '▲' : '▼'}</span>
                      </button>
                      {openAccordions.activity && (
                        <div className="p-4 pt-1 border-t border-slate-200 dark:border-slate-800/60 max-h-64 overflow-y-auto custom-scrollbar">
                          {activeChat.isNewUser ? (
                            <p className="italic text-slate-400 text-xs py-2">New user. No project activity started yet.</p>
                          ) : (
                            <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-[1.5px] before:bg-slate-300 dark:before:bg-slate-700 mt-3">
                              <div className="relative flex items-start gap-3">
                                <span className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-white dark:bg-[#16171a] border-2 border-emerald-500 flex items-center justify-center text-[10px] text-emerald-500 font-bold shrink-0">✓</span>
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Contract started</p>
                                  <p className="text-[11px] text-slate-500 mt-0.5">Oct 24</p>
                                </div>
                              </div>
                              <div className="relative flex items-start gap-3">
                                <span className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-white dark:bg-[#16171a] border-2 border-emerald-500 flex items-center justify-center text-[10px] text-emerald-500 font-bold shrink-0">✓</span>
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                    Milestone 1 completed <span className="ml-1.5 inline-block bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md align-middle">$10.00 Paid</span>
                                  </p>
                                  <p className="text-[11px] text-slate-500 mt-0.5">Approved Oct 27</p>
                                </div>
                              </div>
                              <div className="relative flex items-start gap-3">
                                <span className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-white dark:bg-[#16171a] border-2 border-slate-400 dark:border-slate-500 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-300 font-bold shrink-0">✓</span>
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Contract ended</p>
                                  <p className="text-[11px] text-slate-500 mt-0.5">Oct 27</p>
                                </div>
                              </div>
                              <div className="relative flex items-start gap-3">
                                <span className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-white dark:bg-[#16171a] border-2 border-slate-400 dark:border-slate-500 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-300 font-bold shrink-0">✓</span>
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Feedback given</p>
                                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Total score 5</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 2. Search messages (Fully dynamic) */}
                    <div className="bg-slate-50 dark:bg-[#16171a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                      <button onClick={() => toggleAccordion('search')} className="w-full flex justify-between items-center p-3.5 font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-slate-400 fill-current" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                          <span>Search messages</span>
                        </div>
                        <span>{openAccordions.search ? '▲' : '▼'}</span>
                      </button>
                      {openAccordions.search && (
                        <div className="p-3.5 pt-0 border-t border-slate-200 dark:border-slate-800/60">
                          <input 
                            id="chat-search-input" 
                            type="text" 
                            value={chatSearchQuery}
                            onChange={(e) => setChatSearchQuery(e.target.value)}
                            placeholder="Search in chat..." 
                            className="w-full bg-white dark:bg-[#0b0f19] p-2.5 rounded-xl text-xs outline-none text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-2 focus:border-pink-500 transition-all" 
                          />
                        </div>
                      )}
                    </div>

                    {/* 3. Client profile */}
                    <div id="client-profile-section" className="bg-slate-50 dark:bg-[#16171a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                      <button 
                        onClick={() => {
                          toggleAccordion('profile');
                          setTimeout(() => {
                            document.getElementById('client-profile-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        }} 
                        className="w-full flex justify-between items-center p-3.5 font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-slate-400 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
                          <span>Client profile</span>
                        </div>
                        <span>{openAccordions.profile ? '▲' : '▼'}</span>
                      </button>

                      {openAccordions.profile && (
                        <div className="p-4 pt-1 border-t border-slate-200 dark:border-slate-800/60 space-y-4 text-xs">
                          
                          <div className="flex items-center gap-3 pt-2">
                            <div className="relative shrink-0">
                              <img src={activeChat.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-700 shadow" />
                              <span className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(activeChat.status)} border-2 border-white dark:border-[#0b0f19] rounded-full`}></span>
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{activeChat.name}</h4>
                              <p className="text-[11px] text-amber-500 font-bold flex items-center gap-1 mt-0.5">
                                <span>★ {activeChat.rating}</span> 
                                <span className="text-slate-400 font-normal">({activeChat.totalReviews} reviews)</span>
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="bg-white dark:bg-[#0b0f19] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                              <p className="font-black text-base text-slate-900 dark:text-white tracking-tight">{activeChat.totalSpend}</p>
                              <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-wider whitespace-nowrap">Total Spend</p>
                            </div>
                            <div className="bg-white dark:bg-[#0b0f19] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                              <p className="font-black text-base text-slate-900 dark:text-white tracking-tight">{activeChat.totalHire}</p>
                              <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-wider whitespace-nowrap">Total Hire</p>
                            </div>
                            <div className="bg-white dark:bg-[#0b0f19] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                              <p className="font-black text-base text-slate-900 dark:text-white tracking-tight">{activeChat.totalProjects}</p>
                              <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-wider whitespace-nowrap">Projects Posted</p>
                            </div>
                            <div className="bg-white dark:bg-[#0b0f19] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                              <p className="font-black text-base text-slate-900 dark:text-white tracking-tight">{activeChat.runningProjects}</p>
                              <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-wider whitespace-nowrap">Running Projects</p>
                            </div>
                          </div>

                          <div className="space-y-2.5 text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                            {activeChat.paymentVerified ? (
                              <div className="flex items-center gap-2.5 font-bold text-emerald-500">
                                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                <span>Payment method verified</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2.5 font-bold text-amber-500">
                                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                                <span>Payment method unverified</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium">
                              <svg className="w-4 h-4 text-slate-400 fill-current shrink-0" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                              <span>{activeChat.country}</span>
                            </div>

                            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium">
                              <svg className="w-4 h-4 text-slate-400 fill-current shrink-0" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                              <span>{activeChat.localTime}</span>
                            </div>

                            <div className="text-slate-400 text-[11px] pt-1 font-medium">
                              Member since {activeChat.memberSince}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>

                    {/* 4. File and Link */}
                    <div className="bg-slate-50 dark:bg-[#16171a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                      <button onClick={() => toggleAccordion('files')} className="w-full flex justify-between items-center p-3.5 font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-slate-400 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                          <span>File and Link ({attachedFiles.length})</span>
                        </div>
                        <span>{openAccordions.files ? '▲' : '▼'}</span>
                      </button>
                      {openAccordions.files && (
                        <div className="p-3.5 pt-0 text-slate-600 dark:text-slate-400 text-[11px] space-y-2 border-t border-slate-200 dark:border-slate-800/60 mt-2 max-h-40 overflow-y-auto">
                          {attachedFiles.length === 0 ? (
                            <p className="italic text-slate-400 text-center py-2">No files shared in this chat yet.</p>
                          ) : (
                            attachedFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-white dark:bg-[#0b0f19] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                  <svg className="w-4 h-4 text-pink-500 fill-current shrink-0" viewBox="0 0 24 24"><path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/></svg>
                                  <span className="truncate max-w-[150px] font-medium text-slate-700 dark:text-slate-200">{file.name}</span>
                                </div>
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold shrink-0">Attached</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 rounded-3xl shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base">Chat Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">✕</button>
            </div>
            <div className="space-y-4 py-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold">Press Enter to Send Message</span>
                <input 
                  type="checkbox" 
                  checked={enterToSend} 
                  onChange={() => setEnterToSend(!enterToSend)}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer" 
                />
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setShowSettingsModal(false)} className="bg-pink-600 text-white font-bold text-xs px-5 py-2 rounded-xl cursor-pointer">Save Settings</button>
            </div>
          </div>
        </div>
      )}

     {/* Create Group Modal with Name, Profile Pic & User Search/Add */}
{showGroupModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-3xl shadow-2xl space-y-4 text-slate-900 dark:text-white">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="font-bold text-base">Create Group Chat</h3>
        <button onClick={() => setShowGroupModal(false)} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">✕</button>
      </div>

      <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-slate-600 dark:text-slate-300">Group Name</label>
          <input 
            type="text" 
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. Design Team Sync" 
            className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-pink-500"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-600 dark:text-slate-300">Group Profile Picture (Optional)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setGroupImage(e.target.files[0]);
              }
            }} 
            className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700 cursor-pointer"
          />
        </div>

        {/* ইউজারনেম বা নাম অনুযায়ী মেম্বার সিলেক্ট করার সেকশন */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-600 dark:text-slate-300">Add Members (Sellers)</label>
          <div className="bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-2 max-h-36 overflow-y-auto">
            {['George Sameh, George', 'Labiba Tarannum', 'Rahim Ahmed', 'Karim Uddin'].map((seller, idx) => (
              <label key={idx} className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition">
                <input 
                  type="checkbox" 
                  checked={selectedSellers.includes(seller)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSellers([...selectedSellers, seller]);
                    } else {
                      setSelectedSellers(selectedSellers.filter(s => s !== seller));
                    }
                  }}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
                <span className="font-medium text-slate-700 dark:text-slate-200">{seller}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => setShowGroupModal(false)} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl cursor-pointer">Cancel</button>
          <button type="submit" className="bg-pink-600 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">Create Group</button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Custom Offer Modal Integration */}
      <CustomOfferModal 
        isOpen={showOfferModal} 
        onClose={() => setShowOfferModal(false)} 
        targetName={activeChat?.name} 
        senderRole={currentUserRole}
        onOfferCreated={handleCreateCustomOffer} 
      />
    </div>
  );
};

export default Inbox;