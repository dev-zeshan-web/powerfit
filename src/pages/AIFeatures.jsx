import { Brain, Zap, Target, BarChart2, Dumbbell, Salad } from 'lucide-react'
import AIChat from '../components/AIChat'
import BMICalculator from '../components/BMICalculator'

const FEATURES = [
  { icon: Brain, title: 'AI Workout Planner', desc: 'Gemini AI creates personalized 7-day workout plans based on your BMI, goals, and fitness level.' },
  { icon: Salad, title: 'Nutrition Coach', desc: 'Get customized meal plans and macro calculations based on your body type and fitness objectives.' },
  { icon: Target, title: 'Goal Tracking', desc: 'AI monitors your progress and automatically adjusts your training intensity to keep you on track.' },
  { icon: BarChart2, title: 'Progress Analytics', desc: 'Visual dashboards powered by AI to show your transformation journey with predictive insights.' },
  { icon: Zap, title: 'Real-time Advice', desc: 'Chat with our AI coach 24/7. Get instant answers to all your fitness and health questions.' },
  { icon: Dumbbell, title: 'Exercise Library', desc: 'Access thousands of exercises with AI-recommended modifications based on your fitness level.' },
]

export default function AIFeatures() {
  return (
    <div className="page-enter pt-20 min-h-screen">
      {/* Hero */}
      <section className="py-20 bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-900/20 via-dark-900 to-purple-900/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl animate-pulse-slow" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/20 border border-brand-500/30 rounded-full mb-6">
            <span className="text-brand-400 text-sm font-body">⚡ Powered by Google Gemini AI</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-white mb-6 tracking-wide">
            AI-POWERED <span className="text-brand-500">FITNESS</span>
          </h1>
          <p className="text-gray-400 font-body text-lg max-w-xl mx-auto">
            Meet your personal AI fitness coach. Get instant, personalized advice powered by Google Gemini — available 24/7.
          </p>
        </div>
      </section>

      {/* AI Features Grid */}
      <section className="py-20 bg-white dark:bg-dark-900 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-5xl text-dark-800 dark:text-white tracking-wide mb-4">
              AI <span className="text-brand-500">CAPABILITIES</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover p-6">
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-brand-500" />
                </div>
                <h3 className="font-heading font-bold text-lg text-dark-800 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-body text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Live AI Chat Demo */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <h2 className="font-display text-4xl text-dark-800 dark:text-white tracking-wide mb-3">
                CHAT WITH AI <span className="text-brand-500">COACH</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-body">
                Ask anything about fitness, nutrition, workouts, or health goals
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <AIChat />
            </div>
          </div>

          {/* BMI + AI */}
          <div>
            <div className="text-center mb-8">
              <h2 className="font-display text-4xl text-dark-800 dark:text-white tracking-wide mb-3">
                AI <span className="text-brand-500">BMI ANALYZER</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-body">
                Calculate your BMI and get an AI-generated workout plan instantly
              </p>
            </div>
            <div className="flex justify-center">
              <BMICalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Technical Info */}
      <section className="py-20 bg-dark-800 dark:bg-dark-900 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl text-white text-center mb-12 tracking-wide">
            HOW IT <span className="text-brand-500">WORKS</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Input Your Data', desc: 'Enter your weight, height, age, and fitness goals', icon: '📊' },
              { step: '02', title: 'AI Analysis', desc: 'Gemini AI processes your data with advanced ML models', icon: '🤖' },
              { step: '03', title: 'Get Your Plan', desc: 'Receive personalized workout and nutrition recommendations', icon: '💪' },
            ].map(item => (
              <div key={item.step} className="relative p-6 rounded-2xl bg-dark-700 dark:bg-dark-800 border border-dark-600">
                <span className="absolute -top-3 -right-3 w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center
                text-white font-display text-sm">{item.step}</span>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-heading font-bold text-white text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 font-body text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 p-6 bg-brand-500/10 border border-brand-500/30 rounded-2xl text-center">
            <p className="text-brand-400 font-body text-sm">
              🔑 <strong>API:</strong> Google Gemini 1.5 Flash (FREE tier) — 15 requests/min · 1M tokens/min · 1500 requests/day
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
