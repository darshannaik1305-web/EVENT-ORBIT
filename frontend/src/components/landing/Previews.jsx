import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WelcomeBanner from '../dashboard/WelcomeBanner'
import StatsCard from '../dashboard/StatsCard'
import QuickActionCard from '../dashboard/QuickActionCard'

export default function Previews() {
  const [activeTab, setActiveTab] = useState('student')

  const tabs = [
    { id: 'student', label: 'Student Portal' },
    { id: 'club', label: 'Club Coordinator' },
    { id: 'admin', label: 'System Admin' }
  ]

  return (
    <section id="previews" className="w-full max-w-5xl mx-auto px-6 py-20 relative select-none">
      <div className="text-center max-w-2xl mx-auto flex flex-col gap-4 mb-12">
        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full w-max mx-auto">
          Interactive Previews
        </span>
        <h2 className="text-3xl font-black text-white tracking-tight">Explore the Platform</h2>
        <p className="text-sm text-slate-400 font-medium">Click tabs to see what dashboard screens look like after logging in.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-10 border-b border-white/5 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs md:text-sm font-bold rounded-full transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Renders dynamic widgets */}
      <div className="bg-[#12182B]/60 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md min-h-[380px] flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {activeTab === 'student' && (
            <motion.div
              key="student"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              <WelcomeBanner name="Rahul Roy" role="Student" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-secondary uppercase bg-secondary/10 px-2 py-0.5 rounded-full">Spotlight</span>
                    <h3 className="text-base font-bold text-white mt-3">Nexus Hackathon registrations closing!</h3>
                    <p className="text-xs text-slate-400 mt-2">Make sure to submit team group codes before Aug 15.</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-4">Ends in 2 days</span>
                </div>
                <div className="flex flex-col gap-4">
                  <QuickActionCard label="Join Coding Club" description="Participate in campus algos" icon="💻" />
                  <QuickActionCard label="Save spot for Acoustics Jam" description="Acoustics Music Jam session" icon="🎵" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'club' && (
            <motion.div
              key="club"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard label="Registered Students" value="142" icon="👥" accentColor="blue" />
                <StatsCard label="Winners Declared" value="12" icon="🏆" accentColor="secondary" />
                <StatsCard label="Active Contests" value="3" icon="🔥" accentColor="success" />
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Podium Declarations</h4>
                <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-white/5 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-white">Nexus Hackathon 2026</span>
                    <p className="text-[10px] text-slate-400 mt-1">First Place winner declared: rahul.roy@mvjce.edu</p>
                  </div>
                  <span className="text-[10px] font-bold text-success uppercase bg-success/15 px-2.5 py-0.5 rounded-full border border-success/20">Declared</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Club Approval Queue</h4>
                  <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-white/5 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-white">Robotics Research Club</span>
                      <p className="text-[10px] text-slate-400 mt-1">Requested by Professor Sinha, ME</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-[9px] font-bold text-white bg-primary px-2.5 py-1 rounded-full cursor-pointer">Accept</button>
                      <button className="text-[9px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full cursor-pointer">Reject</button>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Analytics</h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Total Accounts Created</span>
                      <span className="text-white font-bold">5,240</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[80%]" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}