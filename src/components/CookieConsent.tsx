import React, { useState, useEffect } from 'react';

export const CookieConsent: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-slate-600 font-sans">
        We use cookies to improve your experience, analyze traffic, and ensure the AI models function properly. 
        By continuing to use VizzyStudio, you consent to our use of cookies.
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={() => {
            localStorage.setItem('cookie-consent', 'accepted');
            setShow(false);
          }}
          className="bg-[#e0fb73] hover:bg-[#d4f25b] text-slate-900 px-6 py-2 rounded-full font-medium transition-colors text-sm"
        >
          Accept All
        </button>
      </div>
    </div>
  );
};
