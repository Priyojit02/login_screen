'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  Square, 
  Loader2,
  Zap,
} from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { cn } from '@/lib/utils';

export function ChatInput() {
  const { 
    sendMessage, 
    isLoading, 
    isStreaming, 
    chatMode, 
    selectedAgentId, 
    agents,
    currentChatId,
    chats,
    isConnected,
    stopStreaming,
  } = useChatStore();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  const currentChat = currentChatId ? chats.find(c => c.id === currentChatId) : null;
  const isAgentChat = currentChat?.agent_id != null;

  // Determine placeholder based on mode
  const getPlaceholder = () => {
    if (isAgentChat || chatMode === 'agent') {
      return selectedAgent?.id === 'ts_fs_agent' 
        ? 'Paste your ABAP code here to generate Technical Specification...'
        : 'Enter your request for the agent...';
    }
    return 'Ask anything...';
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = async () => {
    if (!message.trim() || isLoading || !isConnected) return;
    
    const content = message.trim();
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    await sendMessage(content);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = message.trim().length > 0 && !isLoading && isConnected;

  return (
    <div className="bg-gradient-to-t from-chat-bg-light dark:from-chat-bg-dark via-chat-bg-light/95 dark:via-chat-bg-dark/95 to-transparent pt-6 pb-4 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Mode indicator above input */}
          <AnimatePresence>
            {(isAgentChat || chatMode === 'agent') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-2 flex items-center justify-center"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full 
                               bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs">
                  <Zap className="h-3 w-3" />
                  <span className="font-medium">Agent Mode</span>
                  {selectedAgent && (
                    <>
                      <span className="text-orange-400">•</span>
                      <span>{selectedAgent.name}</span>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={cn(
            'relative flex items-end gap-2 rounded-2xl border transition-all duration-200',
            'bg-input-bg-light dark:bg-input-bg-dark',
            isAgentChat || chatMode === 'agent'
              ? 'border-orange-200 dark:border-orange-800 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20'
              : 'border-border-light dark:border-border-dark focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20',
            'shadow-lg'
          )}>
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              disabled={isLoading || !isConnected}
              rows={1}
              className="flex-1 bg-transparent py-3 pr-2 resize-none outline-none 
                         text-text-primary-light dark:text-text-primary-dark
                         placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark
                         disabled:opacity-50 max-h-[200px]"
            />

            {/* Action buttons */}
            <div className="shrink-0 flex items-center gap-1 p-2">
              {/* Voice input button */}
              <button
                className="p-2 rounded-lg text-text-secondary-light dark:text-text-secondary-dark 
                           hover:text-text-primary-light dark:hover:text-text-primary-dark
                           hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                title="Voice input"
              >
                <Mic className="h-5 w-5" />
              </button>

              {/* Send/Stop button */}
              <AnimatePresence mode="wait">
                {isStreaming ? (
                  <motion.button
                    key="stop"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 
                               text-text-primary-light dark:text-text-primary-dark
                               hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    title="Stop generating"
                    onClick={stopStreaming}
                  >
                    <Square className="h-5 w-5 fill-current" />
                  </motion.button>
                ) : (
                  <motion.button
                    key="send"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: canSend ? 1.05 : 1 }}
                    whileTap={{ scale: canSend ? 0.95 : 1 }}
                    onClick={handleSubmit}
                    disabled={!canSend}
                    className={cn(
                      'p-2 rounded-lg transition-all',
                      canSend
                        ? isAgentChat || chatMode === 'agent'
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-accent text-white hover:bg-accent-hover'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    )}
                    title="Send message"
                  >
                    {isLoading && !isStreaming ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Hint text */}
          <p className="text-center text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
            {!isConnected ? (
              <span className="text-yellow-600 dark:text-yellow-400">⚠️ Connecting to backend server...</span>
            ) : isAgentChat || chatMode === 'agent' ? (
              <span>Agent will process your request and generate output documents.</span>
            ) : (
              <span>ChatAI can make mistakes. Consider checking important information.</span>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
