import { Link } from 'react-router-dom'
import { CheckCircle, Target, Heart, Zap, Award, ArrowRight } from 'lucide-react'

const TEAM_MEMBERS = [
  { name: 'Bilal Ahmed', role: 'Founder & CEO', img: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Usman Khan', role: 'Head Trainer', img: 'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Hamza Shah', role: 'AI Developer', img: 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=300' },
]

const VALUES = [
  { icon: Target, title: 'Excellence', desc: 'We never settle. Every workout, every plan, every interaction — we aim for world-class quality.', color: 'text-brand-500' },
  { icon: Heart, title: 'Community', desc: 'PowerFit is more than a gym. It\'s a family of driven individuals supporting each other.', color: 'text-red-500' },
  { icon: Zap, title: 'Innovation', desc: 'We leverage the latest AI and technology to make fitness smarter, not harder.', color: 'text-yellow-500' },
  { icon: Award, title: 'Results', desc: 'We are 100% committed to your results. Your transformation is our success story.', color: 'text-green-500' },
]

export default function About() {
  return (
    <div className="page-enter pt-20 min-h-screen">
      {/* Hero */}
      <section className="relative h-96 flex items-center overflow-hidden">
        <img loading="eager" decoding="async" fetchpriority="high" src="https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="About Hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-dark-900/80" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center w-full">
          <p className="text-brand-400 font-heading font-semibold text-sm uppercase tracking-widest mb-4">OUR STORY</p>
          <h1 className="font-display text-5xl md:text-7xl text-white tracking-wide">
            ABOUT <span className="text-brand-500">POWERFIT</span>
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-brand-500 font-heading font-semibold text-sm uppercase tracking-widest">OUR MISSION</p>
              <h2 className="font-display text-5xl text-dark-800 dark:text-white tracking-wide leading-none">
                MAKING FITNESS <span className="text-brand-500">ACCESSIBLE</span> FOR ALL
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 font-body leading-relaxed">
                <p>Founded in 2020, PowerFit started with a simple vision: make world-class fitness accessible to everyone in Pakistan. We saw that traditional gyms lacked personalization, technology, and proper management systems.</p>
                <p>Today, PowerFit is Pakistan's most technologically advanced gym management system, combining AI-powered coaching with professional training facilities to deliver unprecedented results.</p>
                <p>Our AI system analyzes your body metrics, fitness goals, and progress to create truly personalized workout and nutrition plans that evolve as you do.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[['2020', 'Founded'], ['1200+', 'Members'], ['800+', 'Transformations'], ['25+', 'Expert Trainers']].map(([v, l]) => (
                  <div key={l} className="p-4 bg-gray-50 dark:bg-dark-800 rounded-xl text-center">
                    <p className="font-display text-3xl text-brand-500">{v}</p>
                    <p className="text-gray-500 font-body text-xs uppercase tracking-wider mt-1">{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img loading="lazy" decoding="async" src="https://images.pexels.com/photos/2827400/pexels-photo-2827400.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="About" className="rounded-3xl w-full shadow-2xl" />
              <div className="absolute -bottom-6 -left-6 bg-brand-500 text-white p-6 rounded-2xl shadow-xl">
                <p className="font-display text-3xl">4 YEARS</p>
                <p className="font-body text-sm opacity-80">Of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-500 font-heading font-semibold text-sm uppercase tracking-widest mb-3">WHAT WE STAND FOR</p>
            <h2 className="font-display text-5xl text-dark-800 dark:text-white tracking-wide">
              OUR <span className="text-brand-500">VALUES</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card p-6 text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-dark-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Icon size={28} className={color} />
                </div>
                <h3 className="font-heading font-bold text-xl text-dark-800 dark:text-white mb-3">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-body text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-24 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-2 gap-4">
              <img loading="lazy" decoding="async" src="https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="" className="rounded-2xl h-48 w-full object-cover" />
              <img loading="lazy" decoding="async" src="https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="" className="rounded-2xl h-48 w-full object-cover mt-8" />
              <img loading="lazy" decoding="async" src="https://images.pexels.com/photos/598687/pexels-photo-598687.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="" className="rounded-2xl h-48 w-full object-cover" />
              <img loading="lazy" decoding="async" src="https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="" className="rounded-2xl h-48 w-full object-cover mt-8" />
            </div>
            <div className="space-y-6">
              <p className="text-brand-500 font-heading font-semibold text-sm uppercase tracking-widest">WHY CHOOSE US</p>
              <h2 className="font-display text-5xl text-dark-800 dark:text-white tracking-wide leading-none">
                WHAT MAKES US <span className="text-brand-500">DIFFERENT</span>
              </h2>
              <div className="space-y-4">
                {[
                  'AI-powered personalized training plans updated weekly',
                  'Pakistan\'s only gym with Gemini AI fitness coaching',
                  'Real-time class booking and attendance tracking',
                  'Transparent finance management with NayaPay',
                  'Role-based access for admins, trainers and members',
                  'Comprehensive member health analytics dashboard',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-brand-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 font-body">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn-primary inline-flex">
                Join PowerFit Today <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
