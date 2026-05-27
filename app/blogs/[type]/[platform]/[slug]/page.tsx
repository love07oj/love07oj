import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Shield, 
  Terminal, 
  ArrowLeft, 
  Tag, 
  Calendar, 
  Cpu, 
  Target, 
  Flame, 
  ExternalLink,
  BookOpen,
  Info,
  Server,
  FileText,
  Clock,
  Unlock,
  ClipboardCheck,
  Award,
  ChevronRight
} from 'lucide-react';
import { fetchBlogBySlug, fetchAllBlogs } from '@/lib/notion';
import CopyButton from '@/components/CopyButton';
import BlogDetailSidebar from '@/components/BlogDetailSidebar';
import ReadingProgressBar from '@/components/ReadingProgressBar';

// High-contrast, dynamic syntax highlighter custom helper to make shell commands and codes beautiful and colorful
function highlightCode(code: string, language: string = '') {
  const cleanLang = (language || 'text').toLowerCase();
  const lines = code.split('\n');
  
  return (
    <span className="block text-zinc-300 font-mono">
      {lines.map((line, lineIdx) => {
        // Comment matching
        if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
          return (
            <span key={lineIdx} className="block text-emerald-500/70 italic font-mono">
              {line}
            </span>
          );
        }
        
        // Command line starting with $ / > / #
        if (line.trim().startsWith('$ ') || line.trim().startsWith('> ')) {
          const trimmed = line.trim();
          const prompt = trimmed.substring(0, 2);
          const cmd = trimmed.substring(2);
          return (
            <span key={lineIdx} className="block font-mono">
              <span className="text-rose-500 font-bold">{prompt}</span>
              <span className="text-sky-300 font-semibold">{cmd}</span>
            </span>
          );
        }

        // Colorize key outputs like ports, state, services, or success keys
        if (line.includes('open') || line.includes('SUCCESS') || line.includes('SUCCESSFUL') || line.includes('CONFERRED')) {
          return (
            <span key={lineIdx} className="block text-teal-400 font-mono font-medium">
              {line}
            </span>
          );
        }
        if (line.includes('VULNERABLE') || line.includes('CRITICAL') || line.includes('HIGH_RISK') || line.includes('FAILED')) {
          return (
            <span key={lineIdx} className="block text-rose-400 font-mono font-semibold">
              {line}
            </span>
          );
        }
        
        // General line parsing with regular highlighting of words
        const words = line.split(/(\s+)/);
        return (
          <span key={lineIdx} className="block font-mono">
            {words.map((word, wordIdx) => {
              // Highlight IP Address
              if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(word)) {
                return <span key={wordIdx} className="text-amber-400 font-medium">{word}</span>;
              }
              // Highlight ports
              if (/^\d+\/(tcp|udp)$/.test(word)) {
                return <span key={wordIdx} className="text-cyan-400 font-medium">{word}</span>;
              }
              // Highlight flags (starts with -)
              if (word.startsWith('-')) {
                return <span key={wordIdx} className="text-purple-400">{word}</span>;
              }
              // Highlight executable commands
              const isCmd = ['nmap', 'evil-winrm', 'hashcat', 'GetNPUsers.py', 'secretsdump.py', 'SharpHound.exe', 'net', 'impacket'].includes(word.toLowerCase());
              if (isCmd) {
                return <span key={wordIdx} className="text-sky-400 font-semibold">{word}</span>;
              }
              return <span key={wordIdx}>{word}</span>;
            })}
          </span>
        );
      })}
    </span>
  );
}

interface PageProps {
  params: Promise<{
    type: string;
    platform: string;
    slug: string;
  }>;
}

