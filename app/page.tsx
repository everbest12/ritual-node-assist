'use client'

import { useState, useEffect } from 'react'
import ChatInterface from './components/ChatInterface'
import SocialLinks from './components/SocialLinks'
import ThemeToggle from './components/ThemeToggle'

export default function Home() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load theme from localStorage only on client side
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light'
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      // Apply theme to document only on client side
      document.documentElement.classList.toggle('light', theme === 'light')
      localStorage.setItem('theme', theme)
    }
  }, [theme, mounted])

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme)
  }

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <main className="min-h-screen relative tech-grid bg-gradient-to-br from-black/80 via-slate-900/90 to-black/80">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={`min-h-screen relative tech-grid ${theme === 'light' ? 'light-theme' : ''}`}>
      {/* Background overlay */}
      <div className={`absolute inset-0 ${theme === 'light' 
        ? 'bg-gradient-to-br from-green-50/80 via-white/90 to-green-50/80' 
        : 'bg-gradient-to-br from-green-900/80 via-black/90 to-green-900/80'
      }`}></div>

      {/* Ritual Network Branding */}
      <div className="absolute top-4 lg:top-6 left-4 lg:left-6 z-20">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-1 h-1 bg-green-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
          <div className={`text-sm font-mono font-bold ${theme === 'light' ? 'text-green-700' : 'text-green-400'}`}>
            RITUAL_NODE
          </div>
        </div>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-4 lg:top-6 right-4 lg:right-6 z-20 flex items-center space-x-3">
        <ThemeToggle onThemeChange={handleThemeChange} currentTheme={theme} />
        <SocialLinks />
      </div>

      {/* Main Chat Interface */}
      <div className="relative z-10 h-screen">
        <ChatInterface theme={theme} />
      </div>

      {/* Bottom tech details */}
      <div className="absolute bottom-4 lg:bottom-6 left-4 lg:left-6 z-20">
        <div className={`text-xs font-mono ${theme === 'light' ? 'text-gray-500' : 'text-gray-600'}`}>
          <div className="flex items-center space-x-2">
            <span>RITUAL_NODE v1.0</span>
            <span>•</span>
            <span>Decentralized AI Infrastructure</span>
            <span>•</span>
            <span className={`${theme === 'light' ? 'text-green-600' : 'text-green-400'}`}>ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Ritual Network Footer */}
      <div className="absolute bottom-4 lg:bottom-6 right-4 lg:right-6 z-20">
        <div className={`text-xs font-mono ${theme === 'light' ? 'text-gray-500' : 'text-gray-600'}`}>
          <div className="flex items-center space-x-2">
            <span>Powered by</span>
            <span className={`font-bold ${theme === 'light' ? 'text-green-700' : 'text-green-400'}`}>RITUAL</span>
            <span>•</span>
            <span>GPT-4o + Pinecone</span>
          </div>
        </div>
      </div>
    </main>
  )
}
