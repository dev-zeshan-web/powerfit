import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Logo from './Logo'
import toast from 'react-hot-toast'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Classes', to: '/classes' },
  { label: 'Plans', to: '/plans' },
  { label: 'Trainers', to: '/trainers' },
  { label: 'AI Features', to: '/ai-features' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
      navigate('/')
    } catch {
      toast.error('Error signing out')
    }
  }

  const getDashboardPath = () => {
    if (profile?.role === 'admin') return '/dashboard/admin'
    if (profile?.role === 'trainer') return '/dashboard/trainer'
    return '/dashboard/member'
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 dark:bg-dark-800/95 backdrop-blur-md shadow-lg shadow-black/5 border-b border-gray-100 dark:border-dark-600'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo size="md" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-body font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? 'text-brand-500 bg-brand-50 dark:bg-brand-500/10'
                      : 'text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-gray-50 dark:hover:bg-dark-700'
                  }`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-dark-700 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-500
                  hover:bg-gray-50 dark:hover:bg-dark-700 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                    {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                    {profile?.full_name || 'User'}
                  </span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-dark-700 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-600 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-600">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{profile?.full_name}</p>
                      <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300
                        hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 transition-all text-sm font-semibold"
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500
                        hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-sm font-semibold"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : !authLoading ? (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-outline py-2 px-4 text-sm">Login</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Join Now</Link>
              </div>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white dark:bg-dark-800 border-t border-gray-100 dark:border-dark-600 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl font-body font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-dark-700'
                  }`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}

            <div className="pt-3 border-t border-gray-100 dark:border-dark-600">
              {user ? (
                <div className="space-y-1">
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300
                    hover:bg-brand-50 dark:hover:bg-dark-700 font-semibold"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleSignOut(); setIsOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500
                    hover:bg-red-50 dark:hover:bg-red-500/10 font-semibold"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              ) : !authLoading ? (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 btn-outline text-center text-sm py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 btn-primary text-center text-sm py-2"
                  >
                    Join Now
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdowns */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </nav>
  )
}