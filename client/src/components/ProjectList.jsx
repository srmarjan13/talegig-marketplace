// client/src/components/ProjectList.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const ProjectList = ({ projects: initialProjects = [] }) => {
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDrawer, setShowProjectDrawer] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState('info');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProject, setTempProject] = useState(null);
  const [messages, setMessages] = useState([{ id: 1, sender: 'John Doe', text: 'হ্যালো, প্রজেক্টের কাজ কতদূর?' }]);
  const [newMessage, setNewMessage] = useState('');

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowProjectDrawer(true);
    setActiveDetailsTab('info');
    setIsStatusOpen(false);
  };

  const startEditing = () => {
    setTempProject(selectedProject);
    setIsEditing(true);
  };

  const saveChanges = () => {
    setSelectedProject(tempProject);
    // মেইন লিস্ট বা লোকালস্টোরেজ আপডেট করার লজিক
    const updatedProjects = projects.map(p => 
      p.id === tempProject.id ? tempProject : p
    );
    setProjects(updatedProjects);
    try {
      localStorage.setItem('talegig_projects', JSON.stringify(updatedProjects));
    } catch (e) {}
    setIsEditing(false);
  };

  const updateProjectStatus = (projectId, newStatus) => {
    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, status: newStatus } : p
    );
    
    setProjects(updatedProjects);
    setSelectedProject({ ...selectedProject, status: newStatus });
    
    try {
      localStorage.setItem('talegig_projects', JSON.stringify(updatedProjects));
    } catch (e) {}
  };

  const glassStyle = "bg-white/70 dark:bg-[#1a202c]/70 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl";

  return (
    <div className={`${glassStyle} p-6 rounded-2xl`}>
      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Project List</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 text-xs uppercase tracking-wider">
              <th className="pb-3 px-2">Project Name</th>
              <th className="pb-3 px-2">Budget</th>
              <th className="pb-3 px-2">Status</th>
              <th className="pb-3 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs sm:text-sm">
            {projects.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-400 italic">No projects found.</td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="text-gray-700 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition">
                  <td className="py-4 px-2 font-bold">{project.title || project.name}</td>
                  <td className="py-4 px-2 font-mono">{typeof project.budget === 'number' ? `$${project.budget}` : project.budget}</td>
                  <td className="py-4 px-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      {project.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <button onClick={() => handleViewProject(project)} className="text-blue-600 dark:text-blue-400 hover:underline font-bold">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* প্রজেক্ট ডিটেইলস ড্রয়ার (Portal সহ) */}
      {showProjectDrawer && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div onClick={() => setShowProjectDrawer(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* মূল ড্রয়ার */}
          <div className={`relative w-full max-w-[450px] ${glassStyle} h-full p-6 sm:p-8 shadow-2xl flex flex-col z-10`}>
            
            {/* হেডার */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-white/10 pb-4">
              <h2 className="text-xl font-black text-gray-800 dark:text-white">Project Details</h2>
              <button onClick={() => setShowProjectDrawer(false)} className="text-gray-500 dark:text-white/60 font-bold p-1 cursor-pointer">✕</button>
            </div>

            {/* ট্যাব বাটনসমূহ */}
            <div className="flex border-b border-gray-200 dark:border-white/10 mb-6">
              <button 
                onClick={() => setActiveDetailsTab('info')} 
                className={`pb-2 mr-6 font-bold text-xs sm:text-sm cursor-pointer ${activeDetailsTab === 'info' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}
              >
                Info
              </button>
              <button 
                onClick={() => setActiveDetailsTab('chat')} 
                className={`pb-2 font-bold text-xs sm:text-sm cursor-pointer ${activeDetailsTab === 'chat' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}
              >
                Discussion
              </button>
            </div>
            
            {/* ড্রয়ারের কন্টেন্ট এরিয়া */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-6">
              {activeDetailsTab === 'info' ? (
                <div className="space-y-6">
                  {isEditing ? (
                    /* এডিট মোড */
                    <div className="space-y-4 bg-gray-50 dark:bg-[#252c38] p-5 rounded-2xl border border-gray-200 dark:border-white/10">
                      <label className="text-xs font-bold text-gray-400 uppercase">Project Title</label>
                      <input 
                        value={tempProject?.title || tempProject?.name || ''} 
                        onChange={(e) => setTempProject({...tempProject, title: e.target.value, name: e.target.value})}
                        className="w-full p-3 rounded-xl border dark:bg-[#1a202c] dark:border-white/10 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-bold"
                      />
                      <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                      <textarea 
                        value={tempProject?.description || ""} 
                        onChange={(e) => setTempProject({...tempProject, description: e.target.value})}
                        className="w-full p-3 rounded-xl border dark:bg-[#1a202c] dark:border-white/10 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 h-32 text-xs sm:text-sm"
                      />
                      <div className="flex gap-3 pt-2">
                        <button onClick={saveChanges} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs cursor-pointer transition">Save Changes</button>
                        <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-500/20 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-bold text-xs cursor-pointer transition">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* ভিউ মোড */
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-blue-600/10 to-transparent p-5 rounded-2xl border-l-4 border-blue-600">
                        <h3 className="text-xl font-black text-gray-800 dark:text-white mb-1">{selectedProject?.title || selectedProject?.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: PRJ-2026-00{selectedProject?.id}</p>
                      </div>
                      
                      <div className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase">Description</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{selectedProject?.description || "No description provided."}</p>
                      </div>

                      <button 
                        onClick={startEditing}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white rounded-xl font-bold text-xs sm:text-sm hover:border-blue-500 transition-all cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        Edit Project Details
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* চ্যাট ইন্টারফেস */
                <div className="flex flex-col h-full space-y-4">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`p-3.5 rounded-2xl max-w-[85%] text-xs sm:text-sm ${
                          msg.sender === 'You' 
                            ? 'bg-blue-600 text-white ml-auto' 
                            : 'bg-gray-100 dark:bg-[#252c38] text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <p className="font-bold text-[10px] mb-1 opacity-70">{msg.sender}</p>
                        <p>{msg.text}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t dark:border-white/10">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..." 
                      className="flex-1 p-3 rounded-xl border dark:bg-[#1a202c] dark:border-white/10 dark:text-white text-xs sm:text-sm outline-none" 
                    />
                    <button 
                      onClick={() => {
                        if(newMessage.trim() !== '') {
                          setMessages([...messages, { id: Date.now(), sender: 'You', text: newMessage }]);
                          setNewMessage('');
                        }
                      }}
                      className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-xs cursor-pointer hover:bg-blue-700 transition"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
                
            {/* ফুটার সেকশন (স্ট্যাটাস ড্রপডাউন ও চ্যাট বাটন) */}
            <div className="mt-6 border-t border-gray-200 dark:border-white/15 pt-4 relative">
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsStatusOpen(!isStatusOpen)} 
                  className={`flex-[2] py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between px-4 transition cursor-pointer ${
                    isStatusOpen ? 'bg-blue-700 text-white' : 'bg-gray-100 dark:bg-[#252c38] text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <span>{selectedProject?.status || 'Select Status'}</span>
                  <svg className={`w-4 h-4 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </button>

                <button 
                  onClick={() => setActiveDetailsTab('chat')} 
                  className="flex-1 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-200 font-bold text-xs sm:text-sm hover:bg-gray-50 dark:hover:bg-[#252c38] transition cursor-pointer"
                >
                  Chat
                </button>
              </div>

              {/* স্ট্যাটাস ড্রপডাউন মেনু */}
              {isStatusOpen && (
                <div className="absolute bottom-16 left-0 w-full bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-1 z-50">
                  {['Active', 'Pending', 'Completed', 'On Hold'].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => {
                        updateProjectStatus(selectedProject.id, s);
                        setIsStatusOpen(false);
                      }} 
                      className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
                        selectedProject?.status === s 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-100 dark:hover:bg-white/5 dark:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProjectList;