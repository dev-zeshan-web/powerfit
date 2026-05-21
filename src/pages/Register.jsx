import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'member', gender: 'male', agreeTerms: false
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.agreeTerms) { toast.error('Please accept terms and conditions'); return }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
        role: form.role,
      })
      setSuccess(true)
      toast.success('Account created! Please check your email to verify.')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-900 p-4 pt-24">
        <div className="text-center space-y-6 max-w-md animate-fade-in">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h1 className="font-display text-4xl text-dark-800 dark:text-white tracking-wide">ACCOUNT CREATED!</h1>
          <p className="text-gray-500 font-body">Please check your email and verify your account to get started.</p>
          <Link to="/login" className="btn-primary inline-flex">Go to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex pt-16 md:pt-20">
      {/* Left Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Gym"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-dark-900/50" />
        <div className="absolute inset-0 flex flex-col justify-center p-12">
          <Logo size="lg" />
          <div className="mt-12 space-y-4">
            <h2 className="font-display text-5xl text-white tracking-wide">
              START YOUR<br /><span className="text-brand-500">JOURNEY</span><br />TODAY
            </h2>
            <p className="text-gray-300 font-body text-lg max-w-sm">
              Join 1,200+ members transforming their bodies with AI-powered coaching.
            </p>
          </div>
          <div className="mt-8 space-y-3">
            {['Free AI workout plans', 'Expert trainer guidance', 'Class booking system', 'Progress analytics'].map(item => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-brand-400" />
                <span className="text-gray-300 font-body text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-dark-900 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-8">
          <div className="lg:hidden"><Logo size="md" /></div>

          <div>
            <h1 className="font-display text-4xl text-dark-800 dark:text-white tracking-wide">CREATE ACCOUNT</h1>
            <p className="text-gray-500 font-body mt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-500 font-semibold hover:text-brand-600">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Select */}
            <div>
              <label className="label">Register As</label>
              <div className="grid grid-cols-2 gap-3">
                {[['member', '🏋️ Member'], ['trainer', '💪 Trainer']].map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm({ ...form, role: val })}
                    className={`py-3 rounded-xl font-body font-semibold text-sm border-2 transition-all ${
                      form.role === val
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                        : 'border-gray-200 dark:border-dark-500 text-gray-500 hover:border-brand-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Full Name</label>
              <input type="text" placeholder="Muhammad Ahmed" value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                className="input-field" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field" required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input type="tel" placeholder="0300-1234567" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="input-field" />
              </div>
            </div>

            <div>
              <label className="label">Gender</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="input-field">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} placeholder="Min 6 chars" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="input-field pr-12" required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input type="password" placeholder="Repeat password" value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="input-field" required />
              </div>
            </div>

            {/* Password Strength */}
            {form.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map(level => (
                    <div key={level} className={`h-1.5 flex-1 rounded-full transition-all ${
                      form.password.length >= level * 2 ? 'bg-brand-500' : 'bg-gray-200 dark:bg-dark-500'
                    }`} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 font-body">
                  {form.password.length < 6 ? '⚠️ Too short' : form.password.length < 8 ? '🔒 Weak' : form.password.length < 12 ? '🔒🔒 Good' : '🔒🔒🔒 Strong'}
                </p>
              </div>
            )}

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.agreeTerms}
                onChange={e => setForm({ ...form, agreeTerms: e.target.checked })}
                className="mt-1 w-4 h-4 accent-brand-500" />
              <span className="text-gray-500 font-body text-sm leading-relaxed">
                I agree to the{' '}
                <span className="text-brand-500 font-semibold">Terms of Service</span> and{' '}
                <span className="text-brand-500 font-semibold">Privacy Policy</span>
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-4">
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Creating Account...</>
              ) : (
                <><UserPlus size={18} /> Create Account</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
