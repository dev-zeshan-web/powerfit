import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, X, Minimize2 } from 'lucide-react'
import { askGemini } from '../lib/gemini'

const SUGGESTED = [
  '💪 Create a workout plan for weight loss',
  '🥗 Best diet for muscle building',
  '📊 What does my BMI mean?',
  '🔥 Best exercises for beginners',
  '⏱️ How long should I workout daily?',
]

export default function AIChat({ floating = false }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey! I'm PowerFit AI Coach 🤖💪\n\nI can help you with:\n• Personalized workout plans\n• Diet & nutrition advice\n• BMI analysis\n• Fitness tips & motivation\n\nWhat can I help you with today?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(!floating)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text = input) {
    if (!text.trim() || loading) return
    const userMsg = text.trim()
    setInput('')

    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    const history = messages.slice(-6)
    const { text: reply } = await askGemini(userMsg, history)

    setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    setLoading(false)
  }

  if (floating && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-500 rounded-full shadow-2xl shadow-brand-500/40
        flex items-center justify-center text-white hover:bg-brand-600 hover:scale-110 transition-all z-50 group"
      >
        <Bot size={24} />
        <span className="absolute -top-10 right-0 bg-dark-800 text-white text-xs px-3 py-1 rounded-lg
        whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity font-body">
          AI Coach
        </span>
      </button>
    )
  }

  const chatContent = (
    <div className={`flex flex-col ${floating ? 'h-full' : 'h-[600px]'}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-brand-500' : 'bg-dark-800 dark:bg-dark-600'
            }`}>
              {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-brand-400" />}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-body leading-relaxed ${
              msg.role === 'user'
                ? 'bg-brand-500 text-white rounded-tr-none'
                : 'bg-gray-100 dark:bg-dark-600 text-gray-800 dark:text-gray-200 rounded-tl-none'
            }`}>
              {msg.content.split('\n').map((line, j) => (
                <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-dark-800 dark:bg-dark-600 flex items-center justify-center">
              <Bot size={14} className="text-brand-400" />
            </div>
            <div className="bg-gray-100 dark:bg-dark-600 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions (only at start) */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400 font-body mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.slice(0, 3).map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400
                rounded-full font-body hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-100 dark:border-dark-600">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask your AI coach..."
            className="input-field py-2.5 text-sm"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white
            hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-400 font-body mt-1.5 text-center">
          Powered by Gemini AI ✨
        </p>
      </div>
    </div>
  )

  if (floating) {
    return (
      <>
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[520px] bg-white dark:bg-dark-700 rounded-3xl
        shadow-2xl border border-gray-200 dark:border-dark-500 z-50 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-dark-800 to-dark-900 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500/20 rounded-full flex items-center justify-center">
              <Bot size={18} className="text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-heading font-bold text-sm">PowerFit AI Coach</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <p className="text-green-400 text-xs font-body">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          {chatContent}
        </div>
        <button onClick={() => setIsOpen(false)}
          className="fixed bottom-[540px] right-6 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center
          text-white hover:bg-gray-700 transition-all z-50 shadow-lg">
          <Minimize2 size={14} />
        </button>
      </>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-800 to-dark-900 px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center">
          <Sparkles size={20} className="text-brand-400" />
        </div>
        <div>
          <p className="text-white font-heading font-bold">PowerFit AI Coach</p>
          <p className="text-gray-400 text-xs font-body">Powered by Google Gemini</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-body">Active</span>
        </div>
      </div>
      {chatContent}
    </div>
  )
}
