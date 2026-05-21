import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import toast from 'react-hot-toast'

/* ── Forgot Password Modal ─────────────────────────────────── */
function ForgotPasswordModal({ open, onClose }) {
  const { resetPassword } = useAuth()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  async function handleReset(e) {
    e.preventDefault()
    if (!email.trim()) { toast.error('Please enter your email'); return }
    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setEmail('')
    setSent(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-dark-700 flex items-center gap-3">
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-gray-500" />
          </button>
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Reset Password</h2>
            <p className="text-sm text-gray-500">Works for all accounts — member, trainer, admin</p>
          </div>
        </div>

        <div className="p-6">
          {sent ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Check your email!</h3>
                <p className="text-gray-500 text-sm mt-2">
                  We sent a password reset link to<br />
                  <span className="font-semibold text-brand-500">{email}</span>
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl text-sm text-blue-700 dark:text-blue-400 text-left space-y-1">
                <p>📧 Open the email from <strong>PowerFit</strong></p>
                <p>🔗 Click the <strong>Reset Password</strong> link</p>
                <p>🔑 Enter your new password</p>
                <p>✅ Log back in with your new password</p>
              </div>
              <p className="text-xs text-gray-400">Didn't get it? Check spam or{' '}
                <button onClick={() => setSent(false)} className="text-brand-500 hover:underline font-semibold">try again</button>
              </p>
              <button onClick={handleClose} className="btn-primary w-full">Back to Login</button>
            </div>
          ) : (
            /* Email Form */
            <form onSubmit={handleReset} className="space-y-5">
              <div className="p-4 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 rounded-xl">
                <p className="text-sm text-brand-700 dark:text-brand-400">
                  Enter the email address linked to your <strong>PowerFit account</strong>. We'll send you a secure link to reset your password.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                    autoFocus
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={handleClose} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 text-sm">
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Sending...</>
                  ) : (
                    <><Mail size={16} /> Send Reset Link</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Login Page ────────────────────────────────────────────── */
export default function Login() {
  const [form, setForm]           = useState({ email: '', password: '' })
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const { signIn }                = useAuth()
  const navigate                  = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const authData = await signIn(form)
      toast.success('Welcome back! 💪')
      setTimeout(async () => {
        const { supabase } = await import('../lib/supabase')
        const userId = authData?.user?.id
        if (!userId) { navigate('/', { replace: true }); return }
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', userId).single()
        const role = prof?.role
        if (role === 'admin')        navigate('/dashboard/admin',   { replace: true })
        else if (role === 'trainer') navigate('/dashboard/trainer', { replace: true })
        else                         navigate('/dashboard/member',  { replace: true })
      }, 600)
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen flex pt-16 md:pt-20">
        {/* Left — hero image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <img
            src="https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Gym"
            className="w-full h-full object-cover"
            loading="eager"
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-dark-900/60" />
          <div className="absolute inset-0 flex flex-col justify-center p-12">
            <Logo size="lg" />
            <div className="mt-12 space-y-4">
              <h2 className="font-display text-5xl text-white tracking-wide leading-tight">
                WELCOME<br />BACK<br /><span className="text-brand-500">CHAMPION</span>
              </h2>
              <p className="text-gray-300 font-body text-lg max-w-sm">
                Your fitness journey continues. Sign in and crush your goals today.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6">
              {[['1200+', 'Members'], ['25+', 'Trainers'], ['5★', 'Rating']].map(([v, l]) => (
                <div key={l} className="text-center">
                  <p className="font-display text-3xl text-brand-400">{v}</p>
                  <p className="text-gray-400 text-xs font-body">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-dark-900">
          <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden"><Logo size="md" /></div>

            <div>
              <h1 className="font-display text-4xl text-dark-800 dark:text-white tracking-wide">SIGN IN</h1>
              <p className="text-gray-500 dark:text-gray-400 font-body mt-2">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-500 font-semibold hover:text-brand-600">
                  Create one free
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="input-field pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-brand-500" />
                  <span className="text-gray-500 font-body text-sm">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-brand-500 font-body text-sm font-semibold hover:text-brand-600 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full text-base py-4">
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                ) : (
                  <><LogIn size={18} /> Sign In</>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 font-body">
              By signing in you agree to our{' '}
              <span className="text-brand-500 cursor-pointer hover:underline">Terms of Service</span>
              {' & '}
              <span className="text-brand-500 cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  )
}
