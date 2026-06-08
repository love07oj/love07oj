'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, Terminal, Download } from 'lucide-react';

interface BlogImageProps {
  src: string;
  alt?: string;
}

export default function BlogImage({ src, alt = 'Security walkthrough screenshot' }: BlogImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Event for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="my-6 w-full select-none">
      {/* Thumbnail Trigger */}
      <div 
        onClick={() => setIsOpen(true)}
        className="group relative cursor-zoom-in rounded border border-zinc-900 bg-zinc-950/20 hover:border-emerald-500/30 overflow-hidden transition-all duration-300 shadow-lg flex flex-col"
        id="evidence-thumbnail-wrapper"
      >
        {/* Aspect Ratio Preserved Image - No fixed heights & no cropping */}
        <div className="relative w-full">
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={1000}
            style={{ width: '100%', height: 'auto' }}
            sizes="(max-width: 768px) 100vw, 1200px"
            className="w-full h-auto object-contain transition-all duration-500 group-hover:brightness-110"
            referrerPolicy="no-referrer"
          />
          {/* Subtle Cyber overlay on hover */}
          <div className="absolute inset-0 bg-[#10B981]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center">
            <div className="bg-black/80 font-mono text-xs border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded flex items-center gap-1.5 shadow-2xl tracking-wider uppercase">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>ACTIVATE_MAGNIFIER_LENS</span>
            </div>
          </div>
        </div>
        
        {/* Caption bar underneath image if alt-text is descriptive */}
        {alt && alt !== 'Security walkthrough screenshot' && (
          <div className="border-t border-zinc-900 bg-black/40 px-3.5 py-2 flex items-center gap-2 text-[10px] font-mono text-zinc-500 select-text">
            <Terminal className="w-3 h-3 text-emerald-500/60 shrink-0" />
            <span className="truncate uppercase tracking-wider">FIG // {alt}</span>
          </div>
        )}
      </div>

      {/* Modern High-End Lightbox Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/95 sm:bg-black/98 backdrop-blur-md z-50 flex flex-col justify-between p-4 sm:p-6 select-none cursor-zoom-out"
            onClick={() => setIsOpen(false)}
          >
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between border-b border-zinc-900 pb-3 mb-2 font-mono text-xs max-w-7xl mx-auto z-10 select-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-zinc-400 font-semibold uppercase tracking-wider">EVIDENCE_ANALYSIS_VIEWPORT</span>
                <span className="text-zinc-700">|</span>
                <span className="text-[10px] text-zinc-500 hidden sm:inline">SCALE: NATIVE</span>
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href={src} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase border border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 rounded transition-all cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">Open In New Tab</span>
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase border border-emerald-550/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded transition-all"
                >
                  <X className="w-3 h-3" />
                  <span>CLOSE (ESC)</span>
                </button>
              </div>
            </div>

            {/* Main Full Scale Image Display Container */}
            <div className="flex-grow flex items-center justify-center max-w-7xl w-full mx-auto relative px-2 my-4">
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="relative max-w-full max-h-[80vh] flex items-center justify-center bg-zinc-950/10 rounded overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Embedded dynamic image perfectly preserving sizes without clipping */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  className="max-w-full max-h-[75vh] object-contain rounded border border-zinc-900 bg-[#07090e] shadow-2xl select-text"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>

            {/* Modal Footer */}
            <div className="w-full border-t border-zinc-900 pt-3 font-mono text-[10px] text-zinc-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto select-none gap-2 z-10">
              <span className="truncate max-w-lg">FIG_CAPTION: {alt}</span>
              <span className="text-zinc-600 block shrink-0">love07oj SEC_SYSTEM_MAGNIFIER // FULL RECON RESOLUTION</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
