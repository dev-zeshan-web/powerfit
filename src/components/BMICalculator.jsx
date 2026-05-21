import { useState } from 'react'
import { Activity, ChevronRight } from 'lucide-react'
import { getWorkoutSuggestion } from '../lib/gemini'

export default function BMICalculator() {
  const [form, setForm] = useState({ weight: '', height: '', age: '', gender: 'male', unit: 'metric' })
  const [result, setResult] = useState(null)
  const [aiTip, setAiTip] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)

  function calcBMI() {
    const w = parseFloat(form.weight)
    const h = parseFloat(form.height) / 100
    if (!w || !h || h <= 0) return

    const bmi = (w / (h * h)).toFixed(1)
    let category, color, ideal

    if (bmi < 18.5)      { category = 'Underweight'; color = 'text-blue-500';  ideal = 'Gain healthy weight' }
    else if (bmi < 25)   { category = 'Normal Weight'; color = 'text-green-500'; ideal = 'Maintain current weight' }
    else if (bmi < 30)   { category = 'Overweight';   color = 'text-yellow-500'; ideal = 'Lose 5-10 kg' }
    else if (bmi < 35)   { category = 'Obese Class I'; color = 'text-orange-500'; ideal = 'Lose 15-20 kg' }
    else                 { category = 'Obese Class II'; color = 'text-red-500'; ideal = 'Medical consultation advised' }

    // Ideal weight range (BMI 18.5 – 24.9)
    const idealMin = (18.5 * h * h).toFixed(1)
    const idealMax = (24.9 * h * h).toFixed(1)

    setResult({ bmi, category, color, ideal, idealMin, idealMax })
  }

  async function getAIAdvice() {
    if (!result) return
    setLoadingAI(true)
    setAiTip('')
    const { text } = await getWorkoutSuggestion(result.bmi, result.ideal, 'Beginner')
    setAiTip(text)
    setLoadingAI(false)
  }

  const progressPos = result ? Math.min(Math.max(((result.bmi - 10) / 30) * 100, 0), 100) : 0

  return (
    <div className="card p-6 md:p-8 max-w-xl w-full mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center">
          <Activity className="text-brand-500" size={24} />
        </div>
        <div>
          <h3 className="font-heading font-bold text-xl text-dark-800 dark:text-white">BMI Calculator</h3>
          <p className="text-sm text-gray-400 font-body">Check your Body Mass Index</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label">Weight (kg)</label>
          <input
            type="number"
            placeholder="70"
            value={form.weight}
            onChange={e => setForm({ ...form, weight: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Height (cm)</label>
          <input
            type="number"
            placeholder="175"
            value={form.height}
            onChange={e => setForm({ ...form, height: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Age</label>
          <input
            type="number"
            placeholder="25"
            value={form.age}
            onChange={e => setForm({ ...form, age: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Gender</label>
          <select
            value={form.gender}
            onChange={e => setForm({ ...form, gender: e.target.value })}
            className="input-field"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <button onClick={calcBMI} className="btn-primary w-full">
        Calculate BMI
      </button>

      {result && (
        <div className="mt-6 space-y-4 animate-fade-in">
          {/* BMI Score */}
          <div className="text-center p-6 bg-gray-50 dark:bg-dark-600 rounded-2xl">
            <p className="font-body text-sm text-gray-500 mb-1">Your BMI Score</p>
            <p className={`font-display text-6xl ${result.color}`}>{result.bmi}</p>
            <p className={`font-heading font-bold text-lg mt-1 ${result.color}`}>{result.category}</p>
          </div>

          {/* BMI Scale */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 font-body mb-1">
              <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{
              background: 'linear-gradient(to right, #3b82f6 0%, #22c55e 35%, #eab308 60%, #f97316 75%, #ef4444 100%)'
            }}>
              <div
                className="relative h-full"
                style={{ marginLeft: `${progressPos}%` }}
              >
                <div className="w-0.5 h-full bg-dark-800 dark:bg-white absolute" />
                <div className="absolute -top-5 -translate-x-1/2 text-xs font-bold text-dark-800 dark:text-white whitespace-nowrap">
                  ▼ {result.bmi}
                </div>
              </div>
            </div>
          </div>

          {/* Ideal Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
              <p className="text-xs text-green-600 font-semibold font-body">Ideal Weight Range</p>
              <p className="font-bold text-green-700 dark:text-green-400 font-heading">
                {result.idealMin} – {result.idealMax} kg
              </p>
            </div>
            <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-center">
              <p className="text-xs text-brand-600 font-semibold font-body">Goal</p>
              <p className="font-bold text-brand-700 dark:text-brand-400 font-heading text-sm">{result.ideal}</p>
            </div>
          </div>

          {/* AI Advice Button */}
          <button
            onClick={getAIAdvice}
            disabled={loadingAI}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-brand-500 to-brand-700
            text-white font-heading font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70"
          >
            {loadingAI ? (
              <><div className="w-4 h-4 spinner" /> Getting AI Advice...</>
            ) : (
              <><span>🤖</span> Get AI Workout Plan <ChevronRight size={16} /></>
            )}
          </button>

          {aiTip && (
            <div className="p-4 bg-dark-800 dark:bg-dark-700 rounded-xl border border-brand-500/30 animate-fade-in">
              <p className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-2 font-body">🤖 AI Coach Recommendation</p>
              <p className="text-gray-300 text-sm font-body leading-relaxed whitespace-pre-line">{aiTip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
