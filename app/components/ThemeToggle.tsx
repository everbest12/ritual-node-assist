'use client'

import { useState, useEffect } from 'react'

interface ThemeToggleProps {
  onThemeChange: (theme: 'dark' | 'light') => void
  currentTheme: 'dark' | 'light'
}

export default function ThemeToggle({ onThemeChange, currentTheme }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => onThemeChange(currentTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-200 group glow"
      title={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {currentTheme === 'dark' ? (
        <svg className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}
