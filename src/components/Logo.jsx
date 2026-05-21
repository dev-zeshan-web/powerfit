import React from 'react'

export default function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: { text: 'text-xl', icon: 20 },
    md: { text: 'text-2xl', icon: 28 },
    lg: { text: 'text-4xl', icon: 40 },
  }
  const s = sizes[size] || sizes.md

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* SVG Icon - Lightning bolt + dumbbell */}
      <div className="relative flex-shrink-0">
        <svg width={s.icon} height={s.icon} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hexagon background */}
          <polygon
            points="20,2 37,11 37,29 20,38 3,29 3,11"
            fill="#1a1a2e"
            stroke="#FF6B00"
            strokeWidth="2"
          />
          {/* Dumbbell shape */}
          <rect x="6" y="18" width="28" height="4" rx="2" fill="#FF6B00"/>
          <rect x="4" y="14" width="6" height="12" rx="3" fill="white"/>
          <rect x="30" y="14" width="6" height="12" rx="3" fill="white"/>
          <rect x="8" y="16" width="4" height="8" rx="1.5" fill="#FF6B00" opacity="0.7"/>
          <rect x="28" y="16" width="4" height="8" rx="1.5" fill="#FF6B00" opacity="0.7"/>
          {/* Lightning bolt */}
          <polygon points="22,8 18,20 21,20 18,32 24,17 21,17 25,8" fill="#FF6B00"/>
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span className={`font-display ${s.text} text-dark-800 dark:text-white tracking-widest`}>
          POWER<span className="text-brand-500">FIT</span>
        </span>
        <span className="text-[9px] font-heading font-medium tracking-[0.25em] text-gray-400 uppercase ml-0.5">
          AI Smart Gym
        </span>
      </div>
    </div>
  )
}
