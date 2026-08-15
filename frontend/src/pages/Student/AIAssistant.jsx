import React, { useState, useRef, useEffect } from 'react'
import chatService from '@/services/chatService'

const SUGGESTIONS = [
  "What events are happening this week?",
  "Which clubs are available?",
  "Who won the latest events?",
  "Show my participation",
  "How to apply for SSP scholarship?"
]

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your EventOrbit Smart Assistant. Ask me anything about campus events, registration deadlines, club details, scholarship processes, or your event participation!',
      sources: []
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const sendQueryText = async (textToSend) => {
    if (!textToSend.trim() || loading) return

    const queryText = textToSend.trim()
    setMessages((prev) => [...prev, { sender: 'user', text: queryText }])
    setInput('')
    setLoading(true)

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
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    sendQueryText(input)
  }

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: 'Chat cleared. How else can I assist you with campus events or guidelines today?',
        sources: []
      }
    ])
  }

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <span className="p-2 bg-primary/20 text-primary rounded-2xl border border-primary/30">🤖</span> 
            EventOrbit AI Assistant
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">
            Powered by RAG & Database retrieval. Instant verified answers for events, rules & scholarships.
          </p>
        </div>
        <button
          onClick={handleClearChat}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-all flex items-center gap-2"
          title="Clear Chat History"
        >
          <span>🗑️</span> Clear Chat
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-slate-400 text-xs font-medium mr-1 flex items-center gap-1">
          <span>💡</span> Quick Prompts:
        </span>
        {SUGGESTIONS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => sendQueryText(chip)}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-900/80 hover:bg-primary/20 hover:border-primary/50 border border-white/10 text-slate-300 hover:text-white text-xs rounded-full transition-all text-left disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-slate-900 border border-white/10 rounded-3xl h-[520px] flex flex-col overflow-hidden shadow-2xl">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-950/60 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col gap-2 max-w-[85%] ${
                msg.sender === 'user' ? 'self-end items-end ml-auto' : 'self-start items-start'
              }`}
            >
              <div
                className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20 font-medium'
                    : msg.isError
                    ? 'bg-red-950/80 text-red-200 border border-red-500/30 rounded-tl-none'
                    : 'bg-slate-900 text-slate-200 border border-white/10 rounded-tl-none shadow-md'
                }`}
              >
                {msg.text}
              </div>

              {/* Source Metadata Badges */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1 px-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider self-center mr-1">
                    Sources:
                  </span>
                  {msg.sources.map((src, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 bg-slate-800 border border-white/10 text-[11px] text-slate-300 rounded-md font-mono flex items-center gap-1"
                    >
                      <span className="text-primary font-bold">[{src.type || 'INFO'}]</span>
                      <span>{src.title || src.id}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="self-start text-xs text-primary animate-pulse flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-white/10">
              <span className="animate-spin">⏳</span> AI Assistant is searching records...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-white/10 flex gap-3">
          <input
            type="text"
            placeholder="Ask about events, rules, clubs, or registration steps..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary placeholder:text-slate-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-primary hover:bg-primary-hover disabled:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <span>Send</span>
            <span>➔</span>
          </button>
        </form>
      </div>
    </div>
  )
}
