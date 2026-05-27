'use client';

import React, { useState, useEffect } from 'react';

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const totalScroll = scrollHeight - clientHeight;
      if (totalScroll > 0) {
        const scrolled = (window.scrollY / totalScroll) * 100;
        // Cap it between 0 and 100
        setProgress(Math.min(Math.max(scrolled, 0), 100));
      } else {
        setProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on load
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[3.5px] bg-[#0c0c0c]/80 z-[120] pointer-events-none">
      <div 
        className="h-full bg-emerald-500 transition-all duration-75 ease-out shadow-[0_0_12px_#10b981,0_0_6px_rgba(16,185,129,0.6)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
