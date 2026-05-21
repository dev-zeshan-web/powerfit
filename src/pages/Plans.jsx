import { useState, useEffect } from 'react'
import { CheckCircle, Zap, Crown, Star, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PaymentModal from '../components/PaymentModal'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const PLAN_ICONS = [Star, Zap, Crown]
const PLAN_GRADIENTS = [
  'from-slate-600 to-slate-800',
  'from-brand-500 to-brand-700',
  'from-dark-700 to-dark-900',
]

const FALLBACK_PLANS = [
  {
    id: '1', name: 'Basic', price: 2500, duration_days: 30,
    description: 'Perfect for beginners starting their fitness journey',
    features: ['Access to gym floor', 'Locker room access', '2 group classes/month', 'Basic equipment', 'Mobile app access'],
    color: '#6B7280', is_popular: false
  },
  {
    id: '2', name: 'Premium', price: 4500, duration_days: 30,
    description: 'Most popular plan for serious fitness enthusiasts',
    features: ['All Basic features', 'Unlimited group classes', '1 PT session/month', 'Diet consultation', 'Progress tracking AI', 'Priority booking'],
    color: '#FF6B00', is_popular: true
  },
  {
    id: '3', name: 'Elite', price: 8000, duration_days: 30,
    description: 'Ultimate package with full AI-powered coaching',
    features: ['All Premium features', 'Unlimited PT sessions', 'AI workout planner', 'Nutrition AI coach', 'Body composition analysis', 'VIP lounge access', '24/7 gym access'],
    color: '#1a1a2e', is_popular: false
  }
]

export default function Plans() {
  const [plans, setPlans] = useState(FALLBACK_PLANS)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchPlans() {
      const { data } = await supabase.from('plans').select('*').eq('is_active', true).order('price')
      if (data?.length) {
        setPlans(data.map(p => ({ ...p, features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]') })))
      }
    }
    fetchPlans()
  }, [])

  function handleSelect(plan) {
    if (!user) {
      toast.error('Please login to purchase a plan')
      navigate('/login')
      return
    }
    setSelectedPlan(plan)
    setShowPayment(true)
  }

  return (
    <div className="page-enter pt-20 min-h-screen bg-white dark:bg-dark-900">
      {/* Hero */}
      <section className="py-20 bg-dark-800 dark:bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-700 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-brand-400 font-heading font-semibold text-sm uppercase tracking-widest mb-4">MEMBERSHIP PLANS</p>
          <h1 className="font-display text-5xl md:text-7xl text-white mb-6 tracking-wide">
            CHOOSE YOUR <span className="text-brand-500">PLAN</span>
          </h1>
          <p className="text-gray-400 font-body text-lg max-w-xl mx-auto">
            Invest in yourself. Choose a plan that fits your lifestyle and start your transformation today.
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {plans.map((plan, index) => {
              const Icon = PLAN_ICONS[index] || Star
              const isPopular = plan.is_popular
              const features = Array.isArray(plan.features) ? plan.features : []

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer group ${
                    isPopular
                      ? 'scale-105 shadow-2xl shadow-brand-500/30 ring-2 ring-brand-500'
                      : 'hover:-translate-y-2 hover:shadow-xl'
                  } bg-white dark:bg-dark-700 border border-gray-100 dark:border-dark-600`}
                  onClick={() => handleSelect(plan)}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="bg-brand-500 text-white text-center py-2 text-xs font-heading font-bold uppercase tracking-widest">
                      ⚡ MOST POPULAR CHOICE
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className={`p-8 bg-gradient-to-br ${PLAN_GRADIENTS[index]} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12" />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Icon size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white/70 text-xs font-body uppercase tracking-wider">Plan</p>
                        <h3 className="font-display text-2xl text-white tracking-wide">{plan.name.toUpperCase()}</h3>
                      </div>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="font-display text-5xl text-white leading-none">
                        {plan.price?.toLocaleString()}
                      </span>
                      <span className="text-white/60 font-body mb-1">/mo</span>
                    </div>
                    <p className="text-white/50 text-xs font-body mt-1">PKR per month</p>
                  </div>

                  {/* Plan Body */}
                  <div className="p-8">
                    <p className="text-gray-500 dark:text-gray-400 font-body text-sm mb-6">{plan.description}</p>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle size={16} className="text-brand-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 font-body text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      className={`w-full py-4 rounded-xl font-heading font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                        isPopular
                          ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/30'
                          : 'border-2 border-dark-800 dark:border-gray-400 text-dark-800 dark:text-white hover:bg-dark-800 hover:text-white dark:hover:bg-white dark:hover:text-dark-800'
                      }`}
                    >
                      GET STARTED <ArrowRight size={16} />
                    </button>
                  </div>

                  {/* NayaPay Note */}
                  <div className="px-8 pb-6">
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-green-700 dark:text-green-400 font-body text-xs font-semibold">
                        Pay via NayaPay
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Plan Comparison Note */}
          <div className="mt-16 p-8 bg-gray-50 dark:bg-dark-800 rounded-3xl border border-gray-100 dark:border-dark-700">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { icon: '🔒', title: 'Secure Payment', desc: 'All payments via verified NayaPay channels' },
                { icon: '⚡', title: 'Instant Activation', desc: 'Membership activated within 24 hours of payment' },
                { icon: '↩️', title: '3-Day Trial', desc: 'Not satisfied? Contact us within 3 days for refund' },
              ].map(item => (
                <div key={item.title}>
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h4 className="font-heading font-bold text-dark-800 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-gray-500 dark:text-gray-400 font-body text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="font-display text-4xl text-dark-800 dark:text-white text-center mb-10 tracking-wide">
              FREQUENTLY ASKED <span className="text-brand-500">QUESTIONS</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { q: 'How do I pay via NayaPay?', a: 'Select your plan, click "Get Started", send the amount to our NayaPay number, then enter your transaction ID in the form.' },
                { q: 'When will my membership be activated?', a: 'After payment verification by our admin, typically within 24 hours. You\'ll receive a notification.' },
                { q: 'Can I upgrade my plan?', a: 'Yes! Contact admin or use your member dashboard to request an upgrade. Price difference applies.' },
                { q: 'What if I miss a class?', a: 'You can cancel bookings up to 2 hours before class. Missed classes without cancellation count toward your limit.' },
              ].map(({ q, a }) => (
                <div key={q} className="card p-6">
                  <h4 className="font-heading font-bold text-dark-800 dark:text-white mb-2">{q}</h4>
                  <p className="text-gray-500 dark:text-gray-400 font-body text-sm">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {showPayment && selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => { setShowPayment(false); setSelectedPlan(null) }}
          onSuccess={() => toast.success('Plan selected! Payment pending verification.')}
        />
      )}
    </div>
  )
}
