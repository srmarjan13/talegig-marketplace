import React, { useState, useEffect } from 'react';
import { useToast } from '../Home/ToastContext';

const CommunityFeed = ({ currentUser, userRole = 'seller' }) => {
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('talegig_community_posts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { 
        id: 1, 
        userId: currentUser?.id || 'user-1',
        user: currentUser?.name || "Saidur Rahman", 
        role: userRole || 'seller',
        text: "Just completed a new minimalist vector branding project! 🚀", 
        color: "bg-purple-600",
        image: null,
        status: 'approved',
        likes: 16, 
        liked: false, 
        comments: [{ user: "Rahman", text: "Looks amazing!" }] 
      }
    ];
  });

  const [stories, setStories] = useState(() => {
    try {
      const saved = localStorage.getItem('talegig_community_stories');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [selectedColor, setSelectedColor] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [activeStory, setActiveStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showMenuId, setShowMenuId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('talegig_community_posts', JSON.stringify(posts));
    } catch (e) {}
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem('talegig_community_stories', JSON.stringify(stories));
    } catch (e) {}
  }, [stories]);

  useEffect(() => {
    let timer;
    if (activeStory) {
      timer = setTimeout(() => {
        if (currentStoryIndex < activeStory.items.length - 1) {
          setCurrentStoryIndex(prev => prev + 1);
        } else {
          setActiveStory(null);
          setCurrentStoryIndex(0);
        }
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [activeStory, currentStoryIndex]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(URL.createObjectURL(file));
    }
  };

  const handlePost = () => {
    if (!postText.trim() && !selectedColor && !postImage) return;

    const userName = currentUser?.name || "Saidur Rahman";
    const userId = currentUser?.id || 'usr-saidur';

    if (editingId) {
      setPosts(prev => prev.map(p => {
        if (p.id === editingId && (p.userId === userId || p.user === userName)) {
          return { 
            ...p, 
            text: postText, 
            color: selectedColor || p.color, 
            image: postImage || p.image,
            status: 'pending'
          };
        }
        return p;
      }));
      setEditingId(null);
    } else {
      const newPost = {
        id: Date.now(),
        userId: userId,
        user: userName,
        role: userRole,
        text: postText,
        color: selectedColor || "bg-slate-800",
        image: postImage,
        status: 'pending',
        likes: 0,
        liked: false,
        comments: []
      };
      setPosts([newPost, ...posts]);
    }

    setIsModalOpen(false);
    setPostText("");
    setSelectedColor("");
    setPostImage(null);
  };

  const handleDeletePost = (postId, postUserId) => {
    const userName = currentUser?.name || "Saidur Rahman";
    const userId = currentUser?.id || 'usr-saidur';
    if (postUserId !== userId && postUserId !== userName) {
      showToast("You are not authorized to delete this post.",'error');
      return;
    }
    setPosts(posts.filter(p => p.id !== postId));
  };

  const toggleLike = (id) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked } : post
    ));
  };

  const addComment = (id, commentText) => {
    if (!commentText.trim()) return;
    const userName = currentUser?.name || "You";
    setPosts(posts.map(post => 
      post.id === id ? { ...post, comments: [...post.comments, { user: userName, text: commentText }] } : post
    ));
  };

  const userName = currentUser?.name || "Saidur Rahman";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="w-full space-y-6 pb-12">
      
      {/* 1. প্রিমিয়াম 'What's on your mind?' পোস্ট বক্স */}
      <div className="w-full bg-white dark:bg-[#0b0f19] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 text-white font-extrabold flex items-center justify-center shrink-0 shadow-md">
          {userInitial}
        </div>
        <div 
          onClick={() => setIsModalOpen(true)} 
          className="bg-slate-50 dark:bg-[#16171a] border border-slate-200 dark:border-slate-800/80 w-full rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:border-pink-500/50 transition-all font-medium"
        >
          {userRole === 'seller' ? "Share your work progress or thoughts..." : "Post a community update or requirement..."}
        </div>
        
        {/* ফিক্সড SVG গ্যালারি আইকন */}
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-emerald-500 hover:scale-105 transition-transform cursor-pointer shrink-0"
          title="Upload Photo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="m21 15-5-5L5 21"/>
          </svg>
        </button>
      </div>

      {/* 2. স্টোরি ট্রে */}
      <div className="w-full flex gap-3 overflow-x-auto py-2 scrollbar-hide">
        <div className="flex flex-col items-center cursor-pointer relative shrink-0">
          <input 
            type="file" 
            id="storyUpload" 
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const newStoryItem = { id: Date.now(), img: URL.createObjectURL(file), createdAt: Date.now() };
                setStories(prev => {
                  const existingUserIndex = prev.findIndex(g => g.user === userName);
                  if (existingUserIndex !== -1) {
                    const updated = [...prev];
                    updated[existingUserIndex] = {
                      ...updated[existingUserIndex],
                      items: [...updated[existingUserIndex].items, newStoryItem]
                    };
                    return updated;
                  } else {
                    return [...prev, { user: userName, items: [newStoryItem] }];
                  }
                });
              }
            }} 
          />
          <label htmlFor="storyUpload" className="w-28 h-44 rounded-2xl bg-white dark:bg-[#0b0f19] border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center hover:border-pink-600 transition-all cursor-pointer shadow-sm">
            <span className="text-2xl font-extrabold text-pink-600 bg-pink-500/10 w-9 h-9 rounded-full flex items-center justify-center mb-1">+</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center px-1">Add Story</span>
          </label>
        </div>

        {stories.filter(g => g.items?.length > 0).map((group) => (
          <div 
            key={group.user} 
            onClick={() => { setActiveStory(group); setCurrentStoryIndex(0); }} 
            className="relative w-28 h-44 rounded-2xl overflow-hidden shrink-0 cursor-pointer border border-slate-200 dark:border-slate-800 shadow-md group"
          >
            <img src={group.items[group.items.length - 1].img} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="Story" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div className="absolute top-2.5 right-2.5 bg-pink-600 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold shadow">
              {group.items.length} {group.items.length > 1 ? 'Stories' : 'Story'}
            </div>

            <p className="absolute bottom-2.5 left-2.5 text-white font-extrabold text-xs truncate w-[85%] drop-shadow">
              {group.user}
            </p>
          </div>
        ))}
      </div>

      {/* 3. ফেসবুক স্টাইল ফুল-স্ক্রিন স্টোরি মোডাল */}
      {activeStory && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-md h-[85vh] sm:h-[90vh] flex flex-col justify-between bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
            
            <div className="absolute top-3 left-3 right-3 z-20 flex gap-1.5">
              {activeStory.items.map((_, index) => (
                <div key={index} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-pink-500 transition-all duration-300 ease-linear ${
                      index < currentStoryIndex ? "w-full" : index === currentStoryIndex ? "w-full animate-pulse" : "w-0"
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="absolute top-6 left-4 right-4 z-20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-xs shadow">
                  {activeStory.user.charAt(0)}
                </div>
                <span className="text-white font-bold text-sm drop-shadow">{activeStory.user}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveStory(null); setCurrentStoryIndex(0); }} 
                className="text-white text-2xl font-bold bg-black/40 hover:bg-black/70 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
              >✕</button>
            </div>

            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img 
                src={activeStory.items[currentStoryIndex].img} 
                className="w-full h-full object-contain" 
                alt="Story content" 
              />
            </div>

            <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
              <button 
                className="pointer-events-auto text-white bg-black/30 hover:bg-black/60 p-3 rounded-full ml-2 transition shadow cursor-pointer"
                onClick={(e) => { e.stopPropagation(); if(currentStoryIndex > 0) setCurrentStoryIndex(currentStoryIndex - 1); }}
              >❮</button>
              <button 
                className="pointer-events-auto text-white bg-black/30 hover:bg-black/60 p-3 rounded-full mr-2 transition shadow cursor-pointer"
                onClick={(e) => { e.stopPropagation(); if(currentStoryIndex < activeStory.items.length - 1) setCurrentStoryIndex(currentStoryIndex + 1); }}
              >❯</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Posts Feed */}
      <div className="w-full space-y-6">
        {posts
          .filter(post => post.status === 'approved' || post.userId === (currentUser?.id || 'usr-saidur') || post.user === userName)
          .map((post) => (
          <div key={post.id} className="w-full bg-white dark:bg-[#0b0f19] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative transition-all">
            
            {post.status === 'pending' && (
              <div className="mb-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center justify-between">
                <span>⏳ Pending Admin Review (Only visible to you until approved)</span>
              </div>
            )}

            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  {post.user.charAt(0)}
                </div>
                <div>
                  <p className="font-extrabold text-sm">{post.user}</p>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-500 uppercase">
                    {post.role || 'seller'}
                  </span>
                </div>
              </div>

              {(post.userId === (currentUser?.id || 'usr-saidur') || post.user === userName) && (
                <div className="relative">
                  <button 
                    onClick={() => setShowMenuId(showMenuId === post.id ? null : post.id)} 
                    className="text-lg font-extrabold px-2 py-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    ⋮
                  </button>
                  
                  {showMenuId === post.id && (
                    <div className="absolute right-0 mt-2 bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-36 z-50 overflow-hidden">
                      <button 
                        onClick={() => { setEditingId(post.id); setPostText(post.text); setSelectedColor(post.color); setPostImage(post.image); setIsModalOpen(true); setShowMenuId(null); }} 
                        className="block w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => { handleDeletePost(post.id, post.userId || post.user); setShowMenuId(null); }} 
                        className="block w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {post.text && (
              <div className={`p-8 sm:p-12 ${post.color || 'bg-transparent'} flex items-center justify-center text-lg sm:text-2xl font-black text-white rounded-xl mb-4 shadow-inner text-center`}>
                {post.text}
              </div>
            )}

            {post.image && (
              <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[500px] flex items-center justify-center bg-black/20">
                <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 pb-3 mb-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              <button onClick={() => toggleLike(post.id)} className="cursor-pointer hover:text-pink-600 transition flex items-center gap-1">
                 {post.liked ? "❤️ Liked" : "🤍 Like"} ({post.likes})
              </button>
              <span>💬 {post.comments.length} Comments</span>
            </div>

            <div className="space-y-2 mb-3">
              {post.comments.slice(0, 2).map((c, idx) => (
                <div key={idx} className="flex gap-2">
                  <p className="text-xs bg-slate-50 dark:bg-[#16171a] border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl w-full font-medium">
                    <span className="font-bold text-slate-900 dark:text-white">{c.user}: </span>{c.text}
                  </p>
                </div>
              ))}
            </div>

            <input 
              placeholder="Write a comment..." 
              className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none text-xs sm:text-sm focus:border-pink-500 transition"
              onKeyDown={(e) => { if(e.key === 'Enter') { addComment(post.id, e.target.value); e.target.value = ''; } }}
            />
          </div>
        ))}
      </div>

      {/* 5. Create Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-white">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-extrabold">{editingId ? "Edit Post" : "Create Post"}</h2>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); setPostText(""); setPostImage(null); }} className="text-xl font-bold text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="p-5 space-y-4">
              <textarea 
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none text-sm font-medium resize-none placeholder-slate-400"
                placeholder="What's on your mind?"
                rows="3"
              />

              {postImage && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-40">
                  <img src={postImage} alt="Upload preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setPostImage(null)}
                    className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-red-600"
                  >✕</button>
                </div>
              )}

              <div className="flex items-center justify-between border border-dashed border-slate-300 dark:border-slate-700 p-3 rounded-xl bg-slate-50 dark:bg-[#16171a]">
                <span className="text-xs font-bold text-slate-500">Upload Image / Photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="text-xs cursor-pointer" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 mb-2">Choose Card Background Color:</p>
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  <button 
                    onClick={() => setSelectedColor('')} 
                    className={`w-9 h-9 border border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center shrink-0 cursor-pointer ${selectedColor === '' ? 'ring-2 ring-pink-600' : ''}`}
                  >🚫</button>
                  
                  {['bg-red-500', 'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-pink-600'].map((colorClass) => (
                    <div 
                      key={colorClass}
                      onClick={() => setSelectedColor(colorClass)}
                      className={`w-9 h-9 ${colorClass} rounded-xl cursor-pointer shrink-0 transition-all hover:scale-105 shadow-md ${selectedColor === colorClass ? 'ring-2 ring-white' : ''}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={handlePost}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {editingId ? "UPDATE POST" : "SUBMIT FOR ADMIN REVIEW"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityFeed;