'use client'

import { useState, useEffect } from 'react'

interface Suggestion {
  id: string
  text: string
  type: 'question' | 'action' | 'topic'
  icon?: string
}

interface SmartSuggestionsProps {
  theme: 'dark' | 'light'
  onSuggestionClick: (suggestion: string) => void
  currentMessage?: string
  isVisible: boolean
}

export default function SmartSuggestions({ theme, onSuggestionClick, currentMessage, isVisible }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([])

  const defaultSuggestions: Suggestion[] = [
    { id: '1', text: 'What is decentralized AI infrastructure?', type: 'question', icon: '🔮' },
    { id: '2', text: 'How does Ritual ensure privacy?', type: 'question', icon: '🔒' },
    { id: '3', text: 'Explain cross-chain AI capabilities', type: 'question', icon: '⛓️' },
    { id: '4', text: 'How can I participate in Ritual?', type: 'action', icon: '🚀' },
    { id: '5', text: 'What are zero-knowledge proofs?', type: 'question', icon: '👁️' },
    { id: '6', text: 'Show me the tokenomics', type: 'action', icon: '💰' },
    { id: '7', text: 'What\'s the roadmap?', type: 'topic', icon: '🗺️' },
    { id: '8', text: 'How does governance work?', type: 'topic', icon: '🏛️' }
  ]

  useEffect(() => {
    setSuggestions(defaultSuggestions)
  }, [])

  useEffect(() => {
    if (currentMessage && currentMessage.trim().length > 0) {
      // Filter suggestions based on current message
      const filtered = suggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(currentMessage.toLowerCase()) ||
        suggestion.type === 'action' // Always show actions
      )
      setFilteredSuggestions(filtered.slice(0, 4)) // Limit to 4 suggestions
    } else {
      setFilteredSuggestions(suggestions.slice(0, 4))
    }
  }, [currentMessage, suggestions])

  const getThemeClasses = () => {
    if (theme === 'light') {
      return {
        container: 'bg-white/90 border-gray-200',
        suggestion: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700',
        activeSuggestion: 'bg-green-50 border-green-300 text-green-700'
      }
    }
    return {
      container: 'bg-gray-900/90 border-gray-700',
      suggestion: 'bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-300',
      activeSuggestion: 'bg-green-900/50 border-green-600 text-green-300'
    }
  }

  const themeClasses = getThemeClasses()

  if (!isVisible || filteredSuggestions.length === 0) return null

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm ${themeClasses.container}`}>
      <div className="flex items-center space-x-2 mb-3">
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
                            <span className={`text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                      Explore Ritual Network...
                    </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredSuggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion.text)}
            className={`p-3 rounded-lg border transition-all duration-200 text-left text-sm ${themeClasses.suggestion} hover:scale-105 active:scale-95`}
          >
            <div className="flex items-center space-x-2">
              {suggestion.icon && (
                <span className="text-base">{suggestion.icon}</span>
              )}
              <span className="flex-1">{suggestion.text}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Dynamic suggestions based on context */}
      {currentMessage && currentMessage.length > 10 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              Based on your message
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSuggestionClick(`Tell me more about ${currentMessage}`)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors duration-200 ${themeClasses.suggestion}`}
            >
              Tell me more
            </button>
            <button
              onClick={() => onSuggestionClick(`Give me examples of ${currentMessage}`)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors duration-200 ${themeClasses.suggestion}`}
            >
              Show examples
            </button>
            <button
              onClick={() => onSuggestionClick(`How does ${currentMessage} work?`)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors duration-200 ${themeClasses.suggestion}`}
            >
              How does it work?
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
