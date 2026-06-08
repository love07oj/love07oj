'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Command, 
  RefreshCw, 
  Disc, 
  Activity, 
  Terminal, 
  Award, 
  BookOpen, 
  Mail, 
  MapPin, 
  ExternalLink, 
  ChevronRight, 
  Cpu, 
  Target, 
  Sparkles,
  Layers,
  CheckCircle2,
  FileText,
  User,
  Radio,
  Copy,
  Check,
  Download
} from 'lucide-react';

interface ColorTheme {
  name: string;
  from: string;
  to: string;
  glow: string;
  gridColor: string;
}

const THEMES: Record<'emerald' | 'aurora' | 'mint', ColorTheme> = {
  emerald: {
    name: 'Emerald Aurora',
    from: '#10b981', // emerald-500
    to: '#a3e635',   // lime-400
    glow: 'rgba(16, 185, 129, 0.12)',
    gridColor: 'rgba(16, 185, 129, 0.02)',
  },
  aurora: {
    name: 'Neon Aurora',
    from: '#06b6d4', // cyan-500
    to: '#10b981',   // emerald-500
    glow: 'rgba(6, 182, 212, 0.12)',
    gridColor: 'rgba(6, 182, 212, 0.02)',
  },
  mint: {
    name: 'Cyber Mint',
    from: '#2dd4bf', // teal-400
    to: '#34d399',   // emerald-400
    glow: 'rgba(45, 212, 191, 0.12)',
    gridColor: 'rgba(45, 212, 191, 0.02)',
  },
};

// Premium Security Blogs Data (minimum of 2 rows = 4 high-fidelity posts)
const BLOGS = [
  {
    id: 'graphql-idor',
    title: 'Unveiling the Shadows: Advanced IDOR Exploitation in Modern GraphQL Endpoints',
    date: 'May 18, 2026',
    readTime: '6 min read',
    tag: 'API SECURITY',
    excerpt: 'Deep dive into object-level authorization bypasses within composite GraphQL queries, auditing variable mappings, and bypass methodologies.',
    content: `GraphQL's flexible schema design makes it highly popular but also prone to deep-rooted authorization issues. Developers frequently secure the root query endpoints but fail to enforce access controls on nested, complex multi-resolver schema structures.

### The Anatomy of GraphQL Bypasses
During enterprise pentests, we often encounter scenarios where root objects check ownership, but subordinate resolvers query resource keys directly from client input arguments:

1. **Composite Query Manipulation**: Swapping UUIDs or simple identifiers inside inline fragments or deep field parameters where authorization checks are overlooked.
2. **Variable Injection**: Injecting hostile IDs directly into GraphQL query variables to exploit structural routing inconsistencies.
3. **Draft States Leakage**: Accessing restricted unpublished drafts by passing field-level filters that are not sanitized at the database level.

### Safe Mitigation Pattern
Implement uniform object-level authorization within the data access layer rather than relying on individual GraphQL field resolvers. Every data fetch operation must validate parent-tenant or user-ownership context before committing resource returns.`
  },
  {
    id: 'jwt-security',
    title: 'Deconstructing JWT Security: Critical Implementation Errors and Exploitation Techniques',
    date: 'Apr 24, 2026',
    readTime: '8 min read',
    tag: 'EXPLOITATION',
    excerpt: 'Exploring structural weaknesses in JSON Web Token logic, including key confusion, algorithm stripping, and key disclosure risks.',
    content: `JSON Web Tokens (JWT) are ubiquitous in modern session management, yet misconfigured libraries and validation logic continue to render critical networks vulnerable.

### Prevalent JWT Vulnerabilities
* **RS256 to HS256 Key Confusion**: Tricking validation systems into verifying asymmetric RS256 signatures using standard public keys as symmetric HS256 pre-shared secrets.
* **Algorithm Stripping ("alg": "none")**: Injecting un-signed payloads with stripped algorithm fields, which careless legacy validators accept as genuine.
* **Weak HMAC Secret Keys**: Extracting pre-shared secrets through lightning-fast dictionary testing on stored JWT signatures (using tools like jwt-cracker or hashcat).

### Strategic Defense Policies
Always enforce strict cryptographic configuration rules:
1. Explicitly verify the token signature using a restricted algorithms whitelist (e.g. support ONLY RS256).
2. Never rely on the token header parameter alg to initialize your local signature validation algorithms.
3. Store keys in secure Cloud Vaults instead of plain local configuration files.`
  },
  {
    id: 'attack-surface-recon',
    title: 'Precision Recon: Automating Attack Surface Discovery for Continuous Risk Reduction',
    date: 'March 11, 2026',
    readTime: '7 min read',
    tag: 'RECONNAISSANCE',
    excerpt: 'An inside look at orchestrating fast DNS scraping, virtual host identification, and live port mapping automation for enterprise-grade perimeters.',
    content: `A sound perimeter defense is impossible without understanding the true external attack surface. Rogue virtual hosts and forgotten development servers are the primary entry vectors for sophisticated threat actors.

### Structural Flow of Modern Recon Pipeline
1. **Subdomain Identification**: Running parallel DNS mappings through subfinder, amass, and scraping passive security indexes.
2. **Vhost Enumeration**: High-speed scans over target lists utilizing fuzzers like ffuf or custom Python resolvers.
3. **Port & Banner Mapping**: Interrogating open nodes securely through headless query clients (httpx / nmap) to check active container and platform tags.
4. **Automated Risk Triage**: Matching fingerprints with active CVE directories using micro scan libraries like Nuclei templates.

### Continuous Assessment Best Practice
Automate recon pipelines as recurring daily cron cycles, comparing telemetry outputs immediately to detect rogue endpoints within critical infrastructure.`
  },
  {
    id: 'securing-sdlc-pipeline',
    title: 'Defensive Engineering: Integrating Automated Security Scanning in Modern DevOps',
    date: 'Feb 15, 2026',
    readTime: '5 min read',
    tag: 'SECURE SDLC',
    excerpt: 'How to inject robust pre-commit hooks, static analysis (SAST), and automated software compound reviews directly into active development lines.',
    content: `Traditional penetration testing focuses on identifying active vulnerabilities at the end of the development lifecycle. This late-stage testing is costly and slows deployment speeds. Modern DevSecOps shifts testing left by inserting lightweight security automation directly inside code branches.

### Core Pipeline Stages
* **Pre-commit Rules**: Utilizing secure scripts (git-secrets, trufflehog) to identify hardcoded passwords or cloud secrets prior to branching.
* **Static Application Security Testing (SAST)**: Using native engine parsers to evaluate syntax safety, spotting injection risks and logic failures as code is written.
* **Software Composition Analysis (SCA)**: Scanning third-party dependencies immediately to track outdated or vulnerable vendor code assets.

### Impact Matrix
By shifting security to early stage builds, teams decrease overall vulnerability remediation costs by up to 80% while preserving modern developer release frequency.`
  }
];

