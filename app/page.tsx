'use client'

import { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import SocialLinks from './components/SocialLinks'

export default function Home() {
  return (
    <main className="min-h-screen relative tech-grid">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-slate-900/90 to-black/80"></div>
      
      {/* Social Links - Top Right Corner */}
      <div className="absolute top-6 right-6 z-20">
        <SocialLinks />
      </div>

      {/* Main Chat Interface */}
      <div className="relative z-10 container mx-auto px-4 py-12 pt-24">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Ritual Network
              </h1>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              AI-powered assistant for the decentralized future. Ask anything about Ritual Network.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>GPT-4o + OpenAI Embeddings</span>
              </div>
            </div>
          </div>
          
          <ChatInterface />
        </div>
      </div>

      {/* Bottom tech details */}
      <div className="absolute bottom-6 left-6 z-20">
        <div className="text-xs text-gray-600 font-mono">
          <div>GPT-4o + OpenAI</div>
          <div>Next.js 14 + TypeScript</div>
        </div>
      </div>
    </main>
  )
}
