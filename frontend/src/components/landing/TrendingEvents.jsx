import React from 'react'
import mockEvents from '@/mock/landing/events'
import EventCard from './EventCard'

export default function TrendingEvents() {
  return (
    <section id="events" className="w-full max-w-5xl mx-auto px-6 py-12 relative select-none">
      <div className="flex flex-col gap-2 mb-12 text-left">
        <span className="text-xs font-extrabold text-primary tracking-wider uppercase">
          🔥 Rising in Popularity
        </span>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Trending Events</h2>
        <p className="text-sm text-slate-500 font-medium">Explore live contests that students are joining right now.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockEvents.map((evt) => (
          <EventCard key={evt.id} {...evt} />
        ))}
      </div>
    </section>
  )
}