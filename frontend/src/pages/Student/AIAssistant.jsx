import React, { useState, useRef, useEffect } from 'react'
import chatService from '@/services/chatService'

const SUGGESTIONS = [
  "What events are happening this week?",
  "Which clubs are available?",
  "Who won the latest events?",
  "What are my achievements?",
  "Show my participation",
  "Where is CG department?",
  "How to apply for SSP scholarship?"
]

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your EventOrbit AI Assistant for MVJ College of Engineering. Ask me anything about campus events, registration deadlines, club details, scholarships, departments, or your personal achievements!',
      sources: []
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // Focus input automatically on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendQueryText = async (textToSend) => {
    if (!textToSend.trim() || loading) return

    const queryText = textToSend.trim()
    setMessages((prev) => [...prev, { sender: 'user', text: queryText }])
    setInput('')
    setLoading(true)

    // Keep cursor inside the textbox so student can immediately start typing the next question
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)

    try {
      const res = await chatService.sendQuery(queryText)
      const data = res.data || {}
      const reply = data.reply || data.response || "I don't have that specific information in my records right now. Please contact the department or check official notices."
      const sources = data.sources || []

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: typeof reply === 'string' ? reply : JSON.stringify(reply),
          sources: sources
        }
      ])
    } catch (err) {
      console.error('Chat API Error:', err)
      const errorMsg = err.response?.status === 401 
        ? 'Your session has expired. Please log in again to continue.' 
        : 'Unable to connect to EventOrbit Assistant right now. Please verify your connection or try again shortly.'

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: errorMsg,
          isError: true
        }
      ])
    } finally {
      setLoading(false)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    // Cannot send next question until the previous answer is received
    if (loading) return
    sendQueryText(input)
  }

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: 'Chat history cleared. How else can I assist you with MVJCE events, rules, or guidelines today?',
        sources: []
      }
    ])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2.5rem)] sm:h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] select-none max-w-4xl mx-auto gap-3 overflow-hidden">
      {/* Streamlined Institutional Header Banner */}
      <div className="bg-[#F28D1E] text-white px-4 sm:px-5 py-3 rounded-2xl shadow-sm relative overflow-hidden flex items-center justify-between gap-3 shrink-0">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#7B1113]/20 pointer-events-none" />
        <div className="relative z-10 flex items-center min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-headings font-extrabold text-white tracking-tight truncate">
                EventOrbit AI Campus Assistant
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-white/90 text-xs truncate max-w-xl hidden sm:block">
              MVJCE Institutional Intelligence • RAG & verified database retrieval
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl border border-white/30 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 relative z-10"
          title="Clear Chat History"
        >
          <span>🗑️</span>
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Quick Prompts Horizontal Scroll Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className="text-[#888888] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
          <span>💡</span> Prompts:
        </span>
        {SUGGESTIONS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => sendQueryText(chip)}
            disabled={loading}
            className="px-3 py-1 bg-white hover:bg-[#F28D1E]/10 hover:border-[#F28D1E]/30 border border-[#E5E1DC] text-[#555555] hover:text-[#F28D1E] text-xs font-medium rounded-full transition-all whitespace-nowrap shrink-0 disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Container - Flexible to Fill Remaining Viewport Height with Prominent Shadow Effect */}
      <div className="bg-white rounded-2xl border border-[#D5D0C7] flex-1 min-h-0 flex flex-col overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.03]">
        {/* Messages Scroll Area - Scrolls internally only */}
        <div className="flex-1 min-h-0 p-4 sm:p-5 space-y-3.5 overflow-y-auto bg-[#FAF9F7]/90">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col gap-1.5 max-w-[85%] ${
                msg.sender === 'user' ? 'self-end items-end ml-auto' : 'self-start items-start'
              }`}
            >
              <div
                className={`p-3.5 sm:p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-[#F28D1E] text-white rounded-tr-none shadow-sm font-medium'
                    : msg.isError
                    ? 'bg-[#B42318]/10 text-[#B42318] border border-[#B42318]/20 rounded-tl-none font-medium'
                    : 'bg-white text-[#202020] border border-[#E2DDD5] rounded-tl-none shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                }`}
              >
                {msg.text}
              </div>

              {/* Source Metadata Badges */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-0.5 px-1">
                  <span className="text-[10px] text-[#888888] font-bold uppercase tracking-wider self-center mr-1">
                    Verified Sources:
                  </span>
                  {msg.sources.map((src, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-0.5 bg-white border border-[#E5E1DC] text-[11px] text-[#555555] rounded-md font-mono flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="text-[#7B1113] font-bold">[{src.type || 'INFO'}]</span>
                      <span>{src.title || src.id}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="self-start text-xs text-[#F28D1E] font-semibold flex items-center gap-2 p-3 bg-white rounded-xl border border-[#E5E1DC] shadow-sm">
              <span className="animate-spin">⏳</span> Querying EventOrbit knowledge & database...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Permanently Pinned Input Form at bottom */}
        <form onSubmit={handleSend} className="p-3 sm:p-3.5 bg-white border-t border-[#E5E1DC] shadow-[0_-4px_16px_rgba(0,0,0,0.02)] flex gap-2 sm:gap-3 shrink-0">
          <input
            ref={inputRef}
            type="text"
            placeholder={loading ? "Type next question... (will send after answer arrives)" : "Ask about events, rules, clubs, registrations, departments..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#F7F6F3] border border-[#DDD8D0] rounded-xl text-xs sm:text-sm text-[#202020] focus:outline-none focus:border-[#F28D1E] focus:bg-white placeholder-[#888888] transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#F28D1E] hover:bg-[#D97706] disabled:bg-[#F1EFEB] disabled:text-[#888888] disabled:border-[#E5E1DC] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm shadow-[#F28D1E]/25 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
            title={loading ? "Waiting for previous answer before sending next question" : "Send question"}
          >
            <span>{loading ? 'Waiting...' : 'Send'}</span>
            <span>➔</span>
          </button>
        </form>
      </div>
    </div>
  )
}
