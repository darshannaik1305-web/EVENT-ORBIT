import React, { useState } from 'react'
import chatService from '@/services/chatService'

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your EventOrbit AI Assistant. Ask me anything about campus events, club details, registration procedures, or rules!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userText = input.trim()
    setMessages((prev) => [...prev, { sender: 'user', text: userText }])
    setInput('')
    setLoading(true)

    try {
      const res = await chatService.sendQuery(userText)
      const reply = res.data?.reply || res.data || "I don't have that exact detail right now, but feel free to check the Clubs page!"
      setMessages((prev) => [...prev, { sender: 'bot', text: typeof reply === 'string' ? reply : JSON.stringify(reply) }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'EventOrbit Assistant is ready! Check out upcoming hackathons and dance events on the Dashboard.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl space-y-2">
        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
          <span>🤖</span> AI Campus Assistant
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Get instant answers regarding upcoming contests, club registrations, and event guidelines.
        </p>
      </div>

      {/* Chat Box Container */}
      <div className="bg-slate-900 border border-white/10 rounded-3xl h-[520px] flex flex-col overflow-hidden shadow-2xl">
        {/* Messages List */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-950/60">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col gap-1 max-w-[80%] ${msg.sender === 'user' ? 'self-end items-end ml-auto' : 'self-start items-start'}`}
            >
              <div
                className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20 font-medium'
                    : 'bg-slate-900 text-slate-200 border border-white/10 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="self-start text-xs text-primary animate-pulse flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-white/5">
              <span>🤖</span> Assistant is thinking...
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-white/10 flex gap-3">
          <input
            type="text"
            placeholder="Ask about events, rules, clubs, or registration steps..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
