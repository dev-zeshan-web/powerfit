import { useEffect, useState } from 'react'
import { Clock, Users, Dumbbell, Filter, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Cardio', 'Strength', 'Yoga', 'Core', 'Martial Arts']
const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

const LEVEL_COLORS = {
  'Beginner': 'badge-success', 'Intermediate': 'badge-warning',
  'Advanced': 'badge-danger', 'All Levels': 'badge-info'
}

export default function Classes() {
  const [classes, setClasses] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeLevel, setActiveLevel] = useState('All Levels')
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    let result = classes
    if (activeCategory !== 'All') result = result.filter(c => c.category === activeCategory)
    if (activeLevel !== 'All Levels') result = result.filter(c => c.level === activeLevel)
    setFiltered(result)
  }, [activeCategory, activeLevel, classes])

  async function fetchClasses() {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*, profiles(full_name)')
        .eq('is_active', true)
        .order('schedule', { ascending: true })
      if (error) console.error('Classes fetch error:', error)
      setClasses(data || [])
    } catch (err) {
      console.error('Classes error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function bookClass(classId) {
    if (!user) { toast.error('Please login to book a class'); navigate('/login'); return }
    setBooking(classId)
    try {
      const { error } = await supabase.from('class_bookings').insert({
        class_id: classId, member_id: user.id, status: 'confirmed'
      })
      if (error?.code === '23505') { toast.error('You already booked this class'); return }
      if (error) throw error
      toast.success('Class booked successfully! 🎉')
      fetchClasses()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBooking(null)
    }
  }

  return (
    <div className="page-enter pt-20 min-h-screen bg-white dark:bg-dark-900">
      {/* Hero */}
      <section className="py-20 bg-dark-800 dark:bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img loading="eager" decoding="async" fetchpriority="high" src="https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="bg" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-dark-900/80" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-brand-400 font-heading font-semibold text-sm uppercase tracking-widest mb-4">SCHEDULE</p>
          <h1 className="font-display text-5xl md:text-7xl text-white mb-6 tracking-wide">
            GYM <span className="text-brand-500">CLASSES</span>
          </h1>
          <p className="text-gray-400 font-body text-lg max-w-xl mx-auto">
            Book your spot in expert-led classes. From beginner yoga to advanced HIIT — we have it all.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-white dark:bg-dark-900 border-b border-gray-100 dark:border-dark-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Filter size={16} />
              <span className="text-sm font-body font-semibold">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-body font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-2">
              {LEVELS.map(level => (
                <button key={level} onClick={() => setActiveLevel(level)}
                  className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-all border ${
                    activeLevel === level
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600'
                      : 'border-gray-200 dark:border-dark-500 text-gray-500 hover:border-brand-400'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Classes Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 spinner mx-auto mb-4" />
              <p className="text-gray-400 font-body">Loading classes...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Dumbbell className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-400 font-body text-lg">No classes found</p>
              <button onClick={() => { setActiveCategory('All'); setActiveLevel('All Levels') }}
                className="mt-4 text-brand-500 font-body font-semibold hover:text-brand-600">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(cls => {
                const schedDate = new Date(cls.schedule)
                const spotsLeft = cls.capacity - (cls.enrolled_count || 0)
                const isFull = spotsLeft <= 0

                return (
                  <div key={cls.id} className="card-hover overflow-hidden group">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={cls.image_url || 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={cls.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="badge bg-brand-500/90 text-white text-xs backdrop-blur-sm">{cls.category}</span>
                        <span className={`${LEVEL_COLORS[cls.level] || 'badge-info'} backdrop-blur-sm text-xs`}>{cls.level}</span>
                      </div>
                      {isFull && (
                        <div className="absolute top-3 right-3 badge bg-red-500/90 text-white text-xs backdrop-blur-sm">FULL</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-heading font-bold text-lg text-dark-800 dark:text-white mb-2">{cls.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 font-body text-sm line-clamp-2 mb-4">{cls.description}</p>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-body">
                          <Calendar size={12} className="text-brand-500" />
                          <span>{format(schedDate, 'EEE, MMM d')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-body">
                          <Clock size={12} className="text-brand-500" />
                          <span>{format(schedDate, 'h:mm a')} · {cls.duration_minutes}min</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-body">
                          <Users size={12} className="text-brand-500" />
                          <span>{spotsLeft > 0 ? `${spotsLeft} spots left` : 'Class full'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-body">
                          <Dumbbell size={12} className="text-brand-500" />
                          <span>{cls.profiles?.full_name || 'TBD'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => bookClass(cls.id)}
                        disabled={isFull || booking === cls.id}
                        className={`w-full py-2.5 rounded-xl font-heading font-semibold text-sm transition-all ${
                          isFull
                            ? 'bg-gray-100 dark:bg-dark-600 text-gray-400 cursor-not-allowed'
                            : 'bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20'
                        }`}
                      >
                        {booking === cls.id ? 'Booking...' : isFull ? 'Class Full' : '+ Book Now'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