// Interactive Nmap Scan Terminal Simulator Targets
const TARGETS = [
  {
    id: 'edge_router',
    name: 'EDGE_ROUTER // WAN_01',
    ip: '192.168.1.1',
    lines: [
      '┌──(love07oj㉿kali-vm)-[~]',
      '└─$ nmap -sV -sC -T4 192.168.1.1',
      'Starting Nmap 7.94 ( https://nmap.org ) at 2026-05-26 11:30 UTC',
      'Nmap scan report for edge_gateway.local (192.168.1.1)',
      'Host is up (0.0012s latency).',
      'Not shown: 997 closed tcp ports (reset)',
      'PORT    STATE SERVICE VERSION',
      '22/tcp  open  ssh     OpenSSH 8.9p1 (Ubuntu Linux)',
      '80/tcp  open  http    Apache httpd 2.4.52',
      '443/tcp open  ssl/http Apache httpd 2.4.52',
      '|_http-title: RouteOS Dashboard Secure Gateway',
      'MAC Address: 00:11:22:33:AA:BB (Cisco Systems)',
      'OS details: RouterOS v6.x, Embedded Security Core',
      'Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel',
      'Nmap done: 1 IP address scanned in 2.14 seconds',
      'STATUS: SCAN_COMPLETE // NO_CRITICAL_VULNS_FOUND'
    ]
  },
  {
    id: 'graphql_gateway',
    name: 'APOLO_GATEWAY // API_03',
    ip: '10.0.8.25',
    lines: [
      '┌──(love07oj㉿kali-vm)-[~]',
      '└─$ nmap -p- -sV --script vuln 10.0.8.25',
      'Starting Nmap 7.94 ( https://nmap.org ) at 2026-05-26 11:32 UTC',
      'Nmap scan report for apolo-api.services.lan (10.0.8.25)',
      'Host is up (0.0031s latency).',
      'Scanning all 65535 ports...',
      'PORT     STATE SERVICE VERSION',
      '80/tcp   open  http    nginx 1.18.0',
      '443/tcp  open  ssl/http nginx 1.18.0',
      '8080/tcp open  http    Node.js (Express GraphQL App)',
      '| graphQL-introspection: GraphQL Introspection is ACTIVE!',
      '|   -> HIGH_RISK: Schema introspection enabled on production API.',
      '|   -> Vulnerable to query maps structure disclosure.',
      '9000/tcp open  cluster-agent Node_Internal_Service',
      '|_IDOR_CHECK: Peer access verification warning found on /api/v1/auth',
      'OS details: Linux v5.15 Cluster node container',
      'Nmap done: 1 IP address scanned in 5.82 seconds',
      'STATUS: SCAN_COMPLETE // SEVERITY: HIGH // ACTION_REQUIRED'
    ]
  },
  {
    id: 'main_database',
    name: 'DB_CLUSTER // SEC_08',
    ip: '172.16.42.11',
    lines: [
      '┌──(love07oj㉿kali-vm)-[~]',
      '└─$ nmap -sS -O -F 172.16.42.11',
      'Starting Nmap 7.94 ( https://nmap.org ) at 2026-05-26 11:35 UTC',
      'Nmap scan report for secure-vault.db (172.16.42.11)',
      'Host is up (0.0008s latency).',
      'PORT     STATE SERVICE VERSION',
      '1433/tcp closed mssql',
      '3306/tcp closed mysql-internal',
      '5432/tcp open  postgresql PostgreSQL 14.2 (Secure SSL)',
      '|_ssl-cert: Subject: CN=secure-vault.db',
      'Device type: general purpose storage engine',
      'Running: Linux 4.X|5.X Secure Node',
      'Network Distance: 1 hop',
      'OS detection: Database controller kernel authenticated',
      'Nmap done: 1 IP address scanned in 1.45 seconds',
      'STATUS: SCAN_COMPLETE // REINFORCED // CREDENTIAL_AUTHENTICATED'
    ]
  },
  {
    id: 'kube_ingress_stg',
    name: 'KUBE_INGRESS // STG_05',
    ip: '10.144.10.82',
    lines: [
      '┌──(love07oj㉿kali-vm)-[~]',
      '└─$ nuclei -t ssl/ssl-ciphers.yaml -u https://10.144.10.82',
      '[ssl-ciphers] [ssl] [info] 10.144.10.82:443 - Supported TLSv1.2 Ciphers',
      '| TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (SEC_STRENGTH: A)',
      '| TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (SEC_STRENGTH: A)',
      '[ssl-expired] [ssl] [low] 10.144.10.82:443 - TLS Cert Expiring inside 14 Days',
      '| Issuer: Let\'s Encrypt Authority X3',
      '| Subject: CN=staging.ingress.internal',
      'STATUS: SCAN_COMPLETE // RATING: LOW_ALERT // TRACKING_LOGGED'
    ]
  },
  {
    id: 'jenkins_ci_builder',
    name: 'CI_RUNNER // OPS_04',
    ip: '10.200.4.15',
    lines: [
      '┌──(love07oj㉿kali-vm)-[~]',
      '└─$ nmap -p 8080 -sV --script http-vuln-cve2024-23897 10.200.4.15',
      'Starting Nmap at 2026-05-26 11:39 UTC',
      'Nmap scan report for build-agent-04.ops (10.200.4.15)',
      'PORT     STATE SERVICE VERSION',
      '8080/tcp open  http    Jenkins CI Server (LTS 2.440.1)',
      '| http-vuln-jenkins-path-traversal:',
      '|   -> HIGH_RISK: System is vulnerable to Arbitrary File Read (CVE-2024-23897)',
      '|   -> Disclosed /var/jenkins_home/secrets/initialAdminPassword',
      'STATUS: SCAN_COMPLETE // CRITICAL_VULNERABILITY_CONFIRMED'
    ]
  },
  {
    id: 'secure_vault_ad',
    name: 'CORP_DC // AD_01',
    ip: '172.20.100.5',
    lines: [
      '┌──(love07oj㉿kali-vm)-[~]',
      '└─$ nmap -p 88,389,445 -sV --script smb-vuln* 172.20.100.5',
      'Starting Nmap at 2026-05-26 11:42 UTC',
      'Nmap scan report for primary-dc.corp.local (172.20.100.5)',
      'PORT    STATE SERVICE      VERSION',
      '88/tcp  open  kerberos-sec Microsoft Windows Kerberos',
      '389/tcp open  ldap         Microsoft Windows Active Directory LDAP',
      '445/tcp open  microsoft-ds Windows Server 2019 Standard',
      '| smb-security-mode: Message signing is REQUIRED (Mitigates Relay)',
      '|_smb-vuln-ms17-010: System is NOT vulnerable to EternalBlue (REINFORCED)',
      'STATUS: SCAN_COMPLETE // HARDENED_STATE_CONFIRMED'
    ]
  },
  {
    id: 'docker_registry',
    name: 'REGISTRY_02 // PRV_NODE',
    ip: '192.168.44.120',
    lines: [
      '┌──(love07oj㉿kali-vm)-[~]',
      '└─$ curl -s http://192.168.44.120:5000/v2/_catalog',
      'Starting API endpoint analysis...',
      '| Connection response: HTTP/1.1 200 OK',
      '| Registry integrity audit on private sub-services:',
      '|  -> VULNERABLE: Unauthenticated access to private Docker Registry!',
      '|  -> Repositories disclosed: ["core-payment-api", "user-db-hydrator"]',
      'STATUS: SCAN_COMPLETE // UNKNOWN_REGISTRY_EXPOSED'
    ]
  },
  {
    id: 'mail_postfix_smtp',
    name: 'MAIL_MTA // SMTP_SEC',
    ip: '172.16.50.25',
    lines: [
      '┌──(love07oj㉿kali-vm)-[~]',
      '└─$ nmap -p 25,587 -sV --script smtp-commands 172.16.50.25',
      'Starting Nmap at 2026-05-26 11:46 UTC',
      'Nmap scan report for postfix-gateway.mail (172.16.50.25)',
      'PORT    STATE SERVICE VERSION',
      '25/tcp  open  smtp    Postfix smtpd',
      '|_smtp-commands: EHLO mail.postfix.lan, PIPELINING, SIZE, STARTTLS',
      '587/tcp open  smtp    Postfix smtpd',
      '|_smtp-commands: EHLO mail.postfix.lan, STARTTLS, AUTH PLAIN LOGIN',
      '| smtp-relay-check: SMTP server is SECURE against external relaying.',
      'STATUS: SCAN_COMPLETE // EXCELLENT_MTA_HYGIENE'
    ]
  }
];

