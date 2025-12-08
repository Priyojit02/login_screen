'use client';

import { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bot, FileText, Zap } from 'lucide-react';
import Image from 'next/image';
import { useChatStore } from '@/store/chatStore';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ModelSelector } from './ModelSelector';

export function ChatArea() {
  const { currentChatId, chats, isLoading, isStreaming, agents, currentJob } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentChat = currentChatId ? chats.find(c => c.id === currentChatId) : null;
  const messages = useMemo(() => currentChat?.messages || [], [currentChat?.messages]);
  const isAgentMode = currentChat?.agent_id != null;
  const currentAgent = agents.find(a => a.id === currentChat?.agent_id);
  const isAgentActive = isAgentMode && currentJob && (currentJob.status === 'running' || currentJob.status === 'queued');
  const showRunning = (isLoading && !isStreaming) || isAgentActive;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark shrink-0">
        <div className="flex items-center gap-3">
          <div className={`relative p-2 rounded-lg ${isAgentMode 
            ? 'bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700' 
            : 'bg-accent/10'}`}>
            {isAgentActive && (
              <>
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-lg border border-orange-500/70 shadow-[0_0_12px_rgba(234,88,12,0.5)]"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.12, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                />
                <motion.span
                  aria-hidden
                  className="absolute inset-[-6px] rounded-lg bg-orange-500/15 blur-[10px]"
                  animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                />
              </>
            )}
            {isAgentMode ? (
              <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            ) : (
              <Bot className="h-5 w-5 text-accent" />
            )}
            {isAgentActive && (
              <motion.div
                className="absolute -right-3 top-1/2 -translate-y-1/2 bg-orange-500 text-white text-[10px] font-semibold rounded-full px-2 py-1 shadow-md flex items-center gap-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 1.1, repeat: Infinity }}
              >
                <span className="flex gap-0.5">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-white"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-white"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-white"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: 0.4 }}
                  />
                </span>
                <span className="uppercase tracking-tight">Run</span>
              </motion.div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-lg flex items-center gap-2">
                ChatAI
                <Image 
                  src="/pwc-logo.jpg" 
                  alt="PwC" 
                  width={50} 
                  height={20}
                  className="ml-1"
                />
              </span>
              {showRunning && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  Running...
                </span>
              )}
              {isAgentMode && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900/40 
                               text-orange-700 dark:text-orange-300 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Agent
                </span>
              )}
            </div>
            {currentChat?.title && (
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {currentChat.title}
              </span>
            )}
          </div>
        </div>
        
        {/* Model Selector */}
        <ModelSelector />
      </header>

      {/* Agent Mode Banner */}
      {isAgentMode && currentAgent && messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 
                     dark:from-orange-900/20 dark:to-amber-900/20 
                     border border-orange-200 dark:border-orange-800"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-200 dark:bg-orange-800">
              <FileText className="h-5 w-5 text-orange-700 dark:text-orange-300" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                {currentAgent.name} Active
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-0.5">
                {currentAgent.description}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                💡 Paste your ABAP code below to generate a Technical Specification document.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth scrollbar-visible">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
              isLast={index === messages.length - 1}
              isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
            />
          ))}
          
          {/* Typing indicator with status */}
          {(isLoading && !isStreaming) || (isAgentMode && currentJob && (currentJob.status === 'running' || currentJob.status === 'queued')) ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TypingIndicator 
                status={currentJob?.status === 'queued' || currentJob?.status === 'running' 
                  ? currentJob.status 
                  : 'running'} 
                isAgentMode={isAgentMode}
              />
            </motion.div>
          ) : null}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  );
}
