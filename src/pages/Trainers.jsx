import { useEffect, useState } from 'react'
import { Instagram, Star, Award, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'

const FALLBACK_TRAINERS = [
  { id: 1, full_name: 'Coach Bilal', specialization: 'Strength & Powerlifting', experience_years: 8, rating: 4.9, total_clients: 120, bio: 'National powerlifting champion with 8 years of coaching elite athletes.', image_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400', certifications: ['NASM CPT', 'CSCS', 'Powerlifting Coach'] },
  { id: 2, full_name: 'Coach Hamza', specialization: 'HIIT & Functional Training', experience_years: 6, rating: 4.8, total_clients: 98, bio: 'Specializes in high-intensity training and athletic performance enhancement.', image_url: 'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?auto=compress&cs=tinysrgb&w=400', certifications: ['ACE CPT', 'HIIT Specialist', 'Nutrition Coach'] },
  { id: 3, full_name: 'Coach Usman', specialization: 'Bodybuilding & Aesthetics', experience_years: 10, rating: 5.0, total_clients: 155, bio: 'IFBB Pro with 10 years of bodybuilding experience. Master of physique transformation.', image_url: 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=400', certifications: ['IFBB Pro', 'NASM CPT', 'Sports Nutrition'] },
  { id: 4, full_name: 'Coach Zain', specialization: 'Yoga & Mindfulness', experience_years: 7, rating: 4.9, total_clients: 87, bio: 'Certified yoga instructor combining mindfulness with physical training for holistic wellness.', image_url: 'https://images.pexels.com/photos/2827400/pexels-photo-2827400.jpeg?auto=compress&cs=tinysrgb&w=400', certifications: ['RYT 500', 'Meditation Coach', 'Flexibility Specialist'] },
  { id: 5, full_name: 'Coach Ahmed', specialization: 'Boxing & Martial Arts', experience_years: 12, rating: 4.7, total_clients: 200, bio: 'Former national boxing champion. Trains professionals and beginners in combat sports.', image_url: 'https://images.pexels.com/photos/598687/pexels-photo-598687.jpeg?auto=compress&cs=tinysrgb&w=400', certifications: ['Boxing Coach Level 3', 'MMA Coach', 'Kickboxing Instructor'] },
  { id: 6, full_name: 'Coach Farhan', specialization: 'Weight Loss & Cardio', experience_years: 5, rating: 4.8, total_clients: 75, bio: 'Specializes in fat loss transformations using science-based cardio and nutrition protocols.', image_url: 'https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=400', certifications: ['ACSM CPT', 'Weight Management Specialist', 'Cardio Coach'] },
]

export default function Trainers() {
  const [trainers, setTrainers] = useState(FALLBACK_TRAINERS)

  useEffect(() => {
    async function fetchTrainers() {
      const { data } = await supabase
        .from('trainer_profiles')
        .select('*, profiles(full_name, email, phone)')
        .limit(12)
      if (data?.length) {
        setTrainers(data.map(t => ({
          ...t, full_name: t.profiles?.full_name || 'Trainer',
          certifications: t.certifications || []
        })))
      }
    }
    fetchTrainers()
  }, [])

  return (
    <div className="page-enter pt-20 min-h-screen">
      {/* Hero */}
      <section className="py-20 bg-dark-800 dark:bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img loading="eager" decoding="async" fetchpriority="high" src="https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="bg" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-dark-900/80" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-brand-400 font-heading font-semibold text-sm uppercase tracking-widest mb-4">EXPERT COACHES</p>
          <h1 className="font-display text-5xl md:text-7xl text-white mb-6 tracking-wide">
            MEET YOUR <span className="text-brand-500">TRAINERS</span>
          </h1>
          <p className="text-gray-400 font-body text-lg max-w-xl mx-auto">
            World-class certified trainers committed to your transformation and success.
          </p>
        </div>
      </section>

      {/* Trainers Grid */}
      <section className="py-20 px-4 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="card-hover group overflow-hidden">
                {/* Image */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={trainer.image_url || `https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=400`}
                    alt={trainer.full_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-dark-800/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-xs font-bold">{trainer.rating || 4.8}</span>
                  </div>

                  {/* Social on hover */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={trainer.instagram || '#'} className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-brand-500 transition-colors">
                      <Instagram size={14} />
                    </a>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-bold text-xl text-dark-800 dark:text-white">{trainer.full_name}</h3>
                      <p className="text-brand-500 font-body text-sm font-semibold">{trainer.specialization}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl text-dark-800 dark:text-white">{trainer.experience_years}</p>
                      <p className="text-gray-400 text-xs font-body">Yrs Exp</p>
                    </div>
                  </div>

                  <p className="text-gray-500 dark:text-gray-400 font-body text-sm leading-relaxed mb-4">{trainer.bio}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-gray-50 dark:bg-dark-600 rounded-xl flex items-center gap-2">
                      <Users size={14} className="text-brand-500" />
                      <div>
                        <p className="font-bold text-sm text-dark-800 dark:text-white">{trainer.total_clients || 50}+</p>
                        <p className="text-gray-400 text-xs font-body">Clients</p>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-dark-600 rounded-xl flex items-center gap-2">
                      <Award size={14} className="text-brand-500" />
                      <div>
                        <p className="font-bold text-sm text-dark-800 dark:text-white">
                          {(trainer.certifications || []).length}
                        </p>
                        <p className="text-gray-400 text-xs font-body">Certs</p>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="flex flex-wrap gap-2">
                    {(trainer.certifications || []).slice(0, 2).map((cert, i) => (
                      <span key={i} className="badge-brand text-xs">{cert}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-500">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-4 tracking-wide">
            BECOME A TRAINER AT POWERFIT
          </h2>
          <p className="text-white/80 font-body mb-8">Are you a certified fitness professional? Join our world-class team.</p>
          <a href="/register" className="inline-flex items-center gap-2 bg-white text-brand-600 px-8 py-4 rounded-xl
          font-heading font-bold hover:bg-brand-50 transition-all text-lg shadow-xl">
            Apply Now →
          </a>
        </div>
      </section>
    </div>
  )
}