function NmapTerminal({ activeTheme }: { activeTheme: any }) {
  const [currentTargetIdx, setCurrentTargetIdx] = useState(0);
  const target = TARGETS[currentTargetIdx];
  const [printedLines, setPrintedLines] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lineIndex = 0;
    const linesToAdd = target.lines;
    let timer: NodeJS.Timeout;
    
    // Defer state resets to avoid synchronous setState calls within the effect body
    const initTimer = setTimeout(() => {
      setIsScanning(true);
      setProgress(0);
      setPrintedLines([]);
    }, 0);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 12) + 6;
      });
    }, 100);

    const printNextLine = () => {
      if (lineIndex < linesToAdd.length) {
        const line = linesToAdd[lineIndex];
        if (typeof line === 'string') {
          setPrintedLines((prev) => [...prev, line]);
        }
        lineIndex++;
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        timer = setTimeout(printNextLine, Math.random() * 40 + 15);
      } else {
        setIsScanning(false);
        setProgress(100);
        // Seamless Loop: wait 4.5 seconds and transition to a random different destination target
        timer = setTimeout(() => {
          setCurrentTargetIdx((prev) => {
            if (TARGETS.length <= 1) return 0;
            let nextIdx;
            do {
              nextIdx = Math.floor(Math.random() * TARGETS.length);
            } while (nextIdx === prev);
            return nextIdx;
          });
        }, 4500);
      }
    };

    const startScanTimer = setTimeout(printNextLine, 120);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(startScanTimer);
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [currentTargetIdx, target.lines]);

  return (
    <div className="w-full rounded-lg bg-[#0a0c10] border border-[#212433] shadow-2xl overflow-hidden flex flex-col font-mono text-[9.5px] text-zinc-400 relative select-none h-[340px]">
      {/* Kali Window Header Bar / XFCE Terminal emulation */}
      <div className="bg-[#121620] border-b border-[#1c1e2b] py-2 px-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef2929]/90 border border-[#cc0000]/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#fce94f]/90 border border-[#c4a000]/40" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#8ae234]/90 border border-[#4e9a06]/40" />
          <span className="text-zinc-300 text-[8.5px] font-semibold ml-2 font-mono tracking-wide">love07oj@kali-vm: ~</span>
        </div>
        <div className="text-[8px] font-mono text-zinc-500 flex gap-3 font-medium select-none pr-1">
          <span className="hover:text-zinc-300 cursor-default">File</span>
          <span className="hover:text-zinc-300 cursor-default">Edit</span>
          <span className="hover:text-zinc-300 cursor-default">View</span>
          <span className="hover:text-zinc-300 cursor-default">Terminal</span>
          <span className="hover:text-zinc-300 cursor-default">Help</span>
        </div>
      </div>

      {/* Terminal Content Embed */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto overflow-x-hidden flex flex-col gap-1 text-left bg-[#0c0e14]/95 scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {(printedLines || []).map((line, idx) => {
          if (!line || typeof line !== 'string') return null;

          if (line.startsWith('┌──')) {
            return (
              <div key={idx} className="font-mono text-[9px] leading-relaxed mt-1.5 first:mt-0 select-text">
                <span className="text-[#34e2e2]">┌──(</span>
                <span className="font-semibold text-[#ef2929]">love07oj㉿kali-vm</span>
                <span className="text-[#34e2e2]">)-[</span>
                <span className="text-zinc-100 font-medium">~</span>
                <span className="text-[#34e2e2]">]</span>
              </div>
            );
          }
          if (line.startsWith('└─$')) {
            const command = line.replace('└─$', '').trim();
            return (
              <div key={idx} className="font-mono text-[9.5px] leading-relaxed text-zinc-100 select-text">
                <span className="text-[#34e2e2] mr-2">└─$</span>
                <span className="font-semibold text-zinc-100">{command}</span>
              </div>
            );
          }

          let isHighRisk = line.includes('HIGH_RISK') || line.includes('CRITICAL_VULNERABILITY_CONFIRMED') || line.includes('CRITICAL') || line.includes('-> HIGH_RISK:') || line.includes('VULNERABLE');
          let isSuccess = line.includes('open') || line.includes('ACTIVE') || line.includes('NO_CRITICAL_VULNS_FOUND') || line.includes('SECURE') || line.includes('HARDENED') || line.includes('REINFORCED');
          let isCompleted = line.startsWith('STATUS');

          let textColor = 'text-zinc-400';
          if (isHighRisk) {
            textColor = 'text-rose-500 font-semibold';
          } else if (isSuccess) {
            textColor = 'text-emerald-400 font-medium';
          } else if (isCompleted) {
            textColor = 'text-zinc-200 font-bold border-t border-zinc-900/60 pt-1 mt-1';
          } else if (line.startsWith('|')) {
            textColor = 'text-zinc-500';
          }

          let contentNode: React.ReactNode = line;
          if (!isHighRisk && !isCompleted && !line.startsWith('|')) {
            const parts = line.split(/(\s+)/);
            contentNode = parts.map((part, pIdx) => {
              if (/^\d+\/(tcp|udp)$/.test(part)) {
                return <span key={pIdx} className="text-cyan-400 font-semibold">{part}</span>;
              }
              if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(part)) {
                return <span key={pIdx} className="text-amber-400 font-medium">{part}</span>;
              }
              if (part === 'open') {
                return <span key={pIdx} className="text-emerald-400 font-bold">{part}</span>;
              }
              if (part === 'closed' || part === 'filtered') {
                return <span key={pIdx} className="text-[#ef2929]">{part}</span>;
              }
              const standardService = ['kerberos-sec', 'msrpc', 'ldap', 'microsoft-ds', 'http'].includes(part.toLowerCase()) || part.startsWith('Windows');
              if (standardService) {
                return <span key={pIdx} className="text-purple-400">{part}</span>;
              }
              return <span key={pIdx}>{part}</span>;
            });
          }

          return (
            <div key={idx} className={`leading-relaxed break-all select-text font-mono text-[9.5px] ${textColor}`}>
              {contentNode}
            </div>
          );
        })}
        {isScanning && (
          <div className="flex items-center gap-1.5 text-zinc-600 animate-pulse mt-1 select-none font-mono">
            <span className="w-1 h-3 bg-zinc-700 animate-pulse" />
            <span>resolving target host {target.ip}...</span>
          </div>
        )}
      </div>

      {/* Dynamic HUD loop bar */}
      <div className="border-t border-[#1c1e2b] bg-[#0c0f16] p-3 flex flex-col gap-1.5 select-none">
        <div className="flex items-center justify-between text-[7.5px] uppercase tracking-wider text-zinc-500 font-semibold">
          <span className="truncate">SCANNING: {target.name}</span>
          <span style={{ color: activeTheme.from }}>{progress}% ACTIVE</span>
        </div>
        <div className="w-full h-[4px] bg-zinc-950 rounded-full overflow-hidden flex">
          <div 
            className="h-full transition-all duration-150 rounded-full" 
            style={{ 
              width: `${progress}%`,
              backgroundColor: activeTheme.from 
            }} 
          />
        </div>
      </div>
    </div>
  );
}

const SCRAMBLE_NAMES = ['OJASVA MESHRAM', 'love07oj'];

const NameScrambler = ({ activeTheme }: { activeTheme: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(SCRAMBLE_NAMES[0]);
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let rId: number;
    const chars = 'ABCDEFGHIKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:<>?';
    
    const scrambleText = (targetText: string) => {
      let frame = 0;
      const totalFrames = 18;
      
      const tick = () => {
        if (frame >= totalFrames) {
          setDisplayText(targetText);
          return;
        }
        
        const progress = frame / totalFrames;
        const revealCount = Math.floor(progress * targetText.length);
        
        let result = '';
        for (let i = 0; i < targetText.length; i++) {
          if (i < revealCount) {
            result += targetText[i];
          } else {
            if (targetText[i] === ' ') {
              result += ' ';
            } else {
              result += chars[Math.floor(Math.random() * chars.length)];
            }
          }
        }
        
        setDisplayText(result);
        frame++;
        rId = requestAnimationFrame(tick);
      };
      
      tick();
    };

    intervalId = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % SCRAMBLE_NAMES.length;
        scrambleText(SCRAMBLE_NAMES[next]);
        return next;
      });
    }, 4000);

    return () => {
      clearInterval(intervalId);
      cancelAnimationFrame(rId);
    };
  }, []);

  return (
    <span 
      className="transition-colors duration-300 font-sans tracking-wide font-light antialiased"
      style={{
        textShadow: `0 0 25px ${activeTheme.from}15`
      }}
    >
      {displayText}
    </span>
  );
};


interface HomeClientProps {
  initialBlogs?: any[];
}

