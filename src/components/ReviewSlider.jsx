import { useEffect, useState, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { supabase } from '../lib/supabase'

const FALLBACK_REVIEWS = [
  { id: 1, full_name: 'Ahmed Raza',   rating: 5, comment: 'PowerFit completely transformed my life! Lost 18kg in 4 months. The AI coach knows exactly what I need.', avatar: 'A', joined: '6 months ago' },
  { id: 2, full_name: 'Bilal Hassan', rating: 5, comment: 'Best gym in Pakistan! The trainers are world-class and the AI workout planner is absolutely incredible.',  avatar: 'B', joined: '8 months ago' },
  { id: 3, full_name: 'Usman Khan',   rating: 5, comment: 'The class booking system is so convenient. I can plan my whole week in minutes. Highly recommended!',       avatar: 'U', joined: '1 year ago'  },
  { id: 4, full_name: 'Zain Ali',     rating: 4, comment: 'Premium membership is worth it. Gained 8kg of muscle in 5 months with the personalized plans.',              avatar: 'Z', joined: '3 months ago' },
  { id: 5, full_name: 'Farhan Malik', rating: 5, comment: 'The AI BMI tracker and nutrition advice is mind-blowing. PowerFit is the future of fitness!',                 avatar: 'F', joined: '7 months ago' },
  { id: 6, full_name: 'Hamza Shahid', rating: 5, comment: 'Incredible facility with top-notch equipment. The staff is very professional and supportive.',                 avatar: 'H', joined: '5 months ago' },
]

export default function ReviewSlider() {
  const [reviews, setReviews]   = useState(FALLBACK_REVIEWS)
  const [current, setCurrent]   = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [animating, setAnimating] = useState(false)

  useEffect(() => { fetchReviews() }, [])

  useEffect(() => {
    if (!autoPlay || reviews.length <= 1) return
    const timer = setInterval(() => go('next', true), 6000)
    return () => clearInterval(timer)
  }, [autoPlay, reviews.length, current])

  async function fetchReviews() {
    try {
      const { data } = await supabase
        .from('reviews')
        .select('id, rating, comment, reviewer_name, created_at')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (data && data.length > 0) {
        // Deduplicate by id
        const seen = new Set()
        const unique = data.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true })
        setReviews(unique.map(r => ({
          id: r.id,
          full_name: r.reviewer_name || 'Anonymous',
          avatar:    (r.reviewer_name?.[0] || 'A').toUpperCase(),
          rating:    r.rating,
          comment:   r.comment,
          joined:    new Date(r.created_at).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' }),
        })))
        setCurrent(0)
      }
    } catch { /* use fallback */ }
  }

  function go(dir, fromAutoPlay = false) {
    if (animating) return
    if (!fromAutoPlay) setAutoPlay(false)
    setAnimating(true)
    setCurrent(prev =>
      dir === 'next'
        ? (prev + 1) % reviews.length
        : (prev - 1 + reviews.length) % reviews.length
    )
    setTimeout(() => setAnimating(false), 400)
  }

  // Returns [leftIdx, centerIdx, rightIdx] — all distinct even with 2 reviews
  // Uses position keys so React never sees duplicate keys
  const total = reviews.length

  // Indices for the 3 slots
  const leftIdx   = (current - 1 + total) % total
  const centerIdx = current
  const rightIdx  = (current + 1) % total

  // Only show side cards if there are at least 2 other reviews
  const showSides = total >= 3

  return (
    <div className="relative w-full select-none">

      {/* Cards */}
      <div className="relative flex items-center justify-center gap-4 px-4 py-8 overflow-hidden">

        {/* Left card — desktop only */}
        {showSides && (
          <div
            key={`left-${leftIdx}`}
            onClick={() => go('prev')}
            className="hidden md:block w-64 lg:w-72 flex-shrink-0 scale-90 opacity-40 cursor-pointer transition-all duration-500 hover:opacity-60"
          >
            <ReviewCard review={reviews[leftIdx]} />
          </div>
        )}

        {/* Center card — always visible */}
        <div
          key={`center-${centerIdx}`}
          className={`w-full max-w-lg flex-shrink-0 transition-all duration-500 ${animating ? 'opacity-70 scale-95' : 'opacity-100 scale-100'}`}
        >
          <ReviewCard review={reviews[centerIdx]} isCenter />
        </div>

        {/* Right card — desktop only */}
        {showSides && (
          <div
            key={`right-${rightIdx}`}
            onClick={() => go('next')}
            className="hidden md:block w-64 lg:w-72 flex-shrink-0 scale-90 opacity-40 cursor-pointer transition-all duration-500 hover:opacity-60"
          >
            <ReviewCard review={reviews[rightIdx]} />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button
          onClick={() => go('prev')}
          className="w-10 h-10 rounded-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-500
          flex items-center justify-center text-gray-600 dark:text-gray-400
          hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all duration-200 shadow-sm"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setAutoPlay(false) }}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2.5 bg-brand-500'
                  : 'w-2.5 h-2.5 bg-gray-300 dark:bg-dark-500 hover:bg-brand-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => go('next')}
          className="w-10 h-10 rounded-full bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-500
          flex items-center justify-center text-gray-600 dark:text-gray-400
          hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all duration-200 shadow-sm"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

/* ── Review Card ──────────────────────────────────────────── */
function ReviewCard({ review, isCenter = false }) {
  return (
    <div className={`card p-6 relative h-full ${isCenter ? 'border-brand-500/30 shadow-2xl shadow-brand-500/10 ring-1 ring-brand-500/20' : ''}`}>
      <Quote className="text-brand-500/20 absolute top-4 right-4" size={36} />

      {/* Stars */}
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={isCenter ? 18 : 14}
            className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}
          />
        ))}
        <span className="text-xs text-gray-400 ml-1 font-body">{review.rating}/5</span>
      </div>

      {/* Comment */}
      <p className={`text-gray-700 dark:text-gray-300 font-body leading-relaxed mb-5 ${isCenter ? 'text-base' : 'text-sm line-clamp-3'}`}>
        "{review.comment}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 mt-auto">
        <div className={`${isCenter ? 'w-11 h-11 text-lg' : 'w-9 h-9 text-sm'} rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold flex-shrink-0`}>
          {review.avatar}
        </div>
        <div>
          <p className={`font-heading font-bold text-dark-800 dark:text-white ${isCenter ? 'text-base' : 'text-sm'}`}>
            {review.full_name}
          </p>
          <p className="text-xs text-gray-400 font-body">Member since {review.joined}</p>
        </div>
      </div>
    </div>
  )
}
