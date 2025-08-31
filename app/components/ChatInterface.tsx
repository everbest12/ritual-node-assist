'use client'

import { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import SearchBar from './SearchBar'
import AnalyticsDashboard from './AnalyticsDashboard'
import SettingsPanel from './SettingsPanel'
import SmartSuggestions from './SmartSuggestions'
import RichMediaSupport, { CodeBlock, ImageDisplay } from './RichMediaSupport'

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
  media?: {
    type: 'image' | 'code'
    data: string
    metadata?: any
  }
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

interface ChatInterfaceProps {
  theme: 'dark' | 'light'
}

interface Settings {
  responseLength: 'short' | 'medium' | 'long'
  aiModel: 'gpt-4o' | 'gpt-3.5-turbo' | 'claude-3'
  theme: 'dark' | 'light' | 'auto'
  notifications: boolean
  autoScroll: boolean
  soundEffects: boolean
  language: string
  fontSize: 'small' | 'medium' | 'large'
}

export default function ChatInterface({ theme }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFilter, setCurrentFilter] = useState('all')
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat')
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Settings state
  const [settings, setSettings] = useState<Settings>({
    responseLength: 'medium',
    aiModel: 'gpt-4o',
    theme: 'dark',
    notifications: false,
    autoScroll: true,
    soundEffects: false,
    language: 'en',
    fontSize: 'medium'
  })

  // Load sessions and messages from localStorage on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    const savedSessions = localStorage.getItem('chat-sessions')
    const savedSettings = localStorage.getItem('chat-settings')
    
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions)
        // Convert timestamp strings back to Date objects
        const sessionsWithDates = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }))
        setSessions(sessionsWithDates)
        
        // Find active session or create new one
        const activeSession = sessionsWithDates.find((s: ChatSession) => s.isActive)
        if (activeSession) {
          setCurrentSessionId(activeSession.id)
          setMessages(activeSession.messages)
        } else {
          createNewSession()
        }
      } catch (error) {
        console.error('Failed to load sessions:', error)
        createNewSession()
      }
    } else {
      createNewSession()
    }

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        // Apply loaded settings
        applySettings(parsed)
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }, [])

  const createNewSession = () => {
    const welcomeMessage: Message = {
      id: '1',
      content: '🔮 Welcome to **Ritual Network** - the future of decentralized AI infrastructure!\n\nI\'m your AI assistant, powered by Ritual\'s decentralized compute network. I can help you understand:\n\n• **Decentralized AI** - How Ritual is democratizing AI access\n• **Privacy & Security** - Zero-knowledge AI computations\n• **Cross-Chain Integration** - Seamless blockchain interoperability\n• **Community Governance** - DAO-driven development\n• **Getting Started** - How to participate in the Ritual ecosystem\n\nWhat aspect of Ritual Network would you like to explore? 🚀',
      isUser: false,
      timestamp: new Date(),
      pineconeStatus: 'connected'
    }
    
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [welcomeMessage],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
    
    setSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    setMessages([welcomeMessage])
  }

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessions.length > 0) {
      localStorage.setItem('chat-sessions', JSON.stringify(sessions))
    }
  }, [sessions])

  // Update current session when messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages, updatedAt: new Date() }
          : session
      ))
    }
  }, [messages, currentSessionId])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('chat-settings', JSON.stringify(settings))
  }, [settings])

  // Filter messages based on search and filter criteria
  useEffect(() => {
    let filtered = messages

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply type filter
    switch (currentFilter) {
      case 'user':
        filtered = filtered.filter(msg => msg.isUser)
        break
      case 'ai':
        filtered = filtered.filter(msg => !msg.isUser)
        break
      case 'today':
        const today = new Date().toDateString()
        filtered = filtered.filter(msg => 
          new Date(msg.timestamp).toDateString() === today
        )
        break
      case 'week':
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        filtered = filtered.filter(msg => 
          new Date(msg.timestamp) >= weekAgo
        )
        break
    }

    setFilteredMessages(filtered)
  }, [messages, searchQuery, currentFilter])

  const scrollToBottom = () => {
    if (settings.autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, settings.autoScroll])

  const handleReaction = (messageId: string, reaction: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const currentReactions = msg.reactions || {}
        const currentCount = currentReactions[reaction] || 0
        return {
          ...msg,
          reactions: {
            ...currentReactions,
            [reaction]: currentCount + 1
          }
        }
      }
      return msg
    }))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const generateSessionTitle = async (messages: Message[]) => {
    if (messages.length <= 1) return 'New Conversation'
    
    setIsGeneratingTitle(true)
    try {
      const userMessages = messages.filter(msg => msg.isUser).slice(0, 3)
      const conversationPreview = userMessages.map(msg => msg.content).join('\n')
      
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          conversation: conversationPreview,
          settings: {
            aiModel: settings.aiModel
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.title || 'New Conversation'
      }
    } catch (error) {
      console.error('Failed to generate title:', error)
    } finally {
      setIsGeneratingTitle(false)
    }
    
    return 'New Conversation'
  }

  const clearChat = () => {
    // Deactivate current session
    if (currentSessionId) {
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, isActive: false }
          : session
      ))
    }
    
    // Create new session
    createNewSession()
  }

  const switchSession = (sessionId: string) => {
    // Deactivate current session
    if (currentSessionId) {
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, isActive: false }
          : session
      ))
    }
    
    // Activate new session
    const targetSession = sessions.find(s => s.id === sessionId)
    if (targetSession) {
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, isActive: true }
          : session
      ))
      setCurrentSessionId(sessionId)
      setMessages(targetSession.messages)
      // Switch to chat tab when selecting a session (like ChatGPT)
      setActiveTab('chat')
      
      // Add a brief visual feedback
      const sessionElement = document.querySelector(`[data-session-id="${sessionId}"]`)
      if (sessionElement) {
        sessionElement.classList.add('ring-2', 'ring-green-500')
        setTimeout(() => {
          sessionElement.classList.remove('ring-2', 'ring-green-500')
        }, 500)
      }
    }
  }

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    
    // If deleting current session, create new one
    if (sessionId === currentSessionId) {
      createNewSession()
    }
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-settings', JSON.stringify(settings))
    }
    
    // Apply settings immediately
    applySettings(settings)
    
    // Show a brief success message (you could add a toast notification here)
    console.log('Settings saved successfully!')
  }

  const applySettings = (newSettings: Settings) => {
    // Apply font size
    const root = document.documentElement
    switch (newSettings.fontSize) {
      case 'small':
        root.style.fontSize = '14px'
        break
      case 'medium':
        root.style.fontSize = '16px'
        break
      case 'large':
        root.style.fontSize = '18px'
        break
    }

    // Apply theme if it's different from current
    if (newSettings.theme !== settings.theme) {
      // This would need to be handled by the parent component
      console.log('Theme changed to:', newSettings.theme)
    }

    // Apply language
    document.documentElement.lang = newSettings.language
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: `Uploaded: ${file.name}`,
        isUser: true,
        timestamp: new Date(),
        media: {
          type: 'image',
          data: e.target?.result as string,
          metadata: { fileName: file.name, fileSize: file.size }
        }
      }
      setMessages(prev => [...prev, userMessage])
    }
    reader.readAsDataURL(file)
  }

  const handleCodeBlock = (code: string, language: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Code block in ${language}:`,
      isUser: true,
      timestamp: new Date(),
      media: {
        type: 'code',
        data: code,
        metadata: { language }
      }
    }
    setMessages(prev => [...prev, userMessage])
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setShowSuggestions(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setShowSuggestions(false)

    // Create a placeholder for the streaming response
    const botMessageId = (Date.now() + 1).toString()
    const botMessage: Message = {
      id: botMessageId,
      content: '',
      isUser: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, botMessage])
    setStreamingMessageId(botMessageId)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputValue.trim(),
          settings: {
            responseLength: settings.responseLength,
            aiModel: settings.aiModel
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let fullResponse = ''
      let pineconeStatus = 'unknown'

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.error) {
                throw new Error(data.error)
              }

              if (data.content) {
                fullResponse += data.content
                pineconeStatus = data.pineconeStatus || pineconeStatus
                
                setMessages(prev => prev.map(msg => 
                  msg.id === botMessageId 
                    ? { ...msg, content: fullResponse, pineconeStatus }
                    : msg
                ))
              }

              if (data.done) {
                fullResponse = data.fullResponse || fullResponse
                pineconeStatus = data.pineconeStatus || pineconeStatus
                
                setMessages(prev => prev.map(msg => 
                  msg.id === botMessageId 
                    ? { ...msg, content: fullResponse, pineconeStatus }
                    : msg
                ))
                
                // Generate title for new sessions after first AI response
                if (currentSessionId && messages.length === 2) {
                  const currentSession = sessions.find(s => s.id === currentSessionId)
                  if (currentSession && currentSession.title === 'New Conversation') {
                    const newMessages = [...messages, {
                      id: botMessageId,
                      content: fullResponse,
                      isUser: false,
                      timestamp: new Date(),
                      pineconeStatus
                    }]
                    
                    const title = await generateSessionTitle(newMessages)
                    setSessions(prev => prev.map(session => 
                      session.id === currentSessionId 
                        ? { ...session, title }
                        : session
                    ))
                  }
                }
                
                break
              }
            } catch (parseError) {
              console.error('Error parsing stream data:', parseError)
            }
          }
        }
      }

    } catch (error) {
      console.error('Error:', error)
      const errorMessage = 'Sorry, I encountered an error while processing your request. Please try again.'
      
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, content: errorMessage, pineconeStatus: 'error' }
          : msg
      ))
    } finally {
      setIsLoading(false)
      setStreamingMessageId(null)
      setShowSuggestions(true)
    }
  }

  const exportChat = () => {
    const markdown = sessions.map(session => {
      const sessionHeader = `# ${session.title}\n\n**Session Date:** ${new Date(session.createdAt).toLocaleString()}\n**Messages:** ${session.messages.length}\n\n---\n\n`
      const sessionMessages = session.messages.map(msg => 
        `**${msg.isUser ? 'You' : 'AI'}** (${msg.timestamp.toLocaleTimeString()}): ${msg.content}`
      ).join('\n\n')
      return sessionHeader + sessionMessages
    }).join('\n\n---\n\n')
    
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ritual-chat-sessions-${new Date().toISOString().split('T')[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getThemeClasses = () => {
    if (theme === 'light') {
      return {
        container: 'bg-white/95 backdrop-blur-xl border-gray-200/30 shadow-xl',
        header: 'border-gray-200/30',
        input: 'bg-gray-50/80 border-gray-300/50 placeholder-gray-500 backdrop-blur-sm',
        button: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg',
        text: 'text-gray-800'
      }
    }
    return {
      container: 'bg-gray-900/95 backdrop-blur-xl border-gray-700/30 shadow-2xl',
      header: 'border-gray-700/30',
      input: 'bg-gray-800/80 border-gray-600/50 placeholder-gray-400 backdrop-blur-sm',
      button: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg',
      text: 'text-gray-100'
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <div className="h-screen flex flex-col max-w-7xl mx-auto p-4 lg:p-6 space-y-4">
      {/* Search Bar */}
      <SearchBar
        onSearch={setSearchQuery}
        onFilterChange={setCurrentFilter}
        theme={theme}
        messageCount={messages.length}
      />

      {/* Smart Suggestions */}
      <SmartSuggestions
        theme={theme}
        onSuggestionClick={handleSuggestionClick}
        currentMessage={inputValue}
        isVisible={showSuggestions && !isLoading && messages.length > 1}
      />

      {/* Main Chat Container */}
      <div className={`flex-1 rounded-2xl border glow ${themeClasses.container} flex flex-col min-h-0`}>
        {/* Tab Navigation */}
        <div className={`px-4 lg:px-6 py-3 border-b ${themeClasses.header}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 lg:space-x-6">
              <div className="flex items-center space-x-2 mr-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className={`text-xs font-mono font-bold ${theme === 'light' ? 'text-green-700' : 'text-green-400'}`}>
                  RITUAL_AI
                </span>
              </div>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm lg:text-base ${
                  activeTab === 'chat'
                    ? 'bg-green-600 text-white shadow-lg'
                    : theme === 'light'
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="hidden sm:inline">Chat</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm lg:text-base ${
                  activeTab === 'history'
                    ? 'bg-green-600 text-white shadow-lg'
                    : theme === 'light'
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">History</span>
                </div>
              </button>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className={`text-xs font-mono hidden sm:block ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
                {activeTab === 'chat' ? `${filteredMessages.length} messages` : `${sessions.length} sessions`}
              </div>
              
              {/* Analytics Button */}
              <button
                onClick={() => setShowAnalytics(true)}
                className={`text-xs transition-colors duration-200 p-2 rounded-lg ${theme === 'light' ? 'text-gray-500 hover:text-blue-600 hover:bg-gray-100' : 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'}`}
                title="View analytics"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className={`text-xs transition-colors duration-200 p-2 rounded-lg ${theme === 'light' ? 'text-gray-500 hover:text-purple-600 hover:bg-gray-100' : 'text-gray-400 hover:text-purple-400 hover:bg-gray-700'}`}
                title="Settings"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              <button
                onClick={clearChat}
                className={`text-xs transition-colors duration-200 p-2 rounded-lg ${theme === 'light' ? 'text-gray-500 hover:text-red-500 hover:bg-gray-100' : 'text-gray-400 hover:text-red-400 hover:bg-gray-700'}`}
                title="Clear chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              
              <button
                onClick={exportChat}
                className={`text-xs transition-colors duration-200 p-2 rounded-lg ${theme === 'light' ? 'text-gray-500 hover:text-green-600 hover:bg-gray-100' : 'text-gray-400 hover:text-green-400 hover:bg-gray-700'}`}
                title="Export chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>

              <button
                onClick={handleSaveSettings}
                className={`text-xs transition-colors duration-200 p-2 rounded-lg ${theme === 'light' ? 'text-gray-500 hover:text-blue-600 hover:bg-gray-100' : 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'}`}
                title="Save preferences"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'chat' && (
          <>
                         {/* Chat Header */}
             <div className={`px-4 lg:px-6 py-4 border-b ${themeClasses.header}`}>
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                   <span className={`text-sm font-medium ${themeClasses.text}`}>AI Assistant</span>
                 </div>
                 
                 {/* New Chat Button */}
                 <button
                   onClick={clearChat}
                   className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                     theme === 'light' 
                       ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                       : 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm'
                   }`}
                   title="Start new conversation"
                 >
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                   </svg>
                   <span>New Chat</span>
                 </button>
               </div>
             </div>

                         {/* Messages Container */}
             <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 min-h-0">
               {/* Advanced AI Loading Animation */}
               {isLoading && !streamingMessageId && (
                 <div className="flex justify-start">
                   <div className={`backdrop-blur-sm rounded-2xl px-6 py-4 max-w-sm border ${
                     theme === 'light' 
                       ? 'bg-gray-100/50 border-gray-200/50' 
                       : 'bg-gray-800/50 border-gray-700/50'
                   }`}>
                     <div className="flex items-center space-x-4">
                       {/* Singularity Core */}
                       <div className="relative">
                         <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full singularity-core flex items-center justify-center">
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                           </svg>
                         </div>
                         
                         {/* Orbiting Particles */}
                         <div className="absolute inset-0">
                           <div className="w-1 h-1 bg-green-400 rounded-full particle-orbit absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                           <div className="w-1 h-1 bg-green-500 rounded-full particle-orbit absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                           <div className="w-1 h-1 bg-green-600 rounded-full particle-orbit absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                           <div className="w-1 h-1 bg-green-400 rounded-full particle-orbit absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                           <div className="w-1 h-1 bg-green-500 rounded-full particle-orbit absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                           <div className="w-1 h-1 bg-green-600 rounded-full particle-orbit absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                         </div>
                       </div>
                       
                       {/* Neural Network Grid */}
                       <div className="flex items-center space-x-0.5">
                         <div className="w-1 h-3 bg-green-400 rounded-full neural-network"></div>
                         <div className="w-1 h-4 bg-green-500 rounded-full neural-network"></div>
                         <div className="w-1 h-2 bg-green-600 rounded-full neural-network"></div>
                         <div className="w-1 h-5 bg-green-400 rounded-full neural-network"></div>
                         <div className="w-1 h-3 bg-green-500 rounded-full neural-network"></div>
                         <div className="w-1 h-4 bg-green-600 rounded-full neural-network"></div>
                       </div>
                       
                       <div className="flex flex-col">
                         <span className={`text-sm font-mono font-bold ${theme === 'light' ? 'text-green-700' : 'text-green-400'}`}>
                           RITUAL_AI
                         </span>
                         <span className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                           Synthesizing consciousness...
                         </span>
                       </div>
                     </div>
                     
                     {/* Quantum Field */}
                     <div className="mt-3 relative overflow-hidden">
                       <div className="h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent quantum-field"></div>
                     </div>
                     
                     {/* Consciousness Waves */}
                     <div className="mt-2 flex items-center space-x-0.5">
                       <div className="w-0.5 h-2 bg-green-400 rounded-full consciousness-wave"></div>
                       <div className="w-0.5 h-3 bg-green-500 rounded-full consciousness-wave"></div>
                       <div className="w-0.5 h-1 bg-green-600 rounded-full consciousness-wave"></div>
                       <div className="w-0.5 h-4 bg-green-400 rounded-full consciousness-wave"></div>
                       <div className="w-0.5 h-2 bg-green-500 rounded-full consciousness-wave"></div>
                       <div className="w-0.5 h-3 bg-green-600 rounded-full consciousness-wave"></div>
                       <div className="w-0.5 h-1 bg-green-400 rounded-full consciousness-wave"></div>
                       <div className="w-0.5 h-4 bg-green-500 rounded-full consciousness-wave"></div>
                     </div>
                     
                     {/* Holographic Scan Lines */}
                     <div className="mt-2 relative overflow-hidden">
                       <div className="flex space-x-1">
                         <div className="w-1 h-3 bg-green-400/60 holographic-scan"></div>
                         <div className="w-1 h-3 bg-green-500/60 holographic-scan"></div>
                         <div className="w-1 h-3 bg-green-600/60 holographic-scan"></div>
                         <div className="w-1 h-3 bg-green-400/60 holographic-scan"></div>
                       </div>
                     </div>
                   </div>
                 </div>
               )}
               
               {filteredMessages.map((message) => (
                <div key={message.id}>
                                     <MessageBubble 
                     message={message}
                     onReaction={handleReaction}
                     onCopy={copyToClipboard}
                     isStreaming={streamingMessageId === message.id}
                     theme={theme}
                     data-message-id={message.id}
                   />
                  
                  {/* Render media content */}
                  {message.media && (
                    <div className="mt-2 ml-4">
                      {message.media.type === 'image' && (
                        <ImageDisplay
                          src={message.media.data}
                          alt={message.media.metadata?.fileName || 'Uploaded image'}
                          theme={theme}
                        />
                      )}
                      {message.media.type === 'code' && (
                        <CodeBlock
                          code={message.media.data}
                          language={message.media.metadata?.language || 'text'}
                          theme={theme}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
              

              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className={`px-4 lg:px-6 py-4 border-t ${themeClasses.header}`}>
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask RITUAL_AI about decentralized AI infrastructure..."
                    disabled={isLoading}
                    className={`w-full backdrop-blur-sm border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 disabled:opacity-50 transition-all duration-200 ${themeClasses.input}`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-gray-400' : 'bg-gray-600'}`}></div>
                  </div>
                </div>
                
                {/* Rich Media Support */}
                <RichMediaSupport
                  theme={theme}
                  onFileUpload={handleFileUpload}
                  onCodeBlock={handleCodeBlock}
                />
                
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className={`px-4 lg:px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 glow disabled:glow-0 ${
                    !inputValue.trim() || isLoading 
                      ? (theme === 'light' ? 'bg-gray-300 text-gray-500' : 'bg-gray-700 text-gray-400') 
                      : themeClasses.button
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 min-h-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${themeClasses.text}`}>Chat Sessions</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => createNewSession()}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors duration-200 ${
                      theme === 'light' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                    }`}
                  >
                    New Chat
                  </button>
                  <button
                    onClick={exportChat}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors duration-200 ${
                      theme === 'light' 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-green-600 text-white hover:bg-green-500'
                    }`}
                  >
                    Export All
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors duration-200 ${
                      theme === 'light' 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'bg-purple-600 text-white hover:bg-purple-500'
                    }`}
                  >
                    Save Preferences
                  </button>
                </div>
              </div>

              {sessions.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No chat sessions yet</p>
                  <p className="text-sm">Start a conversation to see your chat sessions here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      data-session-id={session.id}
                      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer transform hover:scale-[1.02] ${
                        session.isActive
                          ? theme === 'light'
                            ? 'bg-green-50 border-green-200 hover:bg-green-100 shadow-md'
                            : 'bg-green-900/20 border-green-700/30 hover:bg-green-900/30 shadow-md'
                          : theme === 'light'
                          ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          : 'bg-gray-800/20 border-gray-700/30 hover:bg-gray-800/30'
                      }`}
                      onClick={() => switchSession(session.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${session.isActive ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                            <span className={`text-sm font-medium ${themeClasses.text}`}>
                              {session.title}
                              {isGeneratingTitle && session.title === 'New Conversation' && (
                                <span className="ml-2 text-xs text-gray-500">Generating title...</span>
                              )}
                            </span>
                            <span className={`text-xs ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(session.updatedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                            <span>{session.messages.length} messages</span>
                            <span>•</span>
                            <span>{session.messages.filter(m => m.isUser).length} from you</span>
                            <span>•</span>
                            <span>{session.messages.filter(m => !m.isUser).length} from AI</span>
                          </div>
                          {session.messages.length > 1 && (
                            <p className={`text-sm line-clamp-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                              {session.messages[1].content.length > 150 
                                ? `${session.messages[1].content.substring(0, 150)}...` 
                                : session.messages[1].content
                              }
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(session.messages.map(m => 
                                `${m.isUser ? 'You' : 'AI'}: ${m.content}`
                              ).join('\n\n'))
                            }}
                            className={`p-1 rounded transition-colors duration-200 ${
                              theme === 'light' 
                                ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-200' 
                                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                            }`}
                            title="Copy session"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSession(session.id)
                            }}
                            className={`p-1 rounded transition-colors duration-200 ${
                              theme === 'light' 
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                                : 'text-gray-500 hover:text-red-400 hover:bg-red-900/20'
                            }`}
                            title="Delete session"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        messages={messages}
        theme={theme}
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />

      {/* Settings Panel */}
      <SettingsPanel
        theme={theme}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={setSettings}
        currentSettings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  )
}
