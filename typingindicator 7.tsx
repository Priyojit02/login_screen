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
    <div className="flex gap-6">
      {/* Avatar */}
      <div className="relative shrink-0 w-8 h-8">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-purple-500/30"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-purple-500/20"
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
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
        </div>
        <div className="inline-flex flex-col gap-2 bg-message-user-light dark:bg-message-user-dark rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm min-w-[200px]">
          {/* Animated dots */}
          <div className="flex items-center gap-2">
            <motion.span
              className="w-2.5 h-2.5 rounded-full bg-purple-500"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className="w-2.5 h-2.5 rounded-full bg-purple-500"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className="w-2.5 h-2.5 rounded-full bg-purple-500"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            />
          </div>
          
          {/* Status badge with pulsing dot */}
          <motion.div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              {displayStatus === 'queued' ? `Queued${ellipsis}` : `Running${ellipsis}`}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
