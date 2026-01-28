import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Shield, Facebook, Instagram, Send, Phone, Twitter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SiteSettings {
  legal?: {
    privacy_policy?: string;
    terms_of_service?: string;
  };
  social?: {
    facebook?: string;
    instagram?: string;
    telegram?: string;
    whatsapp?: string;
    x?: string;
  };
  general?: {
    contact_email?: string;
    contact_phone?: string;
  };
}

const Footer = () => {
  const { darkMode, language } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings>({});
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value');
      
      if (data) {
        const settingsObj: SiteSettings = {};
        data.forEach(s => {
          (settingsObj as any)[s.key] = s.value;
        });
        setSettings(settingsObj);
      }
    };

    fetchSettings();
  }, []);

  const t = {
    ar: {
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الاستخدام',
      followUs: 'تابعنا',
      copyright: '© 2026 E-Sekoir. جميع الحقوق محفوظة',
      close: 'إغلاق'
    },
    en: {
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      followUs: 'Follow Us',
      copyright: '© 2026 E-Sekoir. All rights reserved',
      close: 'Close'
    }
  };

  const text = t[language];
  const hasSocial = settings.social?.facebook || settings.social?.instagram || settings.social?.telegram || settings.social?.whatsapp || settings.social?.x;
  const hasLegal = settings.legal?.privacy_policy || settings.legal?.terms_of_service;

  if (!hasSocial && !hasLegal) return null;

  return (
    <>
      <footer className={`${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-gray-100/80 border-gray-200'} border-t backdrop-blur-sm py-6 px-4`}>
        <div className="container mx-auto max-w-2xl">
          {/* Legal Links */}
          {hasLegal && (
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              {settings.legal?.privacy_policy && (
                <button
                  onClick={() => setShowPrivacy(true)}
                  className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                >
                  <Shield size={16} />
                  {text.privacy}
                </button>
              )}
              {settings.legal?.terms_of_service && (
                <button
                  onClick={() => setShowTerms(true)}
                  className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                >
                  <FileText size={16} />
                  {text.terms}
                </button>
              )}
            </div>
          )}

          {/* Social Links */}
          {hasSocial && (
            <div className="flex justify-center gap-3 mb-4">
              {settings.social?.facebook && (
                <a
                  href={settings.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-blue-500 hover:bg-gray-700' : 'bg-white text-blue-600 hover:bg-gray-50'} transition-colors`}
                >
                  <Facebook size={20} />
                </a>
              )}
              {settings.social?.instagram && (
                <a
                  href={settings.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-pink-500 hover:bg-gray-700' : 'bg-white text-pink-600 hover:bg-gray-50'} transition-colors`}
                >
                  <Instagram size={20} />
                </a>
              )}
              {settings.social?.telegram && (
                <a
                  href={settings.social.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-sky-500 hover:bg-gray-700' : 'bg-white text-sky-600 hover:bg-gray-50'} transition-colors`}
                >
                  <Send size={20} />
                </a>
              )}
              {settings.social?.whatsapp && (
                <a
                  href={`https://wa.me/${settings.social.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-green-500 hover:bg-gray-700' : 'bg-white text-green-600 hover:bg-gray-50'} transition-colors`}
                >
                  <Phone size={20} />
                </a>
              )}
              {settings.social?.x && (
                <a
                  href={settings.social.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-colors`}
                >
                  <Twitter size={20} />
                </a>
              )}
            </div>
          )}

          {/* Copyright */}
          <p className={`text-center text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {text.copyright}
          </p>
        </div>
      </footer>

      {/* Privacy Policy Dialog */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className={`sm:max-w-lg max-h-[80vh] overflow-y-auto ${darkMode ? 'bg-gray-800 text-white border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="text-blue-500" size={20} />
              {text.privacy}
            </DialogTitle>
          </DialogHeader>
          <div className={`prose prose-sm ${darkMode ? 'prose-invert' : ''} max-w-none whitespace-pre-wrap`}>
            {settings.legal?.privacy_policy || ''}
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className={`sm:max-w-lg max-h-[80vh] overflow-y-auto ${darkMode ? 'bg-gray-800 text-white border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="text-blue-500" size={20} />
              {text.terms}
            </DialogTitle>
          </DialogHeader>
          <div className={`prose prose-sm ${darkMode ? 'prose-invert' : ''} max-w-none whitespace-pre-wrap`}>
            {settings.legal?.terms_of_service || ''}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Footer;
