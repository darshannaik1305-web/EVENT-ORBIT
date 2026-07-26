import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import SectionHeader from '@/components/dashboard/SectionHeader'
import EventCard from '@/components/dashboard/EventCard'
import StatsCard from '@/components/dashboard/StatsCard'
import QuickActionCard from '@/components/dashboard/QuickActionCard'
import { mockEvents, weeklyEvents } from '@/mock/landing/events'
import mockClubs from '@/mock/landing/clubs'
import useAuth from '@/hooks/useAuth'
import Button from '@/components/common/Button'

export default function StudentHome() {
  const { user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hey there! Ask me anything about campus events, registrations, or timings.' }
  ])
  const [chatInput, setChatInput] = useState('')

  const handleSendChat = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const userMsg = { sender: 'user', text: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')

    setTimeout(() => {
      let botText = "I'm checking that for you. The next Coding Club Hackathon starts on August 18."
      if (chatInput.toLowerCase().includes('dance')) {
        botText = 'The Rhythm Dance Fest auditions are on September 02 at the OAT.'
      } else if (chatInput.toLowerCase().includes('sports') || chatInput.toLowerCase().includes('futsal')) {
        botText = 'Futsal League Matches start this Saturday at 09:00 AM.'
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: botText }])
    }, 1000)
  }

  return (
    <div className="flex flex-col gap-8 pb-16 w-full select-none">
      {/* 1. Welcome Banner */}
      <WelcomeBanner name={user?.fullName || 'Rahul Roy'} role="Student" />

      {/* 2. Campus Spotlight (Signature Widget) */}
      <div className="bg-gradient-to-r from-primary/30 to-secondary/3 bg-panel border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-secondary/10 to-transparent pointer-events-none -z-10" />
        <span className="text-[10px] font-bold text-secondary uppercase bg-secondary/10 px-2.5 py-0.5 rounded-full select-none border border-secondary/20">
          🔥 Campus Spotlight
        </span>
        <h3 className="text-xl font-black text-white mt-4">Graffiti Annual College Fest announced!</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-xl leading-relaxed">
          The biggest cultural carnival is scheduled for Oct 12-14. Get ready for concerts, DJ nights, food trucks, and inter-college team battles. Registrations open next week!
        </p>
        <div className="flex items-center gap-4 mt-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span>🔔 Announcement: Prof. Sinha</span>
          <span>📅 Dates: Oct 12-14</span>
        </div>
      </div>

      {/* Grid container splitting visual priority */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left main feed */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* 3. Upcoming Events */}
          <div>
            <SectionHeader title="Upcoming Campus Events" subtitle="Contests starting this month" icon="📅" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockEvents.map(evt => (
                <EventCard key={evt.id} {...evt} onAction={() => {}} actionLabel="Register Slot" />
              ))}
            </div>
          </div>

          {/* 4. My Registrations */}
          <div className="bg-panel border border-white/5 p-6 rounded-3xl">
            <SectionHeader title="My Active Registrations" subtitle="Verify your entry team codes" icon="🎟️" />
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-white">Nexus National Hackathon 2026</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Team Code: NEX-880 • Leader: Rahul Roy</p>
                </div>
                <span className="text-[10px] font-bold text-success uppercase bg-success/15 px-2.5 py-0.5 rounded-full border border-success/20">Confirmed</span>
              </div>
            </div>
          </div>

          {/* 5. Recommended Events */}
          <div>
            <SectionHeader title="Recommended for You" subtitle="Based on your student profile" icon="🎯" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EventCard 
                title="Lens-Craft Street Photography Walk" 
                clubName="Photography Club" 
                date="Sep 10, 2026" 
                location="Campus Gardens" 
                seatsLeft={8} 
                category="Photography" 
                image="https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=600"
                onAction={() => {}}
                actionLabel="Claim Ticket"
              />
            </div>
          </div>
        </div>

        {/* Right sidebar details */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* 6. My Clubs */}
          <div className="bg-panel border border-white/5 p-6 rounded-3xl">
            <SectionHeader title="My Clubs" icon="🏛️" />
            <div className="flex flex-col gap-3">
              {mockClubs.slice(0, 3).map(club => (
                <div key={club.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{club.logo}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{club.name}</h4>
                      <p className="text-[9px] text-slate-400">{club.members} Members</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">Active</span>
                </div>
              ))}
            </div>
          </div>

          {/* 7. Weekly Calendar */}
          <div className="bg-panel border border-white/5 p-6 rounded-3xl">
            <SectionHeader title="Week Agenda" icon="🗓️" />
            <div className="flex flex-col gap-3">
              {weeklyEvents.map(evt => (
                <div key={evt.id} className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-white/5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{evt.club}</span>
                    <h4 className="text-xs font-bold text-white leading-snug">{evt.title}</h4>
                    <span className="text-[9px] text-slate-500">{evt.time} • {evt.location}</span>
                  </div>
                  <span className="text-[10px] font-bold text-secondary">{evt.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 11. Leaderboard */}
          <div className="bg-panel border border-white/5 p-6 rounded-3xl">
            <SectionHeader title="Leaderboard Standings" icon="🏆" />
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold p-2 bg-white/5 rounded-xl">
                <span className="text-white">🥇 1. Rohan Deshmukh</span>
                <span className="text-primary font-bold">420 pts</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold p-2 bg-slate-900/60 rounded-xl">
                <span className="text-slate-200">🥈 2. Aishwarya Sen</span>
                <span className="text-primary font-bold">390 pts</span>
              </div>
            </div>
          </div>

          {/* 10. Certificates */}
          <div className="bg-panel border border-white/5 p-6 rounded-3xl">
            <SectionHeader title="My Certificates" icon="🎓" />
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Nexus Hackathon Participant</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Coding Club • Issued Aug 2026</p>
                </div>
                <span className="text-lg">📜</span>
              </div>
            </div>
          </div>

          {/* 12. Quick Actions */}
          <div className="bg-panel border border-white/5 p-6 rounded-3xl">
            <SectionHeader title="Quick Actions" icon="⚡" />
            <div className="flex flex-col gap-3">
              <QuickActionCard label="AI Campus Guide" description="Ask assistant anything" icon="🤖" onClick={() => setShowAIChat(true)} />
              <QuickActionCard label="View Notifications" description="Read active circular announcements" icon="indigo" onClick={() => setShowNotifications(true)} />
            </div>
          </div>
        </div>
      </div>

      {/* 9. Notifications Slide-in Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-sm bg-panel border-l border-white/8 h-full p-6 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                  <h3 className="text-base font-bold text-white">Notifications Panel</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white cursor-pointer select-none">✕</button>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-bold text-primary uppercase">Dance Club</span>
                    <h4 className="text-xs font-bold text-white mt-1">Audition slots expanded</h4>
                    <p className="text-[10px] text-slate-400 mt-1">We added 10 slots for Thursday rehearsals.</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowNotifications(false)}>Close Panel</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. AI Assistant Modal Drawer */}
      <AnimatePresence>
        {showAIChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-panel border border-white/8 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[480px]"
            >
              <div className="bg-slate-900/60 border-b border-white/5 p-4 flex items-center justify-between select-none">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 bg-success rounded-full animate-pulse" />
                  <span className="text-xs font-extrabold text-white">EventOrbit Assistant</span>
                </div>
                <button onClick={() => setShowAIChat(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
              </div>

              <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === 'user' ? 'self-end items-end' : ''}`}>
                    <div className={`py-2.5 px-4 rounded-3xl text-xs font-semibold ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-tr from-primary to-secondary text-white rounded-tr-none shadow-md shadow-primary/10' 
                        : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="p-4 border-t border-white/5 bg-slate-900/40 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask anything..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2 bg-[#12182B] border border-white/8 rounded-xl text-xs text-white focus:outline-none focus:border-primary/50"
                />
                <Button type="submit" variant="primary" size="sm" className="text-xs px-4 py-2">Send</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
