"use client";

import { motion } from 'framer-motion';
import { Bot, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  status?: 'running' | 'queued' | null;
  isAgentMode?: boolean;
}

export function TypingIndicator({ status }: TypingIndicatorProps) {
  // Always show status when this component is rendered (it's only shown during loading)
  const displayStatus = status || 'running';
  const [dotStep, setDotStep] = useState(0);

  // Cycle through . .. ... to make the ellipsis feel alive
  useEffect(() => {
    const id = setInterval(() => {
      setDotStep((prev) => (prev + 1) % 3);
    }, 420);
    return () => clearInterval(id);
  }, []);

  const ellipsis = ['.', '..', '...'][dotStep];
  
  return (
    <div className="flex gap-4">
      {/* Avatar */}
      <div className="relative shrink-0 w-8 h-8">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-purple-500/25"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <div className="relative w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
          <Bot className="h-4 w-4" />
        </div>
      </div>

      {/* Typing dots and status */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
            ChatAI
          </p>
          {/* Show Running/Queued status */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            {displayStatus === 'queued' ? `Queued${ellipsis}` : `Running${ellipsis}`}
          </span>
        </div>
        <div className="inline-flex items-center gap-3 bg-message-user-light dark:bg-message-user-dark rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <motion.span
            className="w-2 h-2 rounded-full bg-text-secondary-light dark:bg-text-secondary-dark"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-text-secondary-light dark:bg-text-secondary-dark"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="w-2 h-2 rounded-full bg-text-secondary-light dark:bg-text-secondary-dark"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
          />
          <span className="font-mono text-sm text-text-secondary-light dark:text-text-secondary-dark">
            {ellipsis}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            {displayStatus === 'queued' ? 'Queued' : 'Running'}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1">
          <motion.span
            className="inline-flex h-2 w-2 rounded-full bg-green-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
          <span>{displayStatus === 'queued' ? `Queued${ellipsis}` : `Running${ellipsis}`}</span>
        </div>
      </div>
    </div>
  );
}
