import React, { useEffect, useState, useRef } from 'react'
import mockStats from '@/mock/landing/stats'

function Counter({ val }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  
  useEffect(() => {
    let active = true
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = 0
        const end = val
        const duration = 1500 // 1.5s
        const startTime = performance.now()
        
        const tick = (now) => {
          if (!active) return
          const progress = Math.min((now - startTime) / duration, 1)
          setCount(Math.floor(progress * (end - start) + start))
          if (progress < 1) {
            requestAnimationFrame(tick)
          }
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      }
    })
    
    if (ref.current) observer.observe(ref.current)
    return () => {
      active = false
      observer.disconnect()
    }
  }, [val])

  return <span ref={ref}>{count}</span>
}

export default function StatsSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-20 relative select-none">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 bg-slate-900/30 border border-white/5 p-8 md:p-12 rounded-3xl backdrop-blur-sm shadow-xl">
        {mockStats.map((stat) => (
          <div key={stat.id} className="flex flex-col gap-2 items-center text-center">
            <h3 className="text-3xl md:text-5xl font-extrabold text-white">
              <Counter val={stat.value} />
              <span className="text-primary font-black ml-0.5">{stat.suffix}</span>
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}