import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState(null)
  const [validSession, setValidSession] = useState(false)
  const { updatePassword }          = useAuth()
  const navigate                    = useNavigate()

  useEffect(() => {
    // Supabase sends the token in the URL hash — exchange it for a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true)
      } else {
        setError('Invalid or expired reset link. Please request a new one.')
      }
    })

    // Also listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setValidSession(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const strength = password.length === 0 ? 0
    : password.length < 6   ? 1
    : password.length < 10  ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6)      { toast.error('Password must be at least 6 characters'); return }
    if (password !== confirm)     { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await updatePassword(password)
      setDone(true)
      toast.success('Password updated successfully!')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 flex items-center justify-center p-6 pt-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="md" className="mx-auto mb-4" />
          <h1 className="font-display text-4xl text-dark-800 dark:text-white tracking-wide">
            RESET PASSWORD
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-body">
            Create a new secure password for your account
          </p>
        </div>

        <div className="card p-8">
          {/* Invalid link */}
          {error && !validSession && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white">Link Expired</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <button onClick={() => navigate('/login')} className="btn-primary w-full">
                Back to Login
              </button>
            </div>
          )}

          {/* Success */}
          {done && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-lg">Password Updated!</p>
              <p className="text-gray-500 text-sm">Redirecting to login in 3 seconds...</p>
              <button onClick={() => navigate('/login')} className="btn-primary w-full">
                Go to Login
              </button>
            </div>
          )}

          {/* Form */}
          {validSession && !done && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="input-field pl-10 pr-12"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-gray-200 dark:bg-dark-600'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strength >= 3 ? 'text-green-500' : strength === 2 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {strengthLabels[strength]}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter new password"
                    className="input-field pl-10 pr-12"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirm.length > 0 && (
                  <p className={`text-xs mt-1 font-medium ${password === confirm ? 'text-green-500' : 'text-red-500'}`}>
                    {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Updating...</>
                ) : (
                  <><Lock size={18} /> Set New Password</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
