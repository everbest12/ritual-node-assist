'use client'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl chat-bubble ${
          message.isUser
            ? 'bg-green-600/20 border border-green-500/30 text-white'
            : 'bg-gray-800/50 backdrop-blur-sm text-white border border-gray-700/50'
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
        <div
          className={`text-xs mt-2 opacity-60 font-mono ${
            message.isUser ? 'text-right' : 'text-left'
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}
