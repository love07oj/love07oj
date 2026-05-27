'use client';

import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 text-[10px] text-zinc-400 hover:text-emerald-400 font-mono transition-all duration-200 cursor-pointer shadow"
      title="Copy commands to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-400 animate-scale-up" />
          <span className="text-emerald-400">COPIED</span>
        </>
      ) : (
        <>
          <Clipboard className="w-3 h-3" />
          <span>COPY</span>
        </>
      )}
    </button>
  );
}
