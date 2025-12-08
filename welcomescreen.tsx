'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Sparkles, 
  Code, 
  FileText, 
  Zap, 
  ArrowRight,
  Bot,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { ChatInput } from './ChatInput';
import { ModelSelector } from './ModelSelector';

const normalChatSuggestions = [
  {
    icon: Code,
    title: 'Code assistance',
    description: 'Get help with programming questions',
    prompt: 'Help me understand how to implement this feature in my code.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MessageSquare,
    title: 'General questions',
    description: 'Ask anything you want to know',
    prompt: 'What are the best practices for clean code architecture?',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Sparkles,
    title: 'Explain concepts',
    description: 'Learn about any topic',
    prompt: 'Explain the key concepts of API design.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Quick help',
    description: 'Fast answers to simple questions',
    prompt: 'What is the difference between REST and GraphQL?',
    color: 'from-orange-500 to-red-500',
  },
];

// Agent mode no longer shows predefined suggestion cards
const agentSuggestions: never[] = [];

export function WelcomeScreen() {
  const { 
    sendMessage, 
    selectedProvider, 
    selectedModel, 
    agents, 
    selectedAgentId,
    chatMode,
    isConnected,
    connectionError,
  } = useChatStore();

  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  const suggestions = chatMode === 'agent' ? agentSuggestions : normalChatSuggestions;

  const handleSuggestionClick = async (prompt: string) => {
    await sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with model selector */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-accent" />
          <span className="font-semibold text-lg flex items-center gap-2">
            ChatAI
            <Image src="/pwc-logo.jpg" alt="PwC" width={46} height={18} />
          </span>
        </div>
        <ModelSelector />
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto w-full"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg
                           ${chatMode === 'agent' 
                             ? 'bg-gradient-to-br from-orange-500 to-red-500' 
                             : 'bg-gradient-to-br from-accent to-accent-light'}`}>
              {chatMode === 'agent' ? (
                <FileText className="h-10 w-10 text-white" />
              ) : (
                <Sparkles className="h-10 w-10 text-white" />
              )}
            </div>
          </motion.div>

          {/* Connection Status */}
          {connectionError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
            >
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{connectionError}</span>
              </div>
            </motion.div>
          )}

          {/* Dynamic Title based on mode and selection */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold mb-3"
          >
            {chatMode === 'agent' 
              ? `Ready to generate documents!` 
              : `How can I help you today?`}
          </motion.h1>

          {/* Status card hidden in agent mode to keep UI minimal */}
          {chatMode !== 'agent' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-6"
            >
              <div className={`inline-flex flex-col sm:flex-row items-center gap-3 px-5 py-3 rounded-xl
                             bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    <span className="font-medium">{selectedProvider}</span>
                    <span className="text-gray-500 mx-1">•</span>
                    <span className="text-gray-600 dark:text-gray-400">{selectedModel}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Mode-specific description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-text-secondary-light dark:text-text-secondary-dark text-lg mb-8 max-w-lg mx-auto"
          >
            {chatMode === 'agent' && selectedAgent ? (
              <>
                <span className="font-semibold text-orange-600 dark:text-orange-400">{selectedAgent.name}</span>
                {' — '}
                {selectedAgent.description}
              </>
            ) : (
              'Start a conversation or choose a suggestion below'
            )}
          </motion.p>

          {/* Suggestion cards */}
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8"
            >
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestionClick(suggestion.prompt)}
                  disabled={!isConnected}
                  className="group relative flex items-start gap-3 p-4 rounded-xl border border-border-light dark:border-border-dark
                             bg-white dark:bg-gray-800/50 text-left transition-all duration-200
                             hover:border-accent/50 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${suggestion.color} 
                                  flex items-center justify-center shadow-sm`}>
                    <suggestion.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-0.5 group-hover:text-accent transition-colors">
                      {suggestion.title}
                    </h3>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {suggestion.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 
                                         transform translate-x-0 group-hover:translate-x-1 transition-all" />
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Tips based on mode */}
          {chatMode === 'agent' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-text-secondary-light dark:text-text-secondary-dark bg-gray-50 dark:bg-gray-800/50 
                         rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700"
            >
              <p className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <span><strong>Tip:</strong> Paste your ABAP code and the agent will generate a comprehensive Technical Specification document (DOCX).</span>
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Input area */}
      <div className="absolute bottom-0 left-0 right-0">
        <ChatInput />
      </div>
    </div>
  );
}
