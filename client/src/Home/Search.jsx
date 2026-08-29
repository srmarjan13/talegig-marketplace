import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const category = searchParams.get('category') || "All Categories";
  const tab = searchParams.get('tab') || "top-talents"; // ডিফল্ট ট্যাব

  // ডেমো টপ ফ্রিল্যান্সার ডেটা (৮ জন)
  const topFreelancers = [
    { id: 1, name: "Alessandro G.", role: "Lead Brand Designer", rating: 5.0, reviews: 42, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60" },
    { id: 2, name: "Najmul Hoque", role: "UI/UX Specialist", rating: 4.9, reviews: 38, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60" },
    { id: 3, name: "Saidur Rahman", role: "Full-Stack Expert", rating: 5.0, reviews: 56, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60" },
    { id: 4, name: "Sarah Miller", role: "Creative Director", rating: 4.8, reviews: 29, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60" },
    { id: 5, name: "David K.", role: "Brand Identity Designer", rating: 4.9, reviews: 45, image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=60" },
    { id: 6, name: "Elena Rostova", role: "UI Designer", rating: 5.0, reviews: 31, image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60" },
    { id: 7, name: "Marcus Tan", role: "Graphic Artist", rating: 4.7, reviews: 19, image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=500&auto=format&fit=crop&q=60" },
    { id: 8, name: "Jessica Taylor", role: "Visual Designer", rating: 4.9, reviews: 50, image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60" }
  ];

  // ডেমো টপ গিগ ডেটা (৮টি)
  const topGigs = [
    { id: 1, title: `I will do professional ${category} and unique concepts`, freelancer: "Alessandro G.", rating: 5.0, reviews: 12, price: 45, image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=60" },
    { id: 2, title: `I will design modern UI/UX for ${category}`, freelancer: "Najmul Hoque", rating: 4.9, reviews: 24, price: 60, image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&auto=format&fit=crop&q=60" },
    { id: 3, title: `I will build responsive web apps for ${category}`, freelancer: "Saidur Rahman", rating: 5.0, reviews: 19, price: 90, image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60" },
    { id: 4, title: `Complete ${category} branding package`, freelancer: "Sarah Miller", rating: 4.8, reviews: 15, price: 120, image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=60" },
    { id: 5, title: `Expert consultation and ${category} solutions`, freelancer: "David K.", rating: 5.0, reviews: 22, price: 50, image: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=500&auto=format&fit=crop&q=60" },
    { id: 6, title: `Advanced ${category} development and setup`, freelancer: "Elena Rostova", rating: 4.9, reviews: 18, price: 80, image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format&fit=crop&q=60" },
    { id: 7, title: `Fast and reliable ${category} service`, freelancer: "Marcus Tan", rating: 4.7, reviews: 11, price: 30, image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&auto=format&fit=crop&q=60" },
    { id: 8, title: `Pro-level ${category} graphics and assets`, freelancer: "Jessica Taylor", rating: 5.0, reviews: 27, price: 75, image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=60" }
  ];

  // ডেমো প্রজেক্ট পোস্ট বা জব ডেটা (Find Work থেকে আসার জন্য)
  const projectPosts = [
    { id: 1, title: `Looking for an expert in ${category}`, client: "TechCorp Ltd", budget: "$500 - $1000", description: "We need an experienced professional to handle our ongoing project requirements efficiently.", posted: "2 hours ago" },
    { id: 2, title: `Urgent requirement for ${category} tasks`, client: "Innovate Studio", budget: "$200 - $400", description: "Looking for quick turnaround time with high quality design and development standards.", posted: "5 hours ago" },
    { id: 3, title: `Long term contract for ${category}`, client: "Global Solutions", budget: "$1500 - $3000", description: "Seeking a dedicated freelancer for long-term collaboration on our web and branding platforms.", posted: "1 day ago" },
    { id: 4, title: `Need help with ${category} optimization`, client: "StartupHub", budget: "$300 - $600", description: "Looking to fix and optimize our current setup as per modern industry standards.", posted: "2 days ago" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
     <PublicNavbar />
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* পেজ হেডার */}
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Result for: <span className="text-blue-400">{category}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Showing results based on your selection from {tab === 'projects' ? 'Find Work' : 'Hire Freelancer'}
          </p>
        </div>

        {/* 🌟 শর্ত ১: যদি ট্যাবটি 'top-talents' হয় (Hire Freelancer থেকে আসা) */}
        {tab === 'top-talents' && (
          <div className="space-y-12">
            
            {/* সেকশন ১: টপ র‍্যাংকড ৮ জন ফ্রিল্যান্সার (২ লাইনে ৪টি করে) */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold border-l-4 border-blue-500 pl-3">
                Top Ranked Freelancers for {category}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {topFreelancers.map((freelancer) => (
                  <div 
                    key={freelancer.id} 
                    className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-400 transition-all cursor-pointer group shadow-lg"
                  >
                    <img 
                      src={freelancer.image} 
                      alt={freelancer.name} 
                      className="w-14 h-14 rounded-xl object-cover border border-blue-500/30 group-hover:scale-105 transition-transform"
                    />
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-sm text-white truncate group-hover:text-blue-400 transition-colors">
                        {freelancer.name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">{freelancer.role}</p>
                      <div className="flex items-center gap-1 text-xs text-amber-400 mt-1 font-semibold">
                        <span>⭐ {freelancer.rating}</span>
                        <span className="text-gray-500 font-normal">({freelancer.reviews})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* সেকশন ২: সেরা ৮টি গিগ (২ লাইনে ৪টি করে) */}
            <div className="space-y-4 pt-4">
              <h2 className="text-xl sm:text-2xl font-bold border-l-4 border-pink-500 pl-3">
                Top Rated Gigs for {category}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {topGigs.map((gig) => (
                  <div 
                    key={gig.id} 
                    className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between shadow-xl"
                  >
                    <div>
                      <div className="h-36 sm:h-40 overflow-hidden bg-slate-800">
                        <img 
                          src={gig.image} 
                          alt={gig.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-xs text-blue-400 font-medium">by {gig.freelancer}</p>
                        <h3 className="text-xs sm:text-sm font-bold text-gray-200 line-clamp-2 group-hover:text-white">
                          {gig.title}
                        </h3>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-slate-950/60 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-amber-400 font-bold">⭐ {gig.rating} ({gig.reviews})</span>
                      <span className="text-sm font-black text-white">${gig.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 🌟 শর্ত ২: যদি ট্যাবটি 'projects' হয় (Find Work থেকে আসা) */}
        {tab === 'projects' && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold border-l-4 border-blue-500 pl-3">
              Available Projects & Jobs for {category}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projectPosts.map((project) => (
                <div 
                  key={project.id}
                  className="bg-slate-900 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-blue-400 transition-all shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-400 bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/30">
                        {project.client}
                      </span>
                      <span className="text-xs text-gray-400">{project.posted}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {project.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Project Budget</span>
                      <span className="text-sm sm:text-base font-extrabold text-green-400">{project.budget}</span>
                    </div>

                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-600/40 cursor-pointer">
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Search;