export default function Home({ initialBlogs }: HomeClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [themeKey, setThemeKey] = useState<'emerald' | 'aurora' | 'mint'>('emerald');
  const activeTheme = THEMES[themeKey];

  // UI state hooks
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isCursorOnScreen, setIsCursorOnScreen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  
  // Custom interactive tab for skills filter
  const [activeSkillCategory, setActiveSkillCategory] = useState<'all' | 'wapt' | 'testing' | 'tools' | 'strengths'>('all');



  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  
  // HUD states
  const [integrityScore, setIntegrityScore] = useState(99);
  const [systemUptime, setSystemUptime] = useState('00:00:00');

  // Selected blog state for interactive loading modal
  const [selectedBlog, setSelectedBlog] = useState<typeof BLOGS[0] | null>(null);

  const [featuredBlogsList, setFeaturedBlogsList] = useState<any[]>(() => {
    const dataSource = (initialBlogs && initialBlogs.length > 0) ? initialBlogs : BLOGS;
    // Filter blogs marked as featured
    const featured = dataSource.filter((b: any) => b.featured === true);
    // Highlight at least 2 rows of items or fall back to first 4
    const targetBlogs = featured.length > 0 ? featured : dataSource.slice(0, 4);

    return targetBlogs.map((b: any) => {
      const formatSegment = (s: string) => encodeURIComponent((s || '').replace(/\s+/g, '-'));
      const hrefPath = b.type && b.platform && b.slug
        ? `/blogs/${formatSegment(b.type)}/${formatSegment(b.platform)}/${b.slug}`
        : `/blogs`;

      return {
        id: b.id,
        title: b.title,
        date: b.date || 'RECENT',
        readTime: b.readTime || (b.difficulty ? `${b.difficulty.toUpperCase()} • 5 min read` : '5 min read'),
        tag: (b.type || b.tag || 'SECURITY WRITEUP').toUpperCase(),
        excerpt: b.summary || b.excerpt || '',
        hrefPath: hrefPath
      };
    });
  });

  // Motion values for fluid trail
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Elite dampening spring cursor dynamics - Faster, responsive tracking
  const mainX = useSpring(mouseX, { damping: 10, stiffness: 1100, mass: 0.01 });
  const mainY = useSpring(mouseY, { damping: 10, stiffness: 1100, mass: 0.01 });

  const ringX = useSpring(mouseX, { damping: 14, stiffness: 750, mass: 0.05 });
  const ringY = useSpring(mouseY, { damping: 14, stiffness: 750, mass: 0.05 });

  const bead1X = useSpring(mouseX, { damping: 16, stiffness: 600, mass: 0.08 });
  const bead1Y = useSpring(mouseY, { damping: 16, stiffness: 600, mass: 0.08 });

  const bead2X = useSpring(mouseX, { damping: 18, stiffness: 450, mass: 0.12 });
  const bead2Y = useSpring(mouseY, { damping: 18, stiffness: 450, mass: 0.12 });

  // Render initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    // Simulated terminal ticking clock logic
    const interval = setInterval(() => {
      const now = new Date();
      setSystemUptime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      );
    }, 1000);

    // Escape listener for accessibility closing of modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedBlog(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX);
    mouseY.set(clientY);

    if (!isCursorOnScreen) {
      setIsCursorOnScreen(true);
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      setCoords({ x: Math.round(x), y: Math.round(y) });
      containerRef.current.style.setProperty('--mouse-x', `${x}px`);
      containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  const handleMouseLeave = () => {
    setIsCursorOnScreen(false);
  };

  const handleMouseEnter = () => {
    setIsCursorOnScreen(true);
  };

  const handlePointerDown = () => {
    setIsPointerDown(true);
    if (integrityScore < 100) {
      setIntegrityScore(prev => Math.min(100, prev + 1));
    }
  };

  const handlePointerUp = () => {
    setIsPointerDown(false);
  };

  const rotateTheme = () => {
    const keys: ('emerald' | 'aurora' | 'mint')[] = ['emerald', 'aurora', 'mint'];
    const currentIndex = keys.indexOf(themeKey);
    const nextIndex = (currentIndex + 1) % keys.length;
    setThemeKey(keys[nextIndex]);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#0C0C0C]" id="initial-loading" />;
  }

  // Raw interactive data models
  const experiences = [
    {
      role: 'Cyber Security Analyst / VAPT Consultant',
      company: 'Accenture',
      duration: '3.5 Years',
      icon: Shield,
      responsibilities: [
        'Conducted Web Application Penetration Testing (WAPT) and Vulnerability Assessment & Penetration Testing (VAPT) for enterprise applications, APIs, admin portals, and internal systems.',
        'Performed authenticated and unauthenticated security testing using manual and automated methodologies for client landscapes.',
        'Identified and manually validated vulnerabilities including SQL Injection, Peer-Level Exploitation, XSS, IDOR, SSRF, CSRF, JWT validation flaws, and high-impact business logic flows.',
        'Executed complete RESTful and GraphQL API security assessments focusing on custom auth tokens, token manipulation, privilege escalation, and custom parameters.',
        'Used Burp Suite Professional extensively for traffic interception, deep requests manipulation, payload fuzzing, and manual vulnerability exploitation.',
        'Conducted enterprise network and application scanning using Nessus, Qualys, OWASP ZAP, and custom Nuclei yaml templates.',
        'Eliminated false positives from scanner reports through diligent manual verification, ensuring precise remediation strategies.',
        'Collaborated meticulously with remote/onsite developer squads to define mitigation roadmaps and clarify high-risk impacts.',
        'Produced high-fidelity proof-of-concept guidelines, clear reproduction vectors, remediation steps, and corresponding CVSS scores.',
        'Performed validation and official retesting to record safe mitigation states prior to production releases.',
        'Tracked testing statuses, evidence logs, and lifecycle remediation assignments using Jira, Confluence, and ServiceNow ticketing workflows.'
      ],
      achievements: [
        'Successfully completed multiple enterprise-tier core application and web API compliance assessments.',
        'Significantly enhanced report fidelity and client experience by reducing manual false-positive rates.',
        'Instructed non-security technical units on safe code writing policies regarding modern OWASP Top 10 vulnerabilities.'
      ]
    }
  ];

  const skillTabs = [
    { id: 'all', name: '[ ALL CONTEXTS ]' },
    { id: 'wapt', name: '[ APP SECURITY ]' },
    { id: 'testing', name: '[ SEC VECTORS ]' },
    { id: 'tools', name: '[ ARMAMENT/TOOLS ]' },
  ];

  const portfolioSkills = {
    wapt: [
      'Web Application Penetration Testing (WAPT)',
      'Vulnerability Assessment & Penetration Testing (VAPT)',
      'API Security Testing (REST / GraphQL)',
      'OWASP Top 10 Exploitation',
      'Authentication & Authorization Integrity',
      'Business Logic Bypass Detection',
      'Session Management Audits',
      'Access Control Validation (IDOR/BAC)',
      'Security Misconfiguration Analysis',
      'Manual Vulnerability Verification',
      'Secure SDLC Integration Awareness'
    ],
    testing: [
      'SQL Injection Exploitation',
      'Cross-Site Scripting (Stored/Reflected/DOM XSS)',
      'IDOR & Broken Access Control Validation',
      'Server-Side Request Forgery (SSRF)',
      'Cross-Site Request Forgery (CSRF)',
      'JWT Security (Alg: None, Signature Spoofing)',
      'File Upload Bypass Vectors',
      'Authentication Bypass & MFA Flaws',
      'Privilege Escalation Scenarios',
      'Sensitive Data Exposure & Memory Leaks',
      'API Authorization Weaknesses',
      'CORS Misconfiguration exploitation',
      'Rate Limiting & Race Condition Flaws'
    ],
    tools: [
      'Burp Suite Professional (Core Weapon)',
      'OWASP ZAP',
      'Postman',
      'Nmap (Network Mapping)',
      'Nessus Professional',
      'Qualys Guard Scanner',
      'Nuclei Template Automation',
      'ffuf / Gobuster (Recon)',
      'sqlmap (SQL Extraction)',
      'Metasploit Framework',
      'Linux/Unix Environment Administration',
      'Git & Version Control System',
      'Jira, Confluence & ServiceNow'
    ],
    additional: [
      'eJPT Security Certification Basics',
      'Technical Incident Reporting',
      'Cybersecurity Research & Vulnerability Writing',
      'CVSS 3.1 & 4.0 Scoring Calculations',
      'Capture The Flag (CTF) Problem Solving',
      'Automated Attack Surface Mapping',
      'Bug Bounty Hunter Methodologies'
    ]
  };

  const techMatrix = [
    { category: 'Operating Systems', skills: 'Linux (Kali/Debian), Windows Enterprise' },
    { category: 'Security Tools', skills: 'Burp Suite Pro, Nessus, Qualys, OWASP ZAP, Nmap' },
    { category: 'API Security Testing', skills: 'Postman Client, Burp Repeater & Intruder, Swagger Hub' },
    { category: 'Reconnaissance Tools', skills: 'ffuf, Nuclei, subfinder, httpx, Dirsearch' },
    { category: 'Scripting & Dev Basics', skills: 'Bash shell scripting, Python (Security tooling automation)' },
    { category: 'Auditing Methodologies', skills: 'OWASP Testing Guide (WSTG), PTES Standard Frameworks' },
  ];

  const strengths = [
    'Strong analytical and logical problem-solving methodology',
    'Ability to perform completely independent security audits',
    'Clear and effective technical reporting for stakeholders',
    'Professional, secure client-facing engagement communication',
    'High standard of manual validation instead of blind scanner trust',
    'Constant learner dedicated to analyzing novel zero-day disclosures'
  ];

  const interests = [
    'Active Capture The Flag (CTF) game participant',
    'Writing interactive automation scripts for threat assessment',
    'Security blogging and technical writeups of complex findings',
    'Vulnerability research and API authorization flow exploitation styles',
    'Custom Subdomain Recon Automation pipelines'
  ];

  return (
    <div
      ref={containerRef}
      id="canvas-root"
      className="relative min-h-screen w-full bg-[#0C0C0C] text-zinc-100 flex flex-col justify-start items-center select-none transition-all duration-700 font-sans"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{
        backgroundImage: `
          radial-gradient(550px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${activeTheme.glow}, transparent 80%),
          radial-gradient(circle at 50% 50%, #151515 0%, #0C0C0C 100%),
          linear-gradient(to right, rgba(255, 255, 255, 0.01) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 50px 50px, 50px 50px',
      }}
    >
      {/* Decorative fine organic grain pattern to accent the dark charcoal architecture */}
      <div 
        id="grain-texture"
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Cybernetic ambient top bar HUD */}
      <header className="w-full border-b border-zinc-900 bg-[#0E0E0F]/90 backdrop-blur-xl py-3.5 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 z-40 select-none sticky top-0">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase">
            SEC_AUDIT // <span className="font-semibold text-zinc-200" style={{ color: activeTheme.from }}>OJASVA.PORTFOLIO</span>
          </span>
        </div>

        {/* Simplified Navigation Context & Shift Color theme action trigger */}
        <div className="flex items-center gap-4 sm:gap-6 font-mono text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-[0.15em]">
          <button 
            type="button"
            onClick={() => scrollToSection('summary')}
            className="hover:text-zinc-200 transition-colors uppercase px-1 py-0.5"
            onMouseEnter={() => setIsHovered('nav-about')}
            onMouseLeave={() => setIsHovered(null)}
            style={{ color: isHovered === 'nav-about' ? activeTheme.from : undefined }}
          >
            [ about_me ]
          </button>
          
          <Link 
            href="/blogs"
            className="hover:text-zinc-200 transition-colors uppercase px-1 py-0.5"
            onMouseEnter={() => setIsHovered('nav-blogs')}
            onMouseLeave={() => setIsHovered(null)}
            style={{ color: isHovered === 'nav-blogs' ? activeTheme.from : undefined }}
          >
            [ blogs ]
          </Link>

          <button 
            type="button"
            onClick={() => scrollToSection('contact')}
            className="hover:text-zinc-200 transition-colors uppercase px-1 py-0.5"
            onMouseEnter={() => setIsHovered('nav-contact')}
            onMouseLeave={() => setIsHovered(null)}
            style={{ color: isHovered === 'nav-contact' ? activeTheme.from : undefined }}
          >
            [ connect ]
          </button>


          <div className="border-l border-zinc-850 h-3.5 mx-0.5" />

          <button 
            type="button"
            onClick={rotateTheme}
            className="w-7 h-7 rounded bg-[#161618] border border-zinc-800 flex items-center justify-center hover:bg-zinc-800/80 hover:border-zinc-700 hover:shadow-[0_0_15px_rgba(255,255,255,0.04)] transition-all duration-300"
            title="Shift threat color levels"
            onMouseEnter={() => setIsHovered('theme-shift')}
            onMouseLeave={() => setIsHovered(null)}
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400 animate-spin-slow" style={{ color: activeTheme.from }} />
          </button>
        </div>
      </header>

      {/* Primary Scrollable Portfolio Interface Container */}
      <div 
        ref={scrollContainerRef}
        className="w-full max-w-5xl px-4 md:px-8 py-12 md:py-20 flex flex-col gap-16 md:gap-24 z-20 overflow-y-auto overflow-x-hidden selection:bg-[#10b981]/15 selection:text-emerald-300"
        style={{ scrollbarWidth: 'thin' }}
      >
        
        {/* HERO INTRO SECTION */}
        <section id="identity" className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border-b border-zinc-900/60 pb-16 pt-4">
          <div className="lg:col-span-8 flex flex-col items-start text-left lg:pr-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-2 px-3 py-1 rounded border border-zinc-900 bg-[#141415]/75 text-[10px] font-mono tracking-[0.18em] text-zinc-400 uppercase mb-5"
            >
              <Shield className="w-3 h-3 text-emerald-400 animate-pulse" style={{ color: activeTheme.from }} />
              Certified Offensive Security Professional
            </motion.div>

            {/* Custom styled large headline name - Animating and interchanging */}
            <h1 
              className="text-3xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-light tracking-wide text-zinc-100 hover:text-zinc-50 transition-colors uppercase select-text h-[40px] sm:h-[65px] md:h-[80px] lg:h-[65px] xl:h-[80px] flex items-center whitespace-nowrap"
              onMouseEnter={() => setIsHovered('headline-name')}
              onMouseLeave={() => setIsHovered(null)}
            >
              <NameScrambler activeTheme={activeTheme} />
            </h1>

            <h2 className="text-base sm:text-lg text-zinc-400 font-sans tracking-widest uppercase mt-3 select-text font-light flex flex-wrap items-center gap-2">
              <span className="text-emerald-400" style={{ color: activeTheme.from }}>Cyber Security Analyst</span>
              <span className="text-zinc-700">|</span>
              <span>Web Application Penetration Tester</span>
              <span className="text-zinc-700">|</span>
              <span className="text-zinc-400/90 hover:text-zinc-200 transition-colors cursor-pointer" onMouseEnter={() => setIsHovered('vapt-subtitle')} onMouseLeave={() => setIsHovered(null)}>VAPT Consultant</span>
            </h2>

            {/* Resume download CTA button replacing the old connected action CTA */}
            <div className="mt-8 flex flex-wrap gap-4 font-mono text-[9.5px] tracking-widest uppercase">
              <button
                onClick={() => {
                  window.open('public/Ojasva_Meshram_Offensive_Security_Resume.pdf', '_blank');
                }}
                className="px-5 py-3 rounded-lg font-medium border border-zinc-800 bg-[#121214]/65 hover:bg-zinc-900 hover:border-zinc-700 hover:text-white transition-all flex items-center gap-2.5 group shadow-[0_0_20px_rgba(255,255,255,0.01)]"
                onMouseEnter={() => setIsHovered('cta-resume')}
                onMouseLeave={() => setIsHovered(null)}
                style={{
                  borderColor: isHovered === 'cta-resume' ? activeTheme.from : undefined,
                  color: isHovered === 'cta-resume' ? activeTheme.from : undefined
                }}
              >
                <Download className="w-4 h-4" />
                <span>[ DOWNLOAD_OFFENSIVE_RESUME ]</span>
            </button>
            </div>
          </div>

          {/* Kali Terminal on Right of Hero */}
          <div className="lg:col-span-4 w-full flex flex-col justify-center">
            <NmapTerminal activeTheme={activeTheme} />
          </div>
        </section>

        {/* 01 // PROFESSIONAL SUMMARY */}
        <section id="summary" className="w-full flex flex-col gap-6 select-text text-left">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-4 bg-emerald-500 rounded" style={{ backgroundColor: activeTheme.from }} />
            <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-zinc-300">01 // Professional Summary</h3>
          </div>
          <div className="p-6 md:p-8 rounded-xl border border-zinc-900/80 bg-[#101011]/65 backdrop-blur-md relative overflow-hidden group hover:border-zinc-800 transition-all">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full blur-[100px] pointer-events-none opacity-10 transition-colors" style={{ background: `radial-gradient(circle, ${activeTheme.to}22 0%, transparent 70%)` }} />
            
            <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed">
              Cyber Security Analyst with <strong className="text-zinc-100 font-medium">3.5 years of experience</strong> in Web Application Penetration Testing (WAPT), Vulnerability Assessment & Penetration Testing (VAPT), and API Security Testing across enterprise and client-facing environments. Skilled in identifying OWASP Top 10 vulnerabilities, performing manual exploitation, validating automated scan findings, and delivering detailed remediation reports for enterprise applications.
            </p>
            <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed mt-4">
              Experienced in conducting authenticated and unauthenticated security assessments for web applications, APIs, and enterprise platforms. Strong understanding of authentication mechanisms, access control testing, business logic vulnerabilities, session management, and secure development practices.
            </p>
            <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed mt-4">
              Hands-on experience with Burp Suite Professional, Nessus, Qualys, Nuclei, Postman, OWASP ZAP, and manual security testing methodologies. Adept at working with development teams, explaining security risks, retesting fixes, and supporting secure SDLC initiatives.
            </p>
          </div>
        </section>

        {/* 02 // FEATURED THREAT INTELLIGENCE BLOGS (MINIMUM 2 ROWS) */}
        <section id="blogs" className="w-full flex flex-col gap-6 text-left">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-4 bg-teal-500 rounded" style={{ backgroundColor: activeTheme.from }} />
            <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-zinc-300">02 // Featured Intelligence Blogs</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-text">
            {featuredBlogsList.map((blog) => (
              <Link href={blog.hrefPath} key={blog.id} className="block text-left cursor-pointer">
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-xl border border-zinc-900/80 bg-[#101011]/85 backdrop-blur-md relative overflow-hidden group flex flex-col justify-between h-full hover:border-zinc-800 transition-colors"
                  onMouseEnter={() => setIsHovered(`blog-${blog.id}`)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  {/* Visual accent corner decoration */}
                  <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-zinc-800/40 group-hover:border-zinc-500/50 transition-colors" style={{ borderColor: isHovered === `blog-${blog.id}` ? activeTheme.from : undefined }} />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-zinc-800/40 group-hover:border-zinc-500/50 transition-colors" style={{ borderColor: isHovered === `blog-${blog.id}` ? activeTheme.to : undefined }} />
                  
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span 
                        className="px-2 py-0.5 rounded text-[8px] font-mono tracking-widest bg-zinc-950 border border-zinc-850" 
                        style={{ color: activeTheme.from, borderColor: `${activeTheme.from}1c` }}
                      >
                        {blog.tag}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">{blog.readTime}</span>
                    </div>
                    
                    <h4 className="text-base font-sans font-normal text-zinc-200 group-hover:text-zinc-100 transition-colors line-clamp-2 leading-snug font-medium">
                      {blog.title}
                    </h4>
                    
                    <p className="text-xs text-zinc-400 font-light mt-2.5 line-clamp-2 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>

                  <div className="border-t border-zinc-900/60 pt-4 mt-5 flex items-center justify-between font-mono text-[9px] text-zinc-550">
                    <span>DISCLOSED: {blog.date}</span>
                    <span className="flex items-center gap-1.5 text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium">
                      DECRYPT &amp; READ <ChevronRight className="w-3.5 h-3.5" style={{ color: activeTheme.from }} />
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Dynamic Link connected to secondary Notion blog router */}
          <div className="mt-4 flex justify-center w-full">
            <Link
              href="/blogs"
              className="px-6 py-4 rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-emerald-400 font-mono text-xs tracking-widest uppercase flex items-center gap-3 transition-all duration-305 w-full justify-center group cursor-pointer"
              style={{ borderColor: `${activeTheme.from}2c`, color: activeTheme.from }}
            >
              <Terminal className="w-4 h-4 animate-pulse" style={{ color: activeTheme.from }} />
              <span>ACCESS FULL OPERATIONS PORTAL & NOTION WRITEUPS ARCHIVE</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: activeTheme.from }} />
            </Link>
          </div>
        </section>

        {/* 03 // CORE SKILLS & ARSENAL */}
        <section id="skills" className="w-full flex flex-col gap-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-4 bg-lime-500 rounded" style={{ backgroundColor: activeTheme.to }} />
              <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-zinc-300">03 // Core Cyber Skills</h3>
            </div>
            
            {/* Tab layout switches */}
            <div className="flex flex-wrap gap-2">
              {skillTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSkillCategory(tab.id as any)}
                  className={`px-3 py-1 rounded text-[9px] font-mono tracking-widest transition-all ${
                    activeSkillCategory === tab.id 
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' 
                      : 'bg-transparent text-zinc-500 border border-transparent hover:text-zinc-300'
                  }`}
                  style={{ color: activeSkillCategory === tab.id ? activeTheme.from : undefined }}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-text">
            {/* Show Category 1 based on active tabs */}
            {(activeSkillCategory === 'all' || activeSkillCategory === 'wapt') && (
              <motion.div 
                layout
                className="p-6 rounded-xl border border-zinc-900/80 bg-[#101011]/80 backdrop-blur-md"
              >
                <div className="flex items-center gap-2.5 mb-5 border-b border-zinc-900 pb-3">
                  <Shield className="w-4 h-4 text-emerald-400" style={{ color: activeTheme.from }} />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-200">Application Security</h4>
                </div>
                <ul className="space-y-3">
                  {portfolioSkills.wapt.map((skill, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs md:text-sm text-zinc-400 font-light hover:text-zinc-200 transition-colors">
                      <ChevronRight className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" style={{ color: activeTheme.from }} />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Show Category 2 based on active tabs */}
            {(activeSkillCategory === 'all' || activeSkillCategory === 'testing') && (
              <motion.div 
                layout
                className="p-6 rounded-xl border border-zinc-900/80 bg-[#101011]/80 backdrop-blur-md"
              >
                <div className="flex items-center gap-2.5 mb-5 border-b border-zinc-900 pb-3">
                  <Target className="w-4 h-4 text-lime-400" style={{ color: activeTheme.to }} />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-200">Security Testing Vectors</h4>
                </div>
                <ul className="space-y-3">
                  {portfolioSkills.testing.map((skill, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs md:text-sm text-zinc-400 font-light hover:text-zinc-200 transition-colors">
                      <ChevronRight className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" style={{ color: activeTheme.to }} />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Show Category 3 based on active tabs */}
            {(activeSkillCategory === 'all' || activeSkillCategory === 'tools') && (
              <motion.div 
                layout
                className="p-6 rounded-xl border border-[#141416] bg-[#101011]/80 backdrop-blur-md col-span-1 md:col-span-2"
              >
                <div className="flex items-center gap-2.5 mb-5 border-b border-zinc-900 pb-3">
                  <Cpu className="w-4 h-4 text-teal-400" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-200">Tools, Platforms & Sec Ops Armament</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {portfolioSkills.tools.map((skill, index) => (
                    <div 
                      key={index} 
                      className="p-3.5 rounded bg-[#131315]/85 border border-zinc-900 hover:border-zinc-800 hover:bg-[#161619] transition-all flex items-center gap-2.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600 shrink-0" style={{ color: activeTheme.from }} />
                      <span className="text-xs font-mono text-zinc-300">{skill}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* 04 // WORK EXPERIENCE */}
        <section id="experience" className="w-full flex flex-col gap-6 text-left">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-4 bg-teal-500 rounded" style={{ backgroundColor: activeTheme.from }} />
            <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-zinc-300">04 // Professional Experience</h3>
          </div>

          <div className="relative border-l border-zinc-900 ml-4 pl-6 md:pl-10 space-y-12">
            {experiences.map((exp, index) => {
              const ExpIcon = exp.icon;
              return (
                <div key={index} className="relative group select-text">
                  {/* Timeline indicator node */}
                  <span className="absolute -left-[30px] md:-left-[46px] top-1 bg-[#101011] border-2 border-zinc-800 p-1.5 rounded-full z-10 group-hover:border-zinc-500 transition-colors">
                    <ExpIcon className="w-3.5 h-3.5 text-zinc-400" style={{ color: activeTheme.from }} />
                  </span>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                    <div>
                      <h4 className="text-xl font-sans font-light text-zinc-100">{exp.role}</h4>
                      <div className="text-sm text-zinc-300 font-mono mt-0.5" style={{ color: activeTheme.to }}>
                        {exp.company}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] uppercase font-mono tracking-widest text-zinc-400 inline-self-start font-medium select-text">
                      {exp.duration}
                    </span>
                  </div>

                  <div className="p-6 rounded-xl border border-zinc-900/80 bg-[#101011]/80 backdrop-blur-md relative overflow-hidden">
                    <h5 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5" /> Core Cyber Security Operations
                    </h5>
                    
                    <ul className="space-y-4 mb-6">
                      {exp.responsibilities.map((resp, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-3 text-xs md:text-sm text-zinc-400 font-light leading-relaxed hover:text-zinc-200 transition-colors">
                          <span className="w-1 h-1 rounded-full bg-zinc-600 mt-2 shrink-0" style={{ backgroundColor: activeTheme.from }} />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="border-t border-zinc-900/80 pt-4 mt-4">
                      <h5 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                        <Award className="w-3.5 h-3.5" /> High-Impact Achievements
                      </h5>
                      <ul className="space-y-2.5">
                        {exp.achievements.map((ach, aIdx) => (
                          <li key={aIdx} className="flex items-center gap-3 text-xs md:text-sm text-zinc-300 font-light">
                            <span className="text-[10px] font-semibold font-mono text-zinc-500 uppercase tracking-tighter" style={{ color: activeTheme.to }}>[OK] //</span>
                            <span>{ach}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 05 // TECHNICAL PROFICIENCY MATRIX GLASS TABLE */}
        <section id="matrix" className="w-full flex flex-col gap-6 text-left">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-4 bg-lime-400 rounded" style={{ backgroundColor: activeTheme.to }} />
            <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-zinc-300">05 // Technology Proficiency Matrix</h3>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-[#101011]/80 backdrop-blur-md">
            <table className="w-full text-left font-mono text-[11px] md:text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-500 uppercase text-[9px] tracking-widest">
                  <th className="py-4 px-6 md:px-8 font-medium">Testing Category Identifier</th>
                  <th className="py-4 px-6 md:px-8 font-medium">Empowered Armament Suite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {techMatrix.map((item, index) => (
                  <tr key={index} className="hover:bg-zinc-900/30 transition-all select-text">
                    <td className="py-4 px-6 md:px-8 text-zinc-200 font-medium whitespace-nowrap">{item.category}</td>
                    <td className="py-4 px-6 md:px-8 text-zinc-400 font-light select-text">{item.skills}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>


        {/* STUDY, EDUCATION & KEY LICENSES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full select-text">
          {/* 06 // CERTIFICATIONS */}
          <section id="certifications" className="w-full flex flex-col gap-6 text-left">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-4 bg-emerald-500 rounded" style={{ backgroundColor: activeTheme.from }} />
              <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-zinc-300">06 // Security Licenses</h3>
            </div>

            <div className="p-6 rounded-xl border border-zinc-900 bg-[#101011]/60 backdrop-blur-md hover:border-zinc-800 transition-all">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <h4 className="text-lg font-sans text-zinc-100 font-light">eJPT (eLearnSecurity Junior Penetration Tester)</h4>
                  <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mt-1" style={{ color: activeTheme.from }}>
                    INE Security Professional Trainer
                  </div>
                </div>
                <Award className="w-6 h-6 text-zinc-500" style={{ color: activeTheme.from }} />
              </div>

              <div className="border-t border-zinc-900/80 pt-3 mt-3">
                <div className="font-mono text-[10px] uppercase text-zinc-500 mb-2">Validated Testing Sectors:</div>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {portfolioSkills.additional.map((item, index) => (
                    <span key={index} className="px-2 py-1 bg-[#151516] rounded text-zinc-400 border border-zinc-900 hover:border-zinc-800 transition-colors">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 07 // EDUCATION */}
          <section id="education" className="w-full flex flex-col gap-6 text-left">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-4 bg-lime-500 rounded" style={{ backgroundColor: activeTheme.to }} />
              <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-zinc-300">07 // Education Matrix</h3>
            </div>

            <div className="p-6 rounded-xl border border-zinc-900 bg-[#101011]/60 backdrop-blur-md hover:border-zinc-800 transition-all h-full flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-lg font-sans text-zinc-100 font-light">Bachelor of Technology (B.Tech)</h4>
                  <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest mt-1">
                    Computer Science and Engineering
                  </div>
                </div>
                <BookOpen className="w-5 h-5 text-zinc-500" style={{ color: activeTheme.to }} />
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-900/80 font-mono text-[9px] text-zinc-600 tracking-wider flex items-center justify-between">
                <span>STATUS: DEGREE CONFERRED</span>
                <span>MAJOR: CSE</span>
              </div>
            </div>
          </section>
        </div>

        {/* STRENGTHS & RESEARCH INTERESTS */}
        <section id="interests" className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full select-text text-left">
          
          {/* Professional Strengths */}
          <div className="p-6 rounded-xl border border-zinc-900 bg-[#101011]/80 backdrop-blur-md">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#e4e4e7] border-b border-zinc-900 pb-3 mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" style={{ color: activeTheme.from }} />
              Professional Qualities & Strengths
            </h4>
            <ul className="space-y-3 font-mono text-[11px] text-zinc-400">
              {strengths.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 hover:text-zinc-200 transition-colors">
                  <span className="text-[#a1a1aa] font-semibold" style={{ color: activeTheme.to }}>&gt;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Research Interests */}
          <div className="p-6 rounded-xl border border-zinc-900 bg-[#101011]/80 backdrop-blur-md">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#e4e4e7] border-b border-zinc-900 pb-3 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-lime-400" style={{ color: activeTheme.to }} />
              Extracurricular & Security Interests
            </h4>
            <ul className="space-y-3 font-mono text-[11px] text-zinc-400">
              {interests.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5 hover:text-zinc-200 transition-colors">
                  <span className="text-[#a1a1aa] font-semibold" style={{ color: activeTheme.from }}>&gt;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </section>

        {/* 07 // LIAISON & TERMINAL TELEMETRY */}
        <section id="contact" className="w-full flex flex-col gap-6 select-text text-left border-t border-zinc-900/60 pt-10">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-4 bg-emerald-500 rounded" style={{ backgroundColor: activeTheme.from }} />
            <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-zinc-300">07 // Security Liaison & Cryptographic Verification</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            {/* Left Hand: Connect Details */}
            <div className="md:col-span-5 flex flex-col justify-between gap-4">
              <div className="p-6 rounded-xl border border-zinc-900 bg-[#101011]/80 backdrop-blur-md flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-sans tracking-widest text-[#e4e4e7] uppercase pb-3 border-b border-zinc-900 mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" style={{ color: activeTheme.from }} />
                    Secure Communication Portal
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                    Ready to orchestrate offensive security evaluations, execute comprehensive web & API penetration testing, or consult on authorized cyber attack simulations. All scopes processed with high privacy benchmarks.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 font-mono text-[11px] text-zinc-400">
                  <div 
                    className="flex items-center gap-3 p-3 rounded bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 transition-all"
                    onMouseEnter={() => setIsHovered('map-pune-b')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <MapPin className="w-4 h-4 text-zinc-500" style={{ color: activeTheme.from }} />
                    <span>Pune, Maharashtra, India</span>
                  </div>

                  <a 
                    href="mailto:ojasvam10@gmail.com"
                    className="flex items-center gap-3 p-3 rounded bg-zinc-950/40 border border-zinc-900 hover:border-zinc-805 transition-all group"
                    onMouseEnter={() => setIsHovered('email-link-b')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <Mail className="w-4 h-4" style={{ color: activeTheme.from, filter: `drop-shadow(0 0 6px ${activeTheme.from})` }} />
                    <span className="truncate group-hover:text-zinc-200 font-bold">ojasvam10@gmail.com</span>
                  </a>

                  <div className="flex gap-2">
                    <a 
                      href="https://linkedin.com/in/yourprofile" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-between p-3 rounded bg-zinc-950/40 border border-zinc-900 hover:border-zinc-805 hover:text-white transition-all group"
                      onMouseEnter={() => setIsHovered('linkedin-link-b')}
                      onMouseLeave={() => setIsHovered(null)}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-600 group-hover:text-zinc-500">LI //</span> Profile
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-650 group-hover:text-zinc-450" />
                    </a>
                    
                    <a 
                      href="https://github.com/love07oj" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-between p-3 rounded bg-zinc-950/40 border border-zinc-900 hover:border-zinc-805 hover:text-white transition-all group"
                      onMouseEnter={() => setIsHovered('github-link-b')}
                      onMouseLeave={() => setIsHovered(null)}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-600 group-hover:text-zinc-500">GH //</span> Repos
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-650 group-hover:text-zinc-450" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hand: Protective Cryptographic PGP Block */}
            <div className="md:col-span-7 flex flex-col">
              <div className="p-6 rounded-xl border border-zinc-900 bg-[#101011]/80 backdrop-blur-md flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-sans tracking-widest text-[#e4e4e7] uppercase pb-3 border-b border-zinc-900 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" style={{ color: activeTheme.from }} />
                    Cryptographic Verification & Operations
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                    All authorized offensive tasks, exploits, and findings are securely logged and verified using specific PGP operational keys.
                  </p>
                </div>

                <div className="mt-6 font-mono text-[9px] text-zinc-550 bg-black/40 p-4 rounded-lg border border-zinc-900/60 overflow-x-auto scrollbar-none select-text">
                  <div className="text-zinc-500 font-semibold mb-2">-----BEGIN PGP PUBLIC KEY BLOCK-----</div>
                  <div>mQINBF+M9C8BEADfO9bKzX9YqU6fJ8gG7r6K3hZ9Yp2s1F3b4c5d6e7f8g...</div>
                  <div>hZ9Yp2s1F3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w...</div>
                  <div className="mt-2 text-zinc-400">Key ID: <span className="text-zinc-200">0x07OJASVA</span></div>
                  <div className="text-zinc-400">Fingerprint: <span className="text-zinc-200" style={{ color: activeTheme.from }}>4E9A D8C1 5B0A 9F2C 7E6D  3A10 82E5 BD07 FA10</span></div>
                  <div className="text-zinc-500 font-semibold mt-2">-----END PGP PUBLIC KEY BLOCK-----</div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Cybernetic HUD Footnotes */}
      <footer className="w-full max-w-5xl py-6 border-t border-zinc-950 flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-600 font-mono tracking-wider px-6 md:px-0 z-30 select-none">
        <span>SECURITY LEVEL: ACCREDITED // CVSS SCORE: PROT-9.8</span>
        <span className="flex items-center gap-1.5 mt-2 sm:mt-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ backgroundColor: activeTheme.from }} />
          <span>Active Atmosphere Flow Engine</span>
        </span>
      </footer>

      {/* FULL SCREEN DECRYPTION MODAL READER */}
      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            id="blog-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#060607]/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 select-text cursor-default"
            onClick={() => setSelectedBlog(null)}
          >
            <motion.div
              id="blog-modal-content"
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#0c0c0d] border border-zinc-800/80 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 md:p-10 relative shadow-2xl flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header telemetry detailing */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 font-mono text-[9px] text-zinc-500 uppercase tracking-widest whitespace-nowrap overflow-x-auto">
                <span>RECON_STREAM // DECRYPTED_SESSION</span>
                <span className="text-zinc-700">|</span>
                <span>STATUS: SECURE_VIEW</span>
                <span className="text-zinc-700">|</span>
                <span style={{ color: activeTheme.from }}>{selectedBlog.readTime}</span>
              </div>

              {/* Title heading */}
              <div>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-widest bg-zinc-900 border border-zinc-850" style={{ color: activeTheme.from, borderColor: `${activeTheme.from}20` }}>
                  {selectedBlog.tag}
                </span>
                <h2 className="text-2xl md:text-3xl font-light font-sans text-zinc-100 tracking-tight mt-3 text-left leading-normal">
                  {selectedBlog.title}
                </h2>
                <div className="flex items-center gap-3 mt-4 text-xs font-mono text-zinc-400">
                  <span>Published on: {selectedBlog.date}</span>
                  <span className="text-zinc-700">|</span>
                  <span>Author: Ojasva Meshram</span>
                </div>
              </div>

              {/* Inline layout parser matching elegant terminal grids */}
              <div className="border-t border-zinc-900 pt-6 text-sm text-zinc-300 font-light leading-relaxed text-left flex flex-col gap-4 whitespace-pre-line select-text">
                {selectedBlog.content}
              </div>

              {/* Footer action tools */}
              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-900/60 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedBlog(null)}
                  className="px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 font-mono text-xs tracking-widest text-zinc-300 hover:text-zinc-100 transition-colors cursor-none"
                  onMouseEnter={() => setIsHovered('close-modal')}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  [ CLOSE SHELL ]
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADVANCED CUSTOM GRADIENT CURSOR OVERLAY */}
      <AnimatePresence>
        {isCursorOnScreen && (
          <div id="custom-cursor-renderer" className="fixed inset-0 pointer-events-none z-50 mix-blend-screen hidden lg:block">
            {/* Deep Background Glowing Aura */}
            <motion.div
              id="cursor-aura"
              style={{
                x: ringX,
                y: ringY,
                translateX: '-50%',
                translateY: '-50%',
              }}
              animate={{
                width: isHovered ? 110 : 54,
                height: isHovered ? 110 : 54,
                background: `radial-gradient(circle, ${activeTheme.from}1c 0%, ${activeTheme.to}00 70%)`,
              }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 25,
              }}
              className="absolute rounded-full pointer-events-none"
            />

            {/* Trailing Bead Particle 2 */}
            <motion.div
              id="cursor-bead-2"
              style={{
                x: bead2X,
                y: bead2Y,
                translateX: '-50%',
                translateY: '-50%',
                background: `linear-gradient(135deg, ${activeTheme.from}80, ${activeTheme.to}10)`,
              }}
              animate={{
                scale: isPointerDown ? 0.3 : 1,
              }}
              className="absolute w-2 h-2 rounded-full opacity-30 filter blur-[0.5px]"
            />

            {/* Trailing Bead Particle 1 */}
            <motion.div
              id="cursor-bead-1"
              style={{
                x: bead1X,
                y: bead1Y,
                translateX: '-50%',
                translateY: '-50%',
                background: `linear-gradient(135deg, ${activeTheme.from}cc, ${activeTheme.to}33)`,
              }}
              animate={{
                scale: isPointerDown ? 0.4 : 1,
              }}
              className="absolute w-3.5 h-3.5 rounded-full opacity-50 filter blur-[0.5px]"
            />

            {/* Elastic Orbital Glowing Ring */}
            <motion.div
              id="cursor-interactive-ring"
              style={{
                x: ringX,
                y: ringY,
                translateX: '-50%',
                translateY: '-50%',
                borderColor: activeTheme.from,
              }}
              animate={{
                width: isHovered ? 64 : 36,
                height: isHovered ? 64 : 36,
                rotate: isHovered ? 180 : 0,
                borderStyle: isHovered === 'theme-shift' ? 'dashed' : 'solid',
                borderWidth: isHovered ? '2px' : '1px',
                opacity: isHovered ? 0.9 : 0.4,
              }}
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 20,
                rotate: { duration: 1.2, ease: "easeOut" }
              }}
              className="absolute rounded-full pointer-events-none"
            >
              {isHovered && (
                <div className="absolute inset-1 border border-zinc-800/10 rounded-full animate-ping opacity-25" />
              )}
            </motion.div>

            {/* Precise Pointer Core Dot */}
            <motion.div
              id="cursor-core-dot"
              style={{
                x: mainX,
                y: mainY,
                translateX: '-50%',
                translateY: '-50%',
                background: `linear-gradient(135deg, ${activeTheme.from}, ${activeTheme.to})`,
              }}
              animate={{
                scale: isPointerDown ? 0.6 : isHovered ? 1.5 : 1,
                boxShadow: `0 0 16px ${activeTheme.from}80`,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              className="absolute w-2.5 h-2.5 rounded-full pointer-events-none flex items-center justify-center"
            >
              <div className="w-1 h-1 rounded-full bg-white opacity-40" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
