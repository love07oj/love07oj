'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  Shield, 
  Terminal, 
  Search, 
  ChevronRight, 
  AlertTriangle,
  Flame,
  Home,
  Calendar
} from 'lucide-react';
import { BlogPost } from '@/lib/notion';

interface BlogsClientProps {
  initialBlogs: BlogPost[];
  liveConnected: boolean;
}

export default function BlogsClient({ initialBlogs, liveConnected }: BlogsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // Sync virtual clock matching security terminal theme
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.getUTCFullYear() + '-' + 
        String(now.getUTCMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getUTCDate()).padStart(2, '0') + ' ' + 
        String(now.getUTCHours()).padStart(2, '0') + ':' + 
        String(now.getUTCMinutes()).padStart(2, '0') + ':' + 
        String(now.getUTCSeconds()).padStart(2, '0') + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter calculations
  const filteredBlogs = initialBlogs.filter((blog) => {
    const matchSearch = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchType = selectedType === 'All' || blog.type === selectedType;
    const matchDifficulty = selectedDifficulty === 'All' || blog.difficulty === selectedDifficulty;
    const matchPlatform = selectedPlatform === 'All' || blog.platform === selectedPlatform;

    return matchSearch && matchType && matchDifficulty && matchPlatform;
  });

  // Extract metadata lists dynamically for filters
  const typesList = ['All', ...Array.from(new Set(initialBlogs.map(b => b.type)))];
  const difficultiesList = ['All', ...Array.from(new Set(initialBlogs.map(b => b.difficulty)))];
  const platformsList = ['All', ...Array.from(new Set(initialBlogs.map(b => b.platform)))];

  // Group filtered blogs by Platform for structured rendering (automatic sections)
  const groupedByPlatform: Record<string, BlogPost[]> = {};
  filteredBlogs.forEach(blog => {
    if (!groupedByPlatform[blog.platform]) {
      groupedByPlatform[blog.platform] = [];
    }
    groupedByPlatform[blog.platform].push(blog);
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'medium':
        return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      case 'hard':
        return 'text-rose-400 border-rose-500/20 bg-rose-500/10';
      case 'insane':
        return 'text-red-500 border-red-500/30 bg-red-950/20 font-bold';
      default:
        return 'text-zinc-400 border-zinc-700/50 bg-zinc-800/10';
    }
  };

  // Safe formatting of dynamic link paths
  const getBlogPath = (blog: BlogPost) => {
    const formatSegment = (s: string) => encodeURIComponent(s.replace(/\s+/g, '-'));
    return `/blogs/${formatSegment(blog.type)}/${formatSegment(blog.platform)}/${blog.slug}`;
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* BACKGROUND DECORATIVE GRID */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(16, 185, 129, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* HEADER SECTION */}
      <header className="border-b border-zinc-900 bg-black/40 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-400" />
          <Link href="/" className="font-display tracking-wider text-lg font-light hover:text-emerald-400 transition-colors flex items-center gap-2">
            love07oj <span className="text-zinc-700 text-xs font-mono">::</span> <span className="text-zinc-400 text-xs font-mono">SEC_WRITEUPS</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-2 font-mono text-xs text-zinc-500 bg-zinc-950/60 px-3 py-1.5 rounded border border-zinc-900">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>OS_INTELL_ROOT: ONLINE</span>
            <span className="text-zinc-700">|</span>
            <span>{currentTime || 'SYNCHRONIZING...'}</span>
          </div>

          <Link 
            href="/" 
            className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-emerald-400 border border-zinc-900 bg-zinc-950/40 px-3.5 py-1.5 rounded transition-all hover:border-emerald-500/30"
          >
            <Home className="w-3.5 h-3.5" />
            <span>PORTAL HOME</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-8 py-10 relative z-10 flex flex-col gap-10">
        
        {/* HERO TITLE BLOCK */}
        <section className="relative">
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] tracking-widest uppercase">
              <Terminal className="w-3 h-3" />
              <span>LOG_REPOSITORIES_LOADED</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-light tracking-wide font-display text-white uppercase font-bold">
              OPERATIONAL <span className="text-emerald-400">WRITEUPS</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl font-sans tracking-wide leading-relaxed font-light">
              A dynamically synchronizing log index of vulnerability writeups, machine walkthroughs, and security analysis. Fetched directly from deep in my secure Notion operational database.
            </p>
          </div>
          
          {/* Neon side border highlight */}
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-emerald-500/40 via-transparent to-transparent -ml-4 pl-4 hidden sm:block" />
        </section>

        /* {/* NOTION CONNECTION STATUS BANNER */}
        {!liveConnected && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm grid grid-cols-1 md:grid-cols-12 gap-5"
          >
            <div className="md:col-span-8 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-500 font-mono text-xs font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>NOTION DISCONNECTED :: OPERATING IN SANDBOX MODE</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                The database connection is running mock entries. To display your live Notion database entries securely inside this interface, configure your credentials in the AI Studio platform workspace.
              </p>
            </div>
            <div className="md:col-span-4 flex items-center justify-end">
              <span className="text-[11px] font-mono border border-zinc-800 bg-black/50 px-3.5 py-2 rounded text-zinc-500 text-right w-full md:w-auto">
                Required properties: Title, Slug, Type, Platform, Difficulty, Tags, Published, Featured, Date, Cover, Summary
              </span>
            </div>
          </motion.div>
        )} */

        {/* SEARCH & FILTERS WORKSPACE */}
        <section className="bg-zinc-950/40 border border-zinc-900 rounded p-6 flex flex-col gap-6 backdrop-blur-sm shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {/* Search Input */}
            <div className="flex-grow relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search writeups by keyword, tags, CVE, platform..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-900/40 border border-zinc-800 rounded text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 hover:text-emerald-400 cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Quick Filter Reset */}
            {(selectedType !== 'All' || selectedDifficulty !== 'All' || selectedPlatform !== 'All' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All');
                  setSelectedDifficulty('All');
                  setSelectedPlatform('All');
                }}
                className="px-4 py-3 border border-zinc-800 bg-zinc-900/10 rounded font-mono text-xs hover:text-emerald-400 hover:border-emerald-500/20 transition-all uppercase whitespace-nowrap cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Filtering Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-900/60 pt-4">
            {/* Filter by Type */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-zinc-500 tracking-wider">SEC_CATEGORY (TYPE)</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-zinc-900/40 border border-zinc-800 px-3 py-2 rounded text-xs focus:outline-none focus:border-emerald-500/40 text-zinc-300 font-mono cursor-pointer"
              >
                {typesList.map(type => (
                  <option key={type} className="bg-[#121212] text-zinc-300" value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Filter by Platform */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-zinc-500 tracking-wider">LAB_PLATFORM</span>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full bg-zinc-900/40 border border-zinc-800 px-3 py-2 rounded text-xs focus:outline-none focus:border-emerald-500/40 text-zinc-300 font-mono cursor-pointer"
              >
                {platformsList.map(platform => (
                  <option key={platform} className="bg-[#121212] text-zinc-300" value={platform}>{platform}</option>
                ))}
              </select>
            </div>

            {/* Filter by Difficulty */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-zinc-500 tracking-wider">DIFFICULTY_TRIAGE</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full bg-zinc-900/40 border border-zinc-800 px-3 py-2 rounded text-xs focus:outline-none focus:border-emerald-500/40 text-zinc-300 font-mono cursor-pointer"
              >
                {difficultiesList.map(difficulty => (
                  <option key={difficulty} className="bg-[#121212] text-zinc-300" value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* RESULTS WORKSPACE */}
        <div className="flex flex-col gap-16">
          {filteredBlogs.length === 0 ? (
            <div className="border border-zinc-900/80 bg-zinc-950/20 py-20 rounded text-center max-w-xl mx-auto px-6 w-full flex flex-col items-center gap-4">
              <AlertTriangle className="w-10 h-10 text-zinc-650" />
              <div>
                <h3 className="text-zinc-200 font-medium">No results matches target parameters</h3>
                <p className="text-zinc-500 text-xs mt-1.5">Adjust filter query options or clear search criteria to list archived telemetry records.</p>
              </div>
            </div>
          ) : (
            // Iterate over automatic sections grouped by Platform
            Object.keys(groupedByPlatform).sort().map((platformName) => (
              <section key={platformName} className="flex flex-col gap-6 border-l-2 border-emerald-500/10 pl-4 sm:pl-6 relative">
                
                {/* Neon dot anchor */}
                <div className="absolute top-[8px] -left-[6px] w-[10px] h-[10px] rounded-full border border-emerald-500/50 bg-[#0C0C0C]" />

                {/* Dynamic Category Section ID */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-emerald-400 font-bold tracking-widest uppercase bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10">
                    {platformName}
                  </span>
                  <span className="text-zinc-700 font-mono text-xs">/</span>
                  <span className="font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
                    LAB_PLATFORM_ROOT :: {groupedByPlatform[platformName].length} {groupedByPlatform[platformName].length === 1 ? 'WALKTHROUGH' : 'WALKTHROUGHS'}
                  </span>
                </div>

                {/* Grid of cards in this platform section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
                  {groupedByPlatform[platformName].map((blog) => (
                    <article 
                      key={blog.id}
                      className="group border border-zinc-900 bg-zinc-950/20 rounded-lg overflow-hidden flex flex-col justify-between hover:border-zinc-800 transition-all flex-grow shadow-md relative"
                    >
                      
                      {/* FEATURED badge indicator */}
                      {blog.featured && (
                        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest uppercase bg-emerald-500 text-black">
                          <Flame className="w-2.5 h-2.5" />
                          <span>FEATURED</span>
                        </div>
                      )}

                      {/* Top layout */}
                      <div>
                        {/* Article cover */}
                        <div className="relative w-full h-32 overflow-hidden border-b border-zinc-900 bg-zinc-950 flex items-center justify-center">
                          {/* Ambient background glow from the image itself with next/image */}
                          <Image
                            src={blog.cover}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-25 select-none pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                          {/* Crisp centered foreground image with next/image */}
                          <Image
                            src={blog.cover}
                            alt={blog.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="relative z-10 p-2 opacity-80 group-hover:opacity-100 transition-all duration-300 object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-zinc-950 to-transparent z-10" />
                        </div>

                        {/* Post Details */}
                        <div className="p-4 flex flex-col gap-2.5">
                          {/* Type badge + Difficulty Badge */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[9px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-900/60 border border-zinc-800">
                              {blog.type}
                            </span>
                            
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${getDifficultyColor(blog.difficulty)}`}>
                              {blog.difficulty}
                            </span>

                            <span className="text-[9px] font-mono text-zinc-500 ml-auto flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {blog.date}
                            </span>
                          </div>

                          {/* Title linked dynamically */}
                          <Link href={getBlogPath(blog)}>
                            <h3 className="text-sm font-display tracking-tight text-zinc-200 line-clamp-2 hover:text-emerald-400 font-medium leading-normal transition-colors cursor-pointer pt-0.5">
                              {blog.title}
                            </h3>
                          </Link>

                          <p className="text-[11px] text-zinc-400 font-light tracking-wide leading-relaxed line-clamp-2">
                            {blog.summary}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Tag List / CTA */}
                      <div className="p-4 pt-0 mt-auto flex flex-col gap-2.5">
                        {/* Tags list */}
                        <div className="flex flex-wrap gap-1">
                          {blog.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-[8px] text-zinc-500 font-mono">
                              #{tag.replace(/\s+/g, '').toLowerCase()}
                            </span>
                          ))}
                          {blog.tags.length > 2 && (
                            <span className="text-[8px] text-zinc-500 font-mono">
                              +{blog.tags.length - 2} more
                            </span>
                          )}
                        </div>

                        <div className="border-t border-zinc-900/80 pt-2.5 flex items-center justify-between">
                          <span className="font-mono text-[9px] text-[#ef2929] font-semibold tracking-wider">STATE: COMPROMISED</span>
                          <Link 
                            href={getBlogPath(blog)}
                            className="text-[10px] text-emerald-400/80 group-hover:text-emerald-400 font-mono flex items-center gap-1 transition-colors"
                          >
                            <span>READ WRITEUP</span>
                            <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>

                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-950 bg-black/50 py-10 mt-20 px-4 sm:px-8 text-center text-zinc-650 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 love07oj. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

    </div>
  );
}
