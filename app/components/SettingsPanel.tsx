'use client'

import { useState, useEffect } from 'react'

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

interface SettingsPanelProps {
  theme: 'dark' | 'light'
  isOpen: boolean
  onClose: () => void
  onSettingsChange: (settings: Settings) => void
  currentSettings: Settings
  onSaveSettings?: () => void
}

export default function SettingsPanel({ theme, isOpen, onClose, onSettingsChange, currentSettings, onSaveSettings }: SettingsPanelProps) {
  const [settings, setSettings] = useState<Settings>(currentSettings)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    setSettings(currentSettings)
  }, [currentSettings])

  const handleSettingChange = (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onSettingsChange(newSettings)
  }

  const getThemeClasses = () => {
    if (theme === 'light') {
      return {
        overlay: 'bg-black/50',
        modal: 'bg-white border-gray-200',
        title: 'text-gray-900',
        text: 'text-gray-700',
        card: 'bg-gray-50 border-gray-200',
        input: 'bg-white border-gray-300 text-gray-900',
        button: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        activeTab: 'bg-green-100 text-green-700 border-green-300',
        inactiveTab: 'bg-gray-100 text-gray-600 border-gray-200'
      }
    }
    return {
      overlay: 'bg-black/70',
      modal: 'bg-gray-900 border-gray-700',
      title: 'text-white',
      text: 'text-gray-300',
      card: 'bg-gray-800 border-gray-700',
      input: 'bg-gray-700 border-gray-600 text-white',
      button: 'bg-gray-700 hover:bg-gray-600 text-gray-300',
      activeTab: 'bg-green-900 text-green-300 border-green-600',
      inactiveTab: 'bg-gray-700 text-gray-400 border-gray-600'
    }
  }

  const themeClasses = getThemeClasses()

  if (!isOpen) return null

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'ai', label: 'AI Settings', icon: '🤖' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ]

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${themeClasses.overlay}`}>
      <div className={`w-full max-w-2xl mx-4 rounded-2xl border backdrop-blur-xl ${themeClasses.modal}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-2xl font-bold ${themeClasses.title}`}>Settings</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors duration-200 ${themeClasses.button}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === tab.id ? themeClasses.activeTab : themeClasses.inactiveTab
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
                <h3 className={`text-lg font-semibold mb-4 ${themeClasses.title}`}>General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text}`}>
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text}`}>
                      Font Size
                    </label>
                    <select
                      value={settings.fontSize}
                      onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className={`text-sm font-medium ${themeClasses.text}`}>
                        Auto-scroll to new messages
                      </label>
                      <p className={`text-xs ${themeClasses.text} opacity-75`}>
                        Automatically scroll to the latest message
                      </p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('autoScroll', !settings.autoScroll)}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        settings.autoScroll ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        settings.autoScroll ? 'transform translate-x-6' : 'transform translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
                <h3 className={`text-lg font-semibold mb-4 ${themeClasses.title}`}>Theme Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text}`}>
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['light', 'dark', 'auto'].map((themeOption) => (
                        <button
                          key={themeOption}
                          onClick={() => handleSettingChange('theme', themeOption)}
                          className={`p-3 rounded-lg border transition-colors duration-200 ${
                            settings.theme === themeOption 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                              : themeClasses.button
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg mb-1">
                              {themeOption === 'light' ? '☀️' : themeOption === 'dark' ? '🌙' : '🔄'}
                            </div>
                            <div className="text-xs capitalize">{themeOption}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
                <h3 className={`text-lg font-semibold mb-4 ${themeClasses.title}`}>AI Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text}`}>
                      AI Model
                    </label>
                    <select
                      value={settings.aiModel}
                      onChange={(e) => handleSettingChange('aiModel', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
                    >
                      <option value="gpt-4o">GPT-4o (Recommended)</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                      <option value="claude-3">Claude-3 (Alternative)</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text}`}>
                      Response Length
                    </label>
                    <select
                      value={settings.responseLength}
                      onChange={(e) => handleSettingChange('responseLength', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input}`}
                    >
                      <option value="short">Short (Quick answers)</option>
                      <option value="medium">Medium (Balanced)</option>
                      <option value="long">Long (Detailed explanations)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className={`text-sm font-medium ${themeClasses.text}`}>
                        Sound Effects
                      </label>
                      <p className={`text-xs ${themeClasses.text} opacity-75`}>
                        Play sounds for notifications and actions
                      </p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('soundEffects', !settings.soundEffects)}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        settings.soundEffects ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        settings.soundEffects ? 'transform translate-x-6' : 'transform translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border ${themeClasses.card}`}>
                <h3 className={`text-lg font-semibold mb-4 ${themeClasses.title}`}>Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className={`text-sm font-medium ${themeClasses.text}`}>
                        Enable Notifications
                      </label>
                      <p className={`text-xs ${themeClasses.text} opacity-75`}>
                        Receive browser notifications for new messages
                      </p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('notifications', !settings.notifications)}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        settings.notifications ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        settings.notifications ? 'transform translate-x-6' : 'transform translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Save/Cancel buttons */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${themeClasses.button}`}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSettingsChange(settings)
              if (onSaveSettings) {
                onSaveSettings()
              }
              onClose()
            }}
            className="px-6 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
