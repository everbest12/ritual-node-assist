'use client'

import { useState, useEffect } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  onFilterChange: (filter: string) => void
  theme: 'dark' | 'light'
  messageCount: number
}

export default function SearchBar({ onSearch, onFilterChange, theme, messageCount }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchQuery)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, onSearch])

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    onFilterChange(newFilter)
  }

  const getThemeClasses = () => {
    if (theme === 'light') {
      return {
        container: 'bg-white/90 border-gray-200',
        input: 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500',
        button: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        dropdown: 'bg-white border-gray-200 shadow-lg',
        option: 'hover:bg-gray-100 text-gray-700'
      }
    }
    return {
      container: 'bg-gray-900/90 border-gray-700',
      input: 'bg-gray-800 border-gray-600 text-white placeholder-gray-400',
      button: 'bg-gray-700 hover:bg-gray-600 text-gray-300',
      dropdown: 'bg-gray-800 border-gray-700 shadow-lg',
      option: 'hover:bg-gray-700 text-gray-300'
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <div className={`relative ${isExpanded ? 'mb-4' : ''}`}>
      <div className={`flex items-center space-x-2 p-3 rounded-xl border backdrop-blur-sm ${themeClasses.container}`}>
        {/* Search Icon */}
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages..."
          className={`flex-1 bg-transparent border-none outline-none text-sm ${themeClasses.input}`}
        />

        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-colors duration-200 ${themeClasses.button}`}
            title="Filter messages"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
          </button>

          {/* Filter Dropdown */}
          {isExpanded && (
            <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg border shadow-lg z-50 ${themeClasses.dropdown}`}>
              <div className="p-2 space-y-1">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors duration-200 ${
                    filter === 'all' ? 'bg-green-100 text-green-700' : themeClasses.option
                  }`}
                >
                  All Messages ({messageCount})
                </button>
                <button
                  onClick={() => handleFilterChange('user')}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors duration-200 ${
                    filter === 'user' ? 'bg-green-100 text-green-700' : themeClasses.option
                  }`}
                >
                  Your Messages
                </button>
                <button
                  onClick={() => handleFilterChange('ai')}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors duration-200 ${
                    filter === 'ai' ? 'bg-green-100 text-green-700' : themeClasses.option
                  }`}
                >
                  AI Responses
                </button>
                <button
                  onClick={() => handleFilterChange('today')}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors duration-200 ${
                    filter === 'today' ? 'bg-green-100 text-green-700' : themeClasses.option
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => handleFilterChange('week')}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors duration-200 ${
                    filter === 'week' ? 'bg-green-100 text-green-700' : themeClasses.option
                  }`}
                >
                  This Week
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clear Search */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className={`p-1 rounded transition-colors duration-200 ${themeClasses.button}`}
            title="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className={`mt-2 text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          Searching for: "{searchQuery}"
        </div>
      )}
    </div>
  )
}
