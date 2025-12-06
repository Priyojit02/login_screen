'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  User, 
  Bot, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown,
  RotateCcw,
  Download,
} from 'lucide-react';
import { Message, API_BASE_URL } from '@/lib/api';
import { cn, copyToClipboard } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  isStreaming?: boolean;
}

// Hide noisy backend payloads (e.g., raw status JSON) from assistant messages
function stripBackendPayload(content: string): { cleaned: string; docxLink?: string } {
  // Try to find any docx link inside the payload or message
  const docxMatch = content.match(/(\/jobs\/[\w-]+\/docx)/i);
  const docxLink = docxMatch ? docxMatch[1] : undefined;

  // Remove any section starting with the header and its following code fence/block
  const withoutPayload = content.replace(/Backend Final Status Payload[\s\S]*?(?:```[\s\S]*?```|$)/i, '').trim();
  const cleaned = withoutPayload ? withoutPayload.replace(/\n{3,}/g, '\n\n') : content;

  // Remove explicit backend status lines (program/job/status) while keeping the human-friendly summary body
  const filteredLines = cleaned
    .split('\n')
    .filter(line => !/Job ID:/i.test(line))
    .filter(line => !/Backend Status:/i.test(line))
    .filter(line => !/Final Polled Status:/i.test(line))
    .filter(line => !/^Program:/i.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // If the cleaned text lost the docx link, re-append a user-friendly link line
  const baseText = filteredLines || cleaned;
  if (docxLink && !baseText.includes(docxLink)) {
    const appended = `${baseText}\n\n📄 [Download Technical Specification (DOCX)](${docxLink})`;
    return { cleaned: appended, docxLink };
  }

  return { cleaned: baseText, docxLink };
}

export function MessageBubble({ message, isLast, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const { addToast } = useUIStore();

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const processed = isAssistant ? stripBackendPayload(message.content) : { cleaned: message.content };
  const displayedContent = processed.cleaned;

  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard(displayedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to copy',
        message: 'Could not copy to clipboard',
      });
    }
  }, [message.content, addToast]);

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    addToast({
      type: 'success',
      title: 'Feedback received',
      message: 'Thank you for your feedback!',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className={cn(
        'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser 
          ? 'bg-accent text-white' 
          : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className={cn(
        'flex-1 min-w-0',
        isUser && 'flex justify-end'
      )}>
        <div className={cn(
          'inline-block max-w-full',
          isUser && 'text-right'
        )}>
          {/* Role label */}
          <p className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">
            {isUser ? 'You' : 'ChatAI'}
          </p>

          {/* Message content */}
          <div className={cn(
            'rounded-2xl px-4 py-3',
            isUser 
              ? 'bg-accent text-white rounded-tr-sm' 
              : 'bg-message-user-light dark:bg-message-user-dark rounded-tl-sm'
          )}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';
                      const isInline = !match;
                      
                      if (!isInline && language) {
                        return (
                          <div className="code-block my-3 rounded-lg overflow-hidden">
                            <div className="code-header flex items-center justify-between px-4 py-2 bg-gray-800">
                              <span className="text-xs text-gray-400">{language}</span>
                              <button
                                onClick={() => copyToClipboard(String(children))}
                                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                              >
                                <Copy className="h-3 w-3" />
                                Copy
                              </button>
                            </div>
                            <SyntaxHighlighter
                              style={oneDark}
                              language={language}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                padding: '1rem',
                                fontSize: '0.875rem',
                              }}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }
                      
                      return (
                        <code className={cn('bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm', className)} {...props}>
                          {children}
                        </code>
                      );
                    },
                    p({ children }) {
                      return <p className="mb-2 last:mb-0">{children}</p>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc pl-4 mb-2">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal pl-4 mb-2">{children}</ol>;
                    },
                    a({ href, children }) {
                      // Check if this is a DOCX download link
                      const isDocxDownload = href?.includes('/jobs/') && href?.includes('/docx');
                      
                      if (isDocxDownload && href) {
                        // Ensure full URL to backend
                        let fullUrl = href;
                        if (!href.startsWith('http')) {
                          fullUrl = `${API_BASE_URL}${href}`;
                        } else if (href.includes(':3000')) {
                          // Replace any frontend port with backend URL
                          fullUrl = href.replace(/http:\/\/localhost:\d+/, API_BASE_URL);
                        }
                        
                        return (
                          <a
                            href={fullUrl}
                            download="Technical_Specification.docx"
                            className="inline-flex items-center gap-2 px-4 py-2 mt-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors font-medium no-underline"
                          >
                            <Download className="h-4 w-4" />
                            {children}
                          </a>
                        );
                      }
                      
                      return (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {displayedContent}
                </ReactMarkdown>
                
                {/* Streaming cursor */}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-1" />
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {isAssistant && !isStreaming && message.content && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 mt-2"
            >
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-text-secondary-light dark:text-text-secondary-dark
                           hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              
              <button
                onClick={() => handleFeedback('up')}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  feedback === 'up'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                title="Good response"
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => handleFeedback('down')}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  feedback === 'down'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                title="Bad response"
              >
                <ThumbsDown className="h-4 w-4" />
              </button>

              <button
                className="p-1.5 rounded-lg text-text-secondary-light dark:text-text-secondary-dark
                           hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Regenerate response"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
