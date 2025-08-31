'use client'

import { useState } from 'react'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  reactions?: {
    like?: number
    dislike?: number
  }
  pineconeStatus?: string
}

interface MessageBubbleProps {
  message: Message
  onReaction?: (messageId: string, reaction: 'like' | 'dislike') => void
  onCopy?: (text: string) => void
  isStreaming?: boolean
  theme: 'dark' | 'light'
  'data-message-id'?: string
}

export default function MessageBubble({ message, onReaction, onCopy, isStreaming, theme, ...props }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatTime = (date: Date) => {
    // Ensure date is a Date object
    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleCopy = async () => {
    if (onCopy) {
      onCopy(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }



  const getThemeClasses = () => {
    if (theme === 'light') {
      return {
        userBubble: 'bg-green-600/20 border-green-500/30 text-gray-900',
        aiBubble: 'bg-gray-100/50 border-gray-200/50 text-gray-900',
        actionButton: 'bg-gray-200/50 hover:bg-gray-300/50',
        reactionCount: 'text-gray-600'
      }
    }
    return {
      userBubble: 'bg-green-600/20 border-green-500/30 text-white',
      aiBubble: 'bg-gray-800/50 border-gray-700/50 text-white',
      actionButton: 'bg-gray-700/50 hover:bg-gray-600/50',
      reactionCount: 'text-gray-400'
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl chat-bubble relative group border ${
          message.isUser ? themeClasses.userBubble : themeClasses.aiBubble
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        {...props}
      >
                 {/* Message Content */}
         <div className="whitespace-pre-wrap text-sm leading-relaxed">
           {message.content}
           {isStreaming && (
             <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse"></span>
           )}
         </div>





        {/* Timestamp */}
        <div
          className={`text-xs mt-2 opacity-60 font-mono ${
            message.isUser ? 'text-right' : 'text-left'
          }`}
        >
          {formatTime(message.timestamp)}
        </div>

        {/* Action Buttons */}
        {showActions && !message.isUser && (
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`p-1 rounded transition-colors duration-200 ${themeClasses.actionButton}`}
              title={copied ? 'Copied!' : 'Copy message'}
            >
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Like Button */}
            <button
              onClick={() => onReaction?.(message.id, 'like')}
              className={`p-1 rounded transition-colors duration-200 ${themeClasses.actionButton} hover:bg-green-600/50`}
              title="Like this response"
            >
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>

            {/* Dislike Button */}
            <button
              onClick={() => onReaction?.(message.id, 'dislike')}
              className={`p-1 rounded transition-colors duration-200 ${themeClasses.actionButton} hover:bg-red-600/50`}
              title="Dislike this response"
            >
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2" />
              </svg>
            </button>
          </div>
        )}

        {/* Reaction Counts */}
        {message.reactions && (message.reactions.like || message.reactions.dislike) && (
          <div className={`mt-2 flex space-x-3 text-xs ${themeClasses.reactionCount}`}>
            {message.reactions.like && (
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>{message.reactions.like}</span>
              </div>
            )}
            {message.reactions.dislike && (
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2" />
                </svg>
                <span>{message.reactions.dislike}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
