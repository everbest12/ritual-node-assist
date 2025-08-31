'use client'

import { useState, useEffect } from 'react'

interface AnalyticsData {
  totalMessages: number
  userMessages: number
  aiMessages: number
  averageResponseTime: number
  mostActiveHour: number
  pineconeStatus: string
  topTopics: string[]
  conversationStreak: number
}

interface AnalyticsDashboardProps {
  messages: any[]
  theme: 'dark' | 'light'
  isOpen: boolean
  onClose: () => void
}

export default function AnalyticsDashboard({ messages, theme, isOpen, onClose }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalMessages: 0,
    userMessages: 0,
    aiMessages: 0,
    averageResponseTime: 0,
    mostActiveHour: 0,
    pineconeStatus: 'unknown',
    topTopics: [],
    conversationStreak: 0
  })

  useEffect(() => {
    if (messages.length > 0) {
      calculateAnalytics()
    }
  }, [messages])

  const calculateAnalytics = () => {
    const userMessages = messages.filter(m => m.isUser)
    const aiMessages = messages.filter(m => !m.isUser)
    
    // Calculate response times
    const responseTimes: number[] = []
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].isUser && !messages[i + 1].isUser) {
        const responseTime = new Date(messages[i + 1].timestamp).getTime() - new Date(messages[i].timestamp).getTime()
        responseTimes.push(responseTime)
      }
    }

    // Calculate most active hour
    const hourCounts = new Array(24).fill(0)
    messages.forEach(msg => {
      const hour = new Date(msg.timestamp).getHours()
      hourCounts[hour]++
    })
    const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts))

    // Calculate conversation streak (consecutive days)
    const dates = Array.from(new Set(messages.map(m => new Date(m.timestamp).toDateString()))).sort()
    let streak = 1
    let maxStreak = 1
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1])
      const currDate = new Date(dates[i])
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        streak++
        maxStreak = Math.max(maxStreak, streak)
      } else {
        streak = 1
      }
    }

    // Extract topics (simple keyword extraction)
    const allText = messages.map(m => m.content.toLowerCase()).join(' ')
    const words = allText.split(/\s+/).filter(word => word.length > 3)
    const wordCounts: { [key: string]: number } = {}
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1
    })
    const topTopics = Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word)

    setAnalytics({
      totalMessages: messages.length,
      userMessages: userMessages.length,
      aiMessages: aiMessages.length,
      averageResponseTime: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
      mostActiveHour,
      pineconeStatus: 'connected', // This would be updated from actual status
      topTopics,
      conversationStreak: maxStreak
    })
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ${seconds % 60}s`
  }

  const getThemeClasses = () => {
    if (theme === 'light') {
      return {
        overlay: 'bg-black/50',
        modal: 'bg-white border-gray-200',
        title: 'text-gray-900',
        text: 'text-gray-700',
        card: 'bg-gray-50 border-gray-200',
        stat: 'text-gray-900',
        label: 'text-gray-600'
      }
    }
    return {
      overlay: 'bg-black/70',
      modal: 'bg-gray-900 border-gray-700',
      title: 'text-white',
      text: 'text-gray-300',
      card: 'bg-gray-800 border-gray-700',
      stat: 'text-white',
      label: 'text-gray-400'
    }
  }

  const themeClasses = getThemeClasses()

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${themeClasses.overlay}`}>
      <div className={`w-full max-w-4xl mx-4 rounded-2xl border backdrop-blur-xl ${themeClasses.modal}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-2xl font-bold ${themeClasses.title}`}>Analytics Dashboard</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
              <div className={`text-2xl font-bold ${themeClasses.stat}`}>{analytics.totalMessages}</div>
              <div className={`text-sm ${themeClasses.label}`}>Total Messages</div>
            </div>
            <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
              <div className={`text-2xl font-bold ${themeClasses.stat}`}>{analytics.userMessages}</div>
              <div className={`text-sm ${themeClasses.label}`}>Your Messages</div>
            </div>
            <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
              <div className={`text-2xl font-bold ${themeClasses.stat}`}>{analytics.aiMessages}</div>
              <div className={`text-sm ${themeClasses.label}`}>AI Responses</div>
            </div>
            <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
              <div className={`text-2xl font-bold ${themeClasses.stat}`}>{analytics.conversationStreak}</div>
              <div className={`text-sm ${themeClasses.label}`}>Day Streak</div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-xl border ${themeClasses.card}`}>
              <h3 className={`text-lg font-semibold mb-4 ${themeClasses.title}`}>Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={themeClasses.label}>Avg Response Time</span>
                  <span className={themeClasses.stat}>{formatTime(analytics.averageResponseTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.label}>Most Active Hour</span>
                  <span className={themeClasses.stat}>{analytics.mostActiveHour}:00</span>
                </div>
                <div className="flex justify-between">
                  <span className={themeClasses.label}>Pinecone Status</span>
                  <span className={`${
                    analytics.pineconeStatus === 'connected' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {analytics.pineconeStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${themeClasses.card}`}>
              <h3 className={`text-lg font-semibold mb-4 ${themeClasses.title}`}>Top Topics</h3>
              <div className="space-y-2">
                {analytics.topTopics.map((topic, index) => (
                  <div key={topic} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-green-400' : 
                      index === 1 ? 'bg-blue-400' : 
                      index === 2 ? 'bg-yellow-400' : 'bg-gray-400'
                    }`}></div>
                    <span className={`capitalize ${themeClasses.text}`}>{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Chart Placeholder */}
          <div className={`p-6 rounded-xl border ${themeClasses.card}`}>
            <h3 className={`text-lg font-semibold mb-4 ${themeClasses.title}`}>Activity Over Time</h3>
            <div className={`h-32 flex items-center justify-center ${themeClasses.text}`}>
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>Activity chart coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
