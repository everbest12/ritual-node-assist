'use client'

import { useState, useRef } from 'react'

interface RichMediaSupportProps {
  theme: 'dark' | 'light'
  onFileUpload: (file: File) => void
  onCodeBlock: (code: string, language: string) => void
}

export default function RichMediaSupport({ theme, onFileUpload, onCodeBlock }: RichMediaSupportProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getThemeClasses = () => {
    if (theme === 'light') {
      return {
        container: 'bg-white/90 border-gray-200',
        button: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        dropdown: 'bg-white border-gray-200 shadow-lg',
        option: 'hover:bg-gray-100 text-gray-700'
      }
    }
    return {
      container: 'bg-gray-900/90 border-gray-700',
      button: 'bg-gray-700 hover:bg-gray-600 text-gray-300',
      dropdown: 'bg-gray-800 border-gray-700 shadow-lg',
      option: 'hover:bg-gray-700 text-gray-300'
    }
  }

  const themeClasses = getThemeClasses()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  const handleCodeBlock = () => {
    const code = prompt('Enter your code:')
    const language = prompt('Enter language (e.g., javascript, python, html):') || 'text'
    if (code) {
      onCodeBlock(code, language)
    }
  }

  const mediaOptions = [
    {
      id: 'image',
      label: 'Upload Image',
      icon: '🖼️',
      action: () => fileInputRef.current?.click()
    },
    {
      id: 'code',
      label: 'Add Code Block',
      icon: '💻',
      action: handleCodeBlock
    },
    {
      id: 'link',
      label: 'Insert Link',
      icon: '🔗',
      action: () => {
        const url = prompt('Enter URL:')
        if (url) {
          // Handle link insertion
        }
      }
    },
    {
      id: 'table',
      label: 'Create Table',
      icon: '📊',
      action: () => {
        // Handle table creation
      }
    }
  ]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-2 rounded-lg transition-colors duration-200 ${themeClasses.button}`}
        title="Add media"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Dropdown */}
      {isExpanded && (
        <div className={`absolute bottom-full right-0 mb-2 w-48 rounded-lg border shadow-lg z-50 ${themeClasses.dropdown}`}>
          <div className="p-2 space-y-1">
            {mediaOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  option.action()
                  setIsExpanded(false)
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors duration-200 ${themeClasses.option}`}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Code Block Component
export function CodeBlock({ code, language, theme }: { code: string; language: string; theme: 'dark' | 'light' }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code: ', err)
    }
  }

  const getThemeClasses = () => {
    if (theme === 'light') {
      return {
        container: 'bg-gray-100 border-gray-200',
        header: 'bg-gray-200 border-gray-300',
        text: 'text-gray-800'
      }
    }
    return {
      container: 'bg-gray-800 border-gray-700',
      header: 'bg-gray-700 border-gray-600',
      text: 'text-gray-200'
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <div className={`rounded-lg border overflow-hidden ${themeClasses.container}`}>
      <div className={`px-4 py-2 border-b flex items-center justify-between ${themeClasses.header}`}>
        <span className={`text-sm font-mono ${themeClasses.text}`}>{language}</span>
        <button
          onClick={copyToClipboard}
          className={`px-2 py-1 rounded text-xs transition-colors duration-200 ${
            theme === 'light' ? 'hover:bg-gray-300' : 'hover:bg-gray-600'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className={`p-4 overflow-x-auto ${themeClasses.text}`}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

// Image Component
export function ImageDisplay({ src, alt, theme }: { src: string; alt: string; theme: 'dark' | 'light' }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className={`rounded-lg border overflow-hidden ${
      theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-gray-800 border-gray-700'
    }`}>
      {isLoading && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
        </div>
      )}
      {error && (
        <div className="p-4 text-center text-red-400">
          Failed to load image
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full ${isLoading ? 'hidden' : ''}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setError(true)
        }}
      />
    </div>
  )
}
