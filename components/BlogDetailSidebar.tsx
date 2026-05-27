'use client';

import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

interface HeadingItem {
  text: string;
  id: string;
  level: number;
}

interface BlogDetailSidebarProps {
  headings: HeadingItem[];
}

export default function BlogDetailSidebar({ headings }: BlogDetailSidebarProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [localProgress, setLocalProgress] = useState(0);

  // 1. Calculate reading scroll progress percentage for the metadata footer
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const totalScroll = scrollHeight - clientHeight;
      if (totalScroll > 0) {
        const scrolled = (window.scrollY / totalScroll) * 100;
        setLocalProgress(Math.min(Math.max(scrolled, 0), 100));
      } else {
        setLocalProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 2. Active Section Highlighting using IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const headingElements = headings.map((h) => document.getElementById(h.id)).filter(Boolean);

    const observerOption = {
      root: null,
      rootMargin: '-80px 0px -70% 0px', // targets upper middle viewport area
      threshold: [0, 1.0],
    };

    const observer = new IntersectionObserver((entries) => {
      const visibleEntries = entries.filter((e) => e.isIntersecting);
      if (visibleEntries.length > 0) {
        // Sort visible headings by distance to top of viewport
        const sorted = visibleEntries.sort((a, b) => {
          return Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top);
        });
        if (sorted[0]) {
          setActiveId(sorted[0].target.id);
        }
      }
    }, observerOption);

    headingElements.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      headingElements.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [headings]);

  // Handle fallback active heading (e.g., top page vs bottom page)
  useEffect(() => {
    const handleFallbackScroll = () => {
      if (headings.length === 0) return;
      if (window.scrollY < 120) {
        setActiveId(headings[0].id);
        return;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        setActiveId(headings[headings.length - 1].id);
      }
    };
    window.addEventListener('scroll', handleFallbackScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleFallbackScroll);
  }, [headings]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // offset for sticky header height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <div className="sticky top-[105px] w-full self-start flex flex-col gap-5 border border-zinc-900 bg-zinc-950/45 backdrop-blur-md p-5 rounded-lg select-none">
      <h4 className="text-zinc-300 uppercase mb-1 font-semibold flex items-center gap-2 border-b border-zinc-900 pb-2.5 font-mono text-[11px] tracking-wider">
        <Terminal className="w-4 h-4 text-emerald-400" />
        REPORT OUTLINE
      </h4>
      <ul className="space-y-3 font-mono text-[11px] leading-relaxed max-h-[55vh] overflow-y-auto pr-1 scrollbar-none">
        {headings.map((h, i) => {
          const isActive = activeId === h.id;
          return (
            <li 
              key={i} 
              style={{ paddingLeft: h.level === 2 ? '1.25rem' : '0' }}
              className="transition-colors"
            >
              <a 
                href={`#${h.id}`} 
                onClick={(e) => handleLinkClick(e, h.id)}
                className={`flex items-start gap-1.5 hover:underline group cursor-pointer ${
                  isActive 
                    ? 'text-emerald-400 font-bold' 
                    : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                <span className={`${isActive ? 'text-emerald-400' : 'text-zinc-800'} font-bold`}>
                  {h.level === 1 ? '■' : '└─'}
                </span>
                <span className="break-all">{h.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-zinc-900/60 pt-3.5 flex items-center justify-between font-mono text-[9px] text-zinc-500">
        <span>PROGRESS: {Math.round(localProgress)}%</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </div>
  );
}
