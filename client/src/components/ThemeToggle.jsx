import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  // ১. প্রথমে চেক করছি আগে থেকে localStorage-এ কোনো থিম সেভ করা আছে কিনা
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ২. ডার্ক মোড চেঞ্জের সাথে সাথে HTML ক্লাস এবং localStorage আপডেট করা
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white transition-all w-full text-center font-medium"
    >
      {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}