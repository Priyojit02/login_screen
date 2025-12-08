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
            ? 'bg-orange-100 dark:bg-orange-900/40' 
            : 'bg-accent/10'}`}>
            {isAgentActive && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-lg border border-orange-500/60"
                animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.08, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
            {isAgentMode ? (
              <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            ) : (
              <Bot className="h-5 w-5 text-accent" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
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

      {/* Job Progress (for agent mode) */}
      {currentJob && currentJob.status === 'running' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 
                     border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Processing your request...
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                The agent is generating your document. This may take a moment.
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
          {isLoading && !isStreaming && (
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
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  );
}