export default async function BlogDetailPage({ params }: PageProps) {
  // Await the route params as required in Next.js 15+
  const resolvedParams = await params;
  const rawType = resolvedParams.type;
  const rawPlatform = resolvedParams.platform;
  const slug = resolvedParams.slug;

  const displayType = decodeURIComponent(rawType).replace(/-/g, ' ');
  const displayPlatform = decodeURIComponent(rawPlatform).replace(/-/g, ' ');

  // Fetch from Notion API backend helper directly on server
  const blog = await fetchBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  // Extract headings for Table of Contents
  const headings = blog.blocks
    ? blog.blocks
        .filter((block) => block.type === 'heading_1' || block.type === 'heading_2')
        .map((block) => ({
          text: block.content,
          id: block.content.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          level: block.type === 'heading_1' ? 1 : 2,
        }))
    : [];

  // Fetch all blogs to filter for related writeups with matching tags
  const allBlogs = await fetchAllBlogs();
  const otherBlogs = allBlogs.filter((item) => item.slug !== blog.slug);
  
  // Calculate overlapping tags count
  const relatedWriteups = otherBlogs
    .map((item) => {
      const matchingTags = item.tags.filter((t) => blog.tags.includes(t));
      return { 
        blog: item, 
        matchCount: matchingTags.length 
      };
    })
    .filter((item) => item.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 3)
    .map((item) => item.blog);

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

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300 relative">
      
      {/* 0. SCROLL-BASED READING PROGRESS BAR AT TOP LEVEL */}
      <ReadingProgressBar />

      {/* BACKGROUND GRID */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(16, 185, 129, 0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* HEADER BAR */}
      <header className="border-b border-zinc-900 bg-black/40 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-400" />
          <Link href="/blogs" className="font-display tracking-wider text-sm font-light hover:text-emerald-400 transition-colors flex items-center gap-2">
            love07oj <span className="text-zinc-700 text-xs font-mono">::</span> <span className="text-zinc-400 text-xs font-mono">REP_DEBRIEFING_DECK</span>
          </Link>
        </div>

        <Link 
          href="/blogs" 
          className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-emerald-400 border border-zinc-900 bg-zinc-950/40 px-3.5 py-1.5 rounded transition-all hover:border-emerald-500/30"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK_TO_ARCHIVE</span>
        </Link>
      </header>

      {/* CENTRALIZED LAYOUT CONTAINER */}
      <main className="flex-grow max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 relative z-10 flex flex-col gap-8">
        
        {/* BREADCRUMB INDICATOR */}
        <div className="font-mono text-xs text-zinc-500 bg-black/50 border border-zinc-900 px-4 py-2.5 rounded flex items-center flex-wrap gap-2">
          <span className="text-emerald-500 font-bold">$</span>
          <span>cat</span>
          <span>/home/love07oj/archives/{rawType}/{rawPlatform}/{slug}.md</span>
          <span className="animate-pulse bg-emerald-500 w-1.5 h-3.5 ml-1"></span>
        </div>

        {/* HERO IMAGE BANNER & TITLE CARD */}
        <section className="border border-zinc-900 bg-zinc-950/40 rounded-lg overflow-hidden flex flex-col relative shadow-2xl">
          
          {/* Article Banner Image */}
          <div className="relative w-full h-64 sm:h-80 bg-zinc-950 flex items-center justify-center">
            {/* Ambient background glow from the image itself */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.cover}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-20 select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
            {/* Crisp centered foreground image (doesn't pixelate if it's small) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.cover}
              alt={blog.title}
              className="relative z-10 max-w-full max-h-full object-contain p-4 opacity-75"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0C0C0C] via-[#0C0C0C]/45 to-transparent z-10" />
            <div className="absolute top-4 left-4 z-20 font-mono text-[10px] bg-black/75 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded">
              {displayPlatform}
            </div>
          </div>

          {/* Details Panel */}
          <div className="p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono tracking-wider font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded">
                {displayType}
              </span>
              <span className={`text-xs font-mono px-2.5 py-1 rounded border ${getDifficultyColor(blog.difficulty)}`}>
                DIFFICULTY: {blog.difficulty}
              </span>
              <span className="text-xs text-zinc-500 font-mono flex items-center gap-1.5 ml-auto">
                <Calendar className="w-4 h-4" />
                DATED: {blog.date}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-light tracking-wide font-display text-white leading-tight uppercase">
              {blog.title}
            </h1>

            {/* QUICK INTEL MATRIX CARD */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded bg-black/40 border border-zinc-900 text-left font-mono text-[11px]">
              <div>
                <span className="text-zinc-500 block">THREAT_ACTOR</span>
                <span className="text-zinc-200">love07oj (ANALYST)</span>
              </div>
              <div>
                <span className="text-zinc-500 block">SYSTEM_EXPLOITED</span>
                <span className="text-zinc-200 uppercase">{blog.platform} LAB</span>
              </div>
              <div>
                <span className="text-zinc-500 block">SEVERITY_TIER</span>
                <span className="text-zinc-200 uppercase">{blog.difficulty}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">DEBRIEF_STATE</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  <span>COMPREHENSIVE</span>
                </span>
              </div>
            </div>

            {/* SUMMARY READOUT */}
            <div className="mt-4 italic text-sm text-zinc-400 border-l-2 border-emerald-500/40 pl-4 py-1 leading-relaxed font-light">
              &ldquo; {blog.summary} &rdquo;
            </div>
          </div>

        </section>

        {/* TWO-COLUMN INTEL CONTENT GRID */}
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          
          {/* Left Column (Writeup Details, tags, related widgets) */}
          <div className="flex-grow w-full lg:max-w-[calc(100%-312px)] flex flex-col gap-8">
            
            {/* WRITEUP WRITTEN SECTION CONTENT */}
            <section className="bg-zinc-950/20 border border-zinc-900/60 rounded-lg p-6 sm:p-8 flex flex-col gap-6 font-sans text-sm sm:text-base text-zinc-300 leading-relaxed font-light tracking-wide">
              
              {/* Table of Contents Block (only showing inline on mobile layouts) */}
              {headings.length > 0 && (
                <div className="lg:hidden p-4 sm:p-5 rounded-lg border border-zinc-900 bg-zinc-950/40 font-mono text-xs text-zinc-400 mb-2 select-none">
                  <h4 className="text-zinc-300 uppercase mb-3 font-semibold flex items-center gap-2 border-b border-zinc-900 pb-2">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    TABLE OF CONTENTS (NAV_TREE)
                  </h4>
                  <ul className="space-y-2">
                    {headings.map((h, i) => (
                      <li 
                        key={i} 
                        style={{ paddingLeft: h.level === 2 ? '1.25rem' : '0' }}
                        className="hover:text-emerald-450 transition-colors"
                      >
                        <a href={`#${h.id}`} className="flex items-center gap-1.5 hover:underline">
                          <span className="text-zinc-650 font-bold">{h.level === 1 ? '■' : '└─'}</span>
                          <span className="text-zinc-400 hover:text-emerald-400 font-mono text-[11px]">{h.text}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Loop over Notion dynamic blocks structure */}
              {blog.blocks && blog.blocks.length > 0 ? (
                blog.blocks.map((block, idx) => {
                  const elementId = block.content.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  switch (block.type) {
                    case 'paragraph':
                      return (
                        <p key={idx} className="font-sans text-zinc-300 leading-relaxed font-light">
                          {block.content}
                        </p>
                      );
                    case 'heading_1':
                      return (
                        <h2 id={elementId} key={idx} className="text-xl sm:text-2xl font-display font-medium text-white tracking-tight border-b border-zinc-900/80 pb-2 mt-8 mb-2 flex items-center gap-2 scroll-mt-20">
                          <span className="text-emerald-400 text-xs font-mono">01/</span> {block.content}
                        </h2>
                      );
                    case 'heading_2':
                      return (
                        <h3 id={elementId} key={idx} className="text-lg sm:text-xl font-display font-medium text-zinc-100 tracking-tight mt-6 mb-2 flex items-center gap-2 scroll-mt-20">
                          <span className="text-emerald-500 text-sm font-mono">&gt;_</span> {block.content}
                        </h3>
                      );
                    case 'heading_3':
                      return (
                        <h4 id={elementId} key={idx} className="text-base sm:text-lg font-display font-medium text-zinc-300 tracking-tight mt-4 mb-1 scroll-mt-20">
                          {block.content}
                        </h4>
                      );
                    case 'bulleted_list_item':
                      return (
                        <div key={idx} className="flex items-start gap-2 pl-4 -mt-3">
                          <span className="text-emerald-400 text-xs font-mono select-none pt-1">&gt;</span>
                          <p className="flex-1 text-zinc-300 font-sans text-sm sm:text-base font-light">{block.content}</p>
                        </div>
                      );
                    case 'numbered_list_item':
                      return (
                        <div key={idx} className="flex items-start gap-3 pl-4 -mt-3">
                          <span className="text-emerald-400 text-xs font-mono select-none pt-0.5">#</span>
                          <p className="flex-1 text-zinc-300 font-sans text-sm sm:text-base font-light">{block.content}</p>
                        </div>
                      );
                    case 'code':
                      return (
                        <div key={idx} className="relative w-full rounded overflow-hidden border border-zinc-900 bg-[#07090e] p-4.5 font-mono text-xs sm:text-sm text-zinc-300 shadow-inner flex flex-col gap-2 my-5 select-text">
                          {/* Code block bar */}
                          <div className="flex items-center justify-between border-b border-zinc-900/80 pb-2 mb-1 select-none text-zinc-500 text-[10px]">
                            <span className="uppercase tracking-widest font-semibold text-zinc-405 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {block.language || 'DATA'}
                            </span>
                            <div className="flex items-center gap-2">
                              <CopyButton text={block.content} />
                            </div>
                          </div>
                          <pre className="overflow-x-auto select-text whitespace-pre leading-relaxed pr-2 font-mono scrollbar-none">
                            <code>{highlightCode(block.content, block.language)}</code>
                          </pre>
                        </div>
                      );
                    case 'quote':
                      return (
                        <blockquote key={idx} className="border-l-2 border-emerald-500 bg-emerald-500/5 p-4 rounded text-xs sm:text-sm font-mono text-emerald-300 my-4 leading-relaxed">
                          {block.content}
                        </blockquote>
                      );
                    case 'callout':
                      return (
                        <div key={idx} className="flex gap-3 border border-zinc-805 bg-zinc-900/20 p-4 rounded-md my-4 items-start text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="flex-1 font-light">{block.content}</div>
                        </div>
                      );
                    case 'image':
                      return (
                        <div key={idx} className="border border-zinc-900 rounded overflow-hidden relative w-full h-80 my-4 bg-zinc-900/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={block.content} 
                            alt="Security walkthrough screenshot" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      );
                    default:
                      return null;
                  }
                })
              ) : (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <BookOpen className="w-10 h-10 text-zinc-600 animate-pulse" />
                  <p className="text-xs text-zinc-500 font-mono text-center">NO_EVIDENCE_BODY_LOGGED_IN_NOTION_ROWS</p>
                </div>
              )}

              {/* SIGNATURE / DISCHARGE AT THE END */}
              <div className="border-t border-zinc-900/60 mt-12 pt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-mono text-xs text-zinc-500">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-emerald-500/80" />
                  <div>
                    <span className="text-zinc-400 block font-semibold text-[11px]">love07oj SEC LOGGED SIGNATURE</span>
                    <span className="text-[10px]">DIGITAL_ECDSA_VALIDATED: OK</span>
                  </div>
                </div>
                <div className="text-left sm:text-right text-[10px]">
                  <span>ENCRYPTED RECON ARCHIVE DEBRIEF</span>
                  <br/>
                  <span>AUDIT STATE: FULLY COMPILED</span>
                </div>
              </div>

            </section>

            {/* BOTTOM METADATA FOR PLATFORMS */}
            <section className="bg-zinc-950/40 border border-zinc-900 rounded p-6 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-zinc-500">TAGS:</span>
                {blog.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-900/60 border border-zinc-805 px-2 py-0.5 rounded">
                    <Tag className="w-2.5 h-2.5 text-emerald-500/70" />
                    {tag}
                  </span>
                ))}
              </div>
              
              <Link 
                href="/blogs"
                className="text-xs text-emerald-400/80 hover:text-emerald-400 font-mono flex items-center gap-1 transition-colors hover:underline shrink-0"
              >
                <span>RETURN TO ARCHIVES</span>
                <span>&rarr;</span>
              </Link>
            </section>

            {/* SUGGESTED RELATED INTEL & WRITEUPS */}
            {relatedWriteups.length > 0 && (
              <section className="flex flex-col gap-4 border-t border-zinc-900 pt-8 text-left max-w-full">
                <div className="flex items-center gap-2 select-none">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-zinc-350 font-bold">
                    08 // RELATED WRITEUPS
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedWriteups.map((relatedPost) => {
                    const relatedPath = `/blogs/${encodeURIComponent(relatedPost.type.replace(/\s+/g, '-'))}/${encodeURIComponent(relatedPost.platform.replace(/\s+/g, '-'))}/${relatedPost.slug}`;
                    return (
                      <Link 
                        key={relatedPost.id} 
                        href={relatedPath}
                        className="group border border-zinc-900 bg-zinc-950/20 p-4 rounded-xl flex flex-col justify-between hover:border-emerald-500/20 transition-all hover:-translate-y-0.5 duration-200 shadow-md relative"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 mb-2 font-mono text-[8px] text-zinc-500">
                            <span className="uppercase text-emerald-400/80 font-semibold">{relatedPost.platform}</span>
                            <span>•</span>
                            <span>{relatedPost.difficulty}</span>
                          </div>
                          <h4 className="text-xs font-sans font-normal text-zinc-300 group-hover:text-emerald-400 leading-snug transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h4>
                        </div>
                        <div className="mt-3 text-[9px] font-mono text-zinc-500 flex items-center gap-1 group-hover:text-zinc-450 transition-colors">
                          <span>DECRYPT INTEL</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-emerald-500" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

          </div>

          {/* Right Column (Sticky Table of Contents desktop visual panel) */}
          <aside className="w-full lg:w-[288px] shrink-0 sticky top-[95px]">
            {headings.length > 0 && (
              <BlogDetailSidebar headings={headings} />
            )}
          </aside>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-950 bg-black/50 py-10 mt-20 px-4 sm:px-8 text-center text-zinc-600 font-mono text-xs z-10">
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 love07oj. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

    </div>
  );
}
