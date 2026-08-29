import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaTelegramPlane, FaWhatsapp, FaGlobe } from 'react-icons/fa';
import { SiGmail } from 'react-icons/si';

const Footer = () => {
  const [footerData, setFooterData] = useState({
    footerColumns: [
      { key: 'col_1', title: 'MARKETPLACE', links: [{ id: 1, label: 'Explore Gigs', url: '/gigs' }, { id: 2, label: 'Active Projects', url: '/projects' }] },
      { key: 'col_2', title: 'POLICIES', links: [{ id: 3, label: 'Terms & Conditions', url: '/terms' }, { id: 4, label: 'Privacy Policy', url: '/privacy' }] }
    ],
    contacts: []
  });

  const getIcon = (platform) => {
    const iconClass = "w-4 h-4 transition-transform duration-300 group-hover:scale-125";
    switch (platform) {
      case 'Facebook': return <FaFacebookF className={`${iconClass} text-blue-500`} />;
      case 'Twitter': return <FaTwitter className={`${iconClass} text-sky-400`} />;
      case 'LinkedIn': return <FaLinkedinIn className={`${iconClass} text-blue-600`} />;
      case 'Instagram': return <FaInstagram className={`${iconClass} text-pink-500`} />;
      case 'Telegram': return <FaTelegramPlane className={`${iconClass} text-sky-400`} />;
      case 'WhatsApp': return <FaWhatsapp className={`${iconClass} text-emerald-400`} />;
      case 'Gmail': return <SiGmail className={`${iconClass} text-red-500`} />;
      default: return <FaGlobe className={`${iconClass} text-slate-400`} />;
    }
  };

  const loadFooterData = () => {
    try {
      const savedPages = localStorage.getItem('talegig_marketplace_pages');
      if (savedPages) {
        const parsed = JSON.parse(savedPages);
        if (parsed) {
          setFooterData(prev => ({
            ...prev,
            footerColumns: parsed.footerColumns || prev.footerColumns,
            contacts: parsed.pages ? Object.values(parsed.pages).flatMap(p => p.contacts || []) : []
          }));
        }
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadFooterData();
    const handleStorageUpdate = () => loadFooterData();
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('talegig_settings_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('talegig_settings_updated', handleStorageUpdate);
    };
  }, []);

  return (
    <footer className="bg-white dark:bg-[#0b0f19] border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 transition-colors text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          
          {/* লোগো ও বর্ণনা কলাম */}
          <div className="col-span-1 md:col-span-1 space-y-3">
            <Link to="/" className="inline-block">
              {/* Light Mode-এ taleGig3.png এবং Dark Mode-এ taleGig1.png দেখাবে */}
              <img 
                src="/taleGig3.png" 
                alt="TaleGig" 
                className="h-8 w-auto object-contain dark:hidden" 
              />
              <img 
                src="/taleGig1.png" 
                alt="TaleGig" 
                className="h-8 w-auto object-contain hidden dark:block" 
              />
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              TaleGig is a premier worldwide freelancer marketplace connecting top talent with global clients.
            </p>
          </div>

          {/* অ্যাডমিন প্যানেল থেকে কন্ট্রোল হওয়া ডাইনামিক কলামগুলো */}
          {footerData.footerColumns && footerData.footerColumns.map((col) => (
            <div key={col.key}>
              <h4 className="font-bold mb-4 text-xs uppercase tracking-widest text-slate-400">{col.title}</h4>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                {col.links && col.links.map((link) => (
                  <li key={link.id}>
                    <Link to={link.url} className="hover:text-blue-600 transition">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* অ্যাডমিন প্যানেল থেকে ডাইনামিক যোগ করা সোশ্যাল আইকন কলাম */}
          <div>
            <h4 className="font-bold mb-4 text-xs uppercase tracking-widest text-slate-400">Connect With Us</h4>
            <div className="flex flex-wrap gap-3">
              {footerData.contacts.length === 0 ? (
                <>
                  <a href="mailto:info.talegig@gmail.com" className="group w-10 h-10 rounded-2xl bg-slate-100 dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-md hover:border-blue-500 transition-all duration-300" title="Gmail">
                    <SiGmail className="w-4 h-4 text-red-500 transition-transform duration-300 group-hover:scale-125" />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="group w-10 h-10 rounded-2xl bg-slate-100 dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-md hover:border-blue-500 transition-all duration-300" title="Facebook">
                    <FaFacebookF className="w-4 h-4 text-blue-500 transition-transform duration-300 group-hover:scale-125" />
                  </a>
                </>
              ) : (
                footerData.contacts.map((c, idx) => (
                  <a 
                    key={idx} 
                    href={c.platform === 'Gmail' ? `mailto:${c.value}` : c.value} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="group w-10 h-10 rounded-2xl bg-slate-100 dark:bg-[#16171a] border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-md hover:border-blue-500 transition-all duration-300"
                    title={c.label || c.platform}
                  >
                    {getIcon(c.platform)}
                  </a>
                ))
              )}
            </div>
          </div>

        </div>

        <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} TaleGig. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
export default Footer;