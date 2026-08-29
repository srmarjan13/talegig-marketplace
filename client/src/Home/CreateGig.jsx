import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PrivateNavbar from './PrivateNavbar';
import { useToast } from '../Home/ToastContext';

const CreateGig = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const editGigId = queryParams.get('edit');

  const [activeTab, setActiveTab] = useState('overview');

  // Overview States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [serviceType, setServiceType] = useState('');
  
  // Search Tags
  const [searchTags, setSearchTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Pricing States
  const [pricingData, setPricingData] = useState({
    basic: { name: 'Basic', desc: '', price: '0', delivery: '0', revision: '1' },
    standard: { name: 'Standard', desc: '', price: '0', delivery: '0', revision: '1' },
    premium: { name: 'Premium', desc: '', price: '0', delivery: '0', revision: '1' }
  });

  // Description State
  const [description, setDescription] = useState('');

  // FAQ States
  const [faqs, setFaqs] = useState([]);
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [isAddingFaq, setIsAddingFaq] = useState(false);

  // Requirements States
  const [requirements, setRequirements] = useState(['']);

  // Gallery States
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);

  const tabsList = ['overview', 'pricing', 'description', 'requirements', 'gallery'];

  // এডিট মোড হলে লোকালস্টোরেজ থেকে গিগ ডেটা লোড করার লজিক
  useEffect(() => {
    if (editGigId) {
      const existingGigs = JSON.parse(localStorage.getItem('talegig_gigs') || '[]');
      const gigToEdit = existingGigs.find(g => g.id.toString() === editGigId.toString());
      if (gigToEdit) {
        setTitle(gigToEdit.title || '');
        setCategory(gigToEdit.category || '');
        setSubCategory(gigToEdit.subCategory || '');
        setServiceType(gigToEdit.serviceType || '');
        setSearchTags(gigToEdit.searchTags || []);
        if (gigToEdit.pricingData) {
          setPricingData(gigToEdit.pricingData);
        }
        setDescription(gigToEdit.description || '');
        setFaqs(gigToEdit.faqs || []);
        setRequirements(gigToEdit.requirements && gigToEdit.requirements.length > 0 ? gigToEdit.requirements : ['']);
        setImages(gigToEdit.images || (gigToEdit.image ? [gigToEdit.image] : []));
        setVideo(gigToEdit.video || null);
      }
    }
  }, [editGigId]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (searchTags.length < 5 && !searchTags.includes(tagInput.trim())) {
        setSearchTags([...searchTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSearchTags(searchTags.filter(t => t !== tagToRemove));
  };

  const handleSaveFaq = () => {
    if (newFaqQ.trim() && newFaqA.trim()) {
      setFaqs([...faqs, { question: newFaqQ, answer: newFaqA }]);
      setNewFaqQ('');
      setNewFaqA('');
      setIsAddingFaq(false);
    } else {
      showToast('Please fill in both question and answer!');
    }
  };

  const handleDeleteFaq = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleAddRequirement = () => {
    if (requirements[requirements.length - 1].trim() === '') {
      showToast('Please fill out the current requirement before adding a new one!');
      return;
    }
    setRequirements([...requirements, '']);
  };

  const handleRequirementChange = (index, value) => {
    if (value.length <= 300) {
      const updated = [...requirements];
      updated[index] = value;
      setRequirements(updated);
    }
  };

  const handleRemoveRequirement = (index) => {
    const updated = requirements.filter((_, i) => i !== index);
    setRequirements(updated.length > 0 ? updated : ['']);
  };

  const handleCategoryChange = (e) => {
    if (e.target.value.length <= 30) {
      setCategory(e.target.value);
    } else {
      showToast('Maximum 30 characters allowed for Category!');
    }
  };

  const handleSubCategoryChange = (e) => {
    if (e.target.value.length <= 30) {
      setSubCategory(e.target.value);
    } else {
      showToast('Maximum 30 characters allowed for Sub-category!');
    }
  };

  const handleServiceTypeChange = (e) => {
    if (e.target.value.length <= 30) {
      setServiceType(e.target.value);
    } else {
      showToast('Maximum 30 characters allowed for Service Type!');
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    for (let file of files) {
      if (file.size > 2 * 1024 * 1024) {
        showToast(`Image "${file.name}" is too large! Please upload images less than 2MB.`);
        return;
      }
    }

    if (images.length + files.length > 3) {
      showToast('You can upload up to 3 images only!');
      return;
    }

    const newImages = files.map(file => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(URL.createObjectURL(file));
    }
  };

  const handleNextTab = () => {
    if (activeTab === 'overview') {
      const trimmedTitle = title.trim();
      const wordCount = trimmedTitle.split(/\s+/).filter(Boolean).length;

      if (trimmedTitle.length < 15 || wordCount < 4) {
        showToast('Minimum 15 characters, at least 4 words required for Gig title.');
        return;
      }
      if (!category.trim()) {
        showToast('Category is required!');
        return;
      }
      if (!subCategory.trim()) {
        showToast('Sub-category is required!');
        return;
      }
      if (!serviceType.trim()) {
        showToast('Service type is required!');
        return;
      }
      if (searchTags.length === 0) {
        showToast('Please add at least one search tag!');
        return;
      }
    } else if (activeTab === 'pricing') {
      if (!pricingData.basic.name.trim() || !pricingData.basic.desc.trim() || pricingData.basic.price === '' || pricingData.basic.delivery === '') {
        showToast('Please fill in all mandatory fields for the Basic package!');
        return;
      }
    } else if (activeTab === 'description') {
      if (description.trim().length < 300) {
        showToast('Description must be at least 300 characters long!');
        return;
      }
    }

    const currentIndex = tabsList.indexOf(activeTab);
    if (currentIndex < tabsList.length - 1) {
      setActiveTab(tabsList[currentIndex + 1]);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = tabsList.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabsList[currentIndex - 1]);
    }
  };

  const handleSaveAndPublish = () => {
    const trimmedTitle = title.trim();
    const wordCount = trimmedTitle.split(/\s+/).filter(Boolean).length;

    if (trimmedTitle.length < 15 || wordCount < 4 || !category.trim() || !subCategory.trim() || !serviceType.trim() || searchTags.length === 0) {
      showToast('Please fill in all mandatory fields in the Overview section first!');
      setActiveTab('overview');
      return;
    }

    if (images.length === 0) {
      showToast('Please upload at least one image for your Gig gallery!');
      setActiveTab('gallery');
      return;
    }

    const existingGigs = JSON.parse(localStorage.getItem('talegig_gigs') || '[]');
    const existingGigData = editGigId ? existingGigs.find(g => g.id.toString() === editGigId.toString()) : null;

    const gigData = {
      id: editGigId ? parseInt(editGigId) : Date.now(),
      title,
      category,
      subCategory,
      serviceType,
      searchTags,
      pricingData,
      description,
      faqs,
      requirements: requirements.filter(r => r.trim() !== ''),
      images,
      video,
      image: images[0],
      price: `$${pricingData.basic.price || '0'} USD`,
      status: 'active',
      views: existingGigData ? (existingGigData.views || 0) : 0,
      createdAt: existingGigData ? existingGigData.createdAt : new Date().toLocaleDateString()
    };

    try {
      let updatedGigs = [];
      if (editGigId) {
        updatedGigs = existingGigs.map(g => g.id.toString() === editGigId.toString() ? gigData : g);
        showToast('Gig updated successfully!');
      } else {
        updatedGigs = [gigData, ...existingGigs];
        showToast('Gig published successfully!');
      }
      localStorage.setItem('talegig_gigs', JSON.stringify(updatedGigs));
      navigate('/seller-dashboard');
    } catch (err) {
      showToast('Error saving gig.');
    }
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-white min-h-screen">
      
      {/* প্রাইভেট নেভবার */}
      <PrivateNavbar />
      
      {/* টপ ট্যাব বার */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16171a] sticky top-0 z-40 px-3 sm:px-8 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-start sm:justify-center items-center overflow-x-auto no-scrollbar">
          <div className="bg-slate-100 dark:bg-[#0b0f19] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'pricing', label: 'Pricing' },
              { id: 'description', label: 'Description & FAQ' },
              { id: 'requirements', label: 'Requirements' },
              { id: 'gallery', label: 'Gallery' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-pink-600 text-white shadow-md' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* মেইন কন্টেন্ট এরিয়া (ওপরের স্পেস কমিয়ে দেওয়া হয়েছে) */}
      <div className="max-w-4xl mx-auto p-4 sm:p-8 my-2 sm:my-3">
        
        {/* ১. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Gig Title */}
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Gig title <span className="text-pink-600">*</span></h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">As your Gig storefront, your title is the most important place to include keywords that buyers would use to search for a service like yours.</p>
              
              <div className="flex items-center bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-3 sm:px-4 py-3">
                <span className="text-slate-400 font-bold text-xs sm:text-sm mr-2 shrink-0">I will</span>
                <input 
                  type="text" 
                  maxLength="80"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="do something I'm really good at"
                  className="w-full bg-transparent text-xs sm:text-sm focus:outline-none font-semibold text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
              <div className="flex justify-end text-[11px] text-slate-400">
                <span>{title.length} / 80 max</span>
              </div>
            </div>

            {/* Category & Sub-category */}
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Category <span className="text-pink-600">*</span></h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose the category and sub-category most suitable for your Gig (Max 30 chars).</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  type="text"
                  value={category}
                  onChange={handleCategoryChange}
                  placeholder="e.g. Graphics & Design"
                  className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-pink-600 text-slate-900 dark:text-white placeholder-slate-400"
                />
                <input 
                  type="text"
                  value={subCategory}
                  onChange={handleSubCategoryChange}
                  placeholder="e.g. Website Design"
                  className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-pink-600 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            {/* Service Type */}
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Service type <span className="text-pink-600">*</span></h3>
              <input 
                type="text"
                value={serviceType}
                onChange={handleServiceTypeChange}
                placeholder="e.g. Website Builders Design (Max 30 chars)"
                className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-pink-600 text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            {/* Search Tags / Positive Keywords */}
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Search tags <span className="text-pink-600">*</span></h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tag your Gig with buzz words that are relevant to the services you offer. Use up to 5 tags to get found (Press Enter to add).</p>
              
              <div className="bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-wrap gap-2 items-center">
                {searchTags.map((tag, idx) => (
                  <span key={idx} className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="text-red-500 font-bold hover:text-red-600 cursor-pointer">×</button>
                  </span>
                ))}
                {searchTags.length < 5 && (
                  <input 
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type tag & press enter"
                    className="bg-transparent text-xs focus:outline-none flex-1 min-w-[150px] p-1 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                )}
              </div>
            </div>

          </div>
        )}

        {/* ২. PRICING TAB */}
        {activeTab === 'pricing' && (
          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-base sm:text-lg mb-4 text-slate-900 dark:text-white">Packages</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['basic', 'standard', 'premium'].map((tier) => (
                <div key={tier} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-[#0b0f19] flex flex-col justify-between shadow-sm">
                  <div className="space-y-4">
                    
                    {/* প্যাকেজের নাম */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Package Name <span className="text-pink-600">*</span></label>
                        <span className="text-[10px] text-pink-500 font-semibold flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                          Edit name
                        </span>
                      </div>
                      <input 
                        type="text"
                        value={pricingData[tier].name}
                        onChange={(e) => setPricingData({
                          ...pricingData, 
                          [tier]: {...pricingData[tier], name: e.target.value}
                        })}
                        placeholder="Package name"
                        className="w-full bg-white dark:bg-[#16171a] border-2 border-pink-600 text-center font-extrabold uppercase text-xs py-2.5 rounded-xl text-slate-900 dark:text-white tracking-wider shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                      />
                    </div>

                    {/* ডেসক্রিপশন (সর্বোচ্চ ১৫০ ক্যারেক্টার) */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Description <span className="text-pink-600">*</span></label>
                        <span className="text-[10px] text-slate-400">{pricingData[tier].desc.length}/150</span>
                      </div>
                      <textarea 
                        rows="5"
                        maxLength="150"
                        value={pricingData[tier].desc}
                        onChange={(e) => setPricingData({
                          ...pricingData, 
                          [tier]: {...pricingData[tier], desc: e.target.value}
                        })}
                        placeholder="Details of your package..."
                        className="w-full bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs focus:outline-none focus:border-pink-600 resize-y text-slate-900 dark:text-white placeholder-slate-400"
                      ></textarea>
                    </div>

                    {/* প্রাইস ($) */}
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Price ($) <span className="text-pink-600">*</span></label>
                      <input 
                        type="number"
                        value={pricingData[tier].price}
                        onChange={(e) => setPricingData({
                          ...pricingData, 
                          [tier]: {...pricingData[tier], price: e.target.value}
                        })}
                        placeholder="0"
                        className="w-full bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-pink-600 text-slate-900 dark:text-white placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 text-xs">
                    
                    {/* ডেলিভারি ডেজ */}
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span>Delivery (Days) <span className="text-pink-600">*</span></span>
                      <input 
                        type="number"
                        min="0"
                        value={pricingData[tier].delivery}
                        onChange={(e) => setPricingData({
                          ...pricingData, 
                          [tier]: {...pricingData[tier], delivery: e.target.value}
                        })}
                        className="w-16 bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-center text-slate-900 dark:text-white focus:outline-none focus:border-pink-600"
                      />
                    </div>

                    {/* রিভিশন */}
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span>Revisions</span>
                      <select 
                        value={pricingData[tier].revision}
                        onChange={(e) => setPricingData({
                          ...pricingData, 
                          [tier]: {...pricingData[tier], revision: e.target.value}
                        })}
                        className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-600"
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                        <option value="Unlimited">Unlimited</option>
                      </select>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ৩. DESCRIPTION & FAQ TAB */}
        {activeTab === 'description' && (
          <div className="space-y-6">
            
            {/* Briefly Describe Your Gig */}
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Briefly Describe Your Gig <span className="text-pink-600">*</span></h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Minimum 300 characters and maximum 1200 characters required.</p>
              
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0b0f19]">
                <textarea 
                  rows="8"
                  maxLength="1200"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Are you looking for a stunning website that effectively represents your brand and engages your audience? Look no further! (Minimum 300 characters)..."
                  className="w-full bg-transparent p-4 text-xs sm:text-sm focus:outline-none resize-none text-slate-900 dark:text-white placeholder-slate-400 leading-relaxed"
                ></textarea>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-pink-500 font-medium">
                  {description.length < 300 ? `Need at least ${300 - description.length} more characters.` : 'Character limit met!'}
                </span>
                <span className="text-slate-400">{description.length}/1200 Characters</span>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Frequently Asked Questions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add Questions & Answers for Your Buyers.</p>

              {faqs.map((faq, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{faq.question}</h4>
                    <p className="text-xs text-slate-500 mt-1">{faq.answer}</p>
                  </div>
                  <button onClick={() => handleDeleteFaq(index)} className="text-red-500 font-bold hover:text-red-600 cursor-pointer text-sm">×</button>
                </div>
              ))}

              {isAddingFaq ? (
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Question Title</span>
                      <span className="text-[10px] text-slate-400">{newFaqQ.length}/100</span>
                    </div>
                    <input 
                      type="text"
                      maxLength="100"
                      value={newFaqQ}
                      onChange={(e) => setNewFaqQ(e.target.value)}
                      placeholder="Add a Question: i.e. Do you translate to English as well?"
                      className="w-full bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Answer Description</span>
                      <span className="text-[10px] text-slate-400">{newFaqA.length}/300</span>
                    </div>
                    <textarea 
                      rows="3"
                      maxLength="300"
                      value={newFaqA}
                      onChange={(e) => setNewFaqA(e.target.value)}
                      placeholder="Add an Answer: i.e. Yes, I also translate from English to Hebrew."
                      className="w-full bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs focus:outline-none resize-none text-slate-900 dark:text-white placeholder-slate-400"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      onClick={() => setIsAddingFaq(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveFaq}
                      className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingFaq(true)}
                  className="text-pink-600 font-bold text-xs hover:underline cursor-pointer flex items-center gap-1"
                >
                  + Add FAQ
                </button>
              )}

            </div>

          </div>
        )}

        {/* ৪. REQUIREMENTS TAB */}
        {activeTab === 'requirements' && (
          <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Requirements</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Set questions to help buyers provide you with everything needed to start their project (Optional).</p>

            {requirements.map((req, index) => (
              <div key={index} className="space-y-2 p-4 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl relative">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Requirement {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{req.length}/300</span>
                    {requirements.length > 1 && (
                      <button 
                        onClick={() => handleRemoveRequirement(index)} 
                        className="text-red-500 font-bold hover:text-red-600 cursor-pointer text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <textarea 
                  rows="3"
                  maxLength="300"
                  value={req}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  placeholder="Request necessary details (e.g. Logo text, color preferences, brand guidelines)"
                  className="w-full bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs focus:outline-none resize-none text-slate-900 dark:text-white placeholder-slate-400"
                ></textarea>
              </div>
            ))}

            <button 
              onClick={handleAddRequirement} 
              className="text-pink-600 font-bold text-xs hover:underline cursor-pointer flex items-center gap-1 mt-2"
            >
              + Add Requirement
            </button>
          </div>
        )}

        {/* ৫. GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            
            {/* Images Section (up to 3) */}
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Images (up to 3) <span className="text-pink-600">*</span></h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Get noticed by the right buyers with visual examples of your services. Recommended size: 1120px by 720px. (Max file size: 2MB)</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* আপলোড করা ইমেজগুলোর প্রিভিউ */}
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-[112/72] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0f19] group shadow-sm">
                    <img src={img} alt={`Gig Upload ${index}`} className="w-full h-full object-cover" />
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 bg-black/70 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
                        ★ Primary
                      </span>
                    )}
                    <button 
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow hover:bg-red-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* ৩টির কম ইমেজ থাকলে আপলোড বক্স */}
                {images.length < 3 && (
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-pink-600 rounded-xl aspect-[112/72] flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-[#0b0f19] transition shadow-sm">
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    <div className="text-center p-4">
                      <svg className="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Drag & drop a Photo or</p>
                      <span className="text-xs text-pink-600 font-bold hover:underline">Browse</span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Video Section (one only) */}
            <div className="bg-white dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Video (one only)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Capture buyers' attention with a video that showcases your service.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Please choose a video shorter than 75 seconds and smaller than 50MB</p>
              </div>

              {video ? (
                <div className="relative w-full sm:w-1/3 aspect-[112/72] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0f19] shadow-sm">
                  <video src={video} controls className="w-full h-full object-cover"></video>
                  <button 
                    onClick={() => setVideo(null)}
                    className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow hover:bg-red-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-pink-600 rounded-xl w-full sm:w-1/3 aspect-[112/72] flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-[#0b0f19] transition shadow-sm">
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  <div className="text-center p-4">
                    <svg className="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Drag & drop a Video or</p>
                    <span className="text-xs text-pink-600 font-bold hover:underline">Browse</span>
                  </div>
                </label>
              )}
            </div>

          </div>
        )}

        {/* ন্যাভিগেশন বাটন ফুটার */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800 mt-8">
          <button 
            onClick={handlePrevTab}
            className="px-5 sm:px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-white dark:bg-[#16171a] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Back
          </button>

          {activeTab === 'gallery' ? (
            <button 
              onClick={handleSaveAndPublish}
              className="px-7 sm:px-8 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
            >
              Publish Gig
            </button>
          ) : (
            <button 
              onClick={handleNextTab}
              className="px-7 sm:px-8 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
            >
              Save & Continue
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default CreateGig;