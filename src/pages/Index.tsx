import React, { useState, useEffect } from 'react';
import { RefreshCw, DollarSign, Moon, Sun } from 'lucide-react';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
        <RefreshCw className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50'}`} dir="rtl">
      <header className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                <DollarSign size={28} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">E-Sekoir</h1>
                <p className="text-xs text-emerald-100">منصة الصرف الشاملة</p>
              </div>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="bg-white/20 p-2 rounded-lg">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">مرحباً بك في E-Sekoir</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">منصة الصرف الشاملة</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
