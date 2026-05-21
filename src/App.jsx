import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// ─── Lazy-load all pages (each becomes its own JS chunk) ───────────────────
const Home        = lazy(() => import('./pages/Home'))
const About       = lazy(() => import('./pages/About'))
const Classes     = lazy(() => import('./pages/Classes'))
const Plans       = lazy(() => import('./pages/Plans'))
const Trainers    = lazy(() => import('./pages/Trainers'))
const AIFeatures  = lazy(() => import('./pages/AIFeatures'))
const Login       = lazy(() => import('./pages/Login'))
const Register      = lazy(() => import('./pages/Register'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))

// Dashboards — separate chunks (heavy: recharts, tables, etc.)
const AdminDashboard   = lazy(() => import('./dashboards/AdminDashboard'))
const MemberDashboard  = lazy(() => import('./dashboards/MemberDashboard'))
const TrainerDashboard = lazy(() => import('./dashboards/TrainerDashboard'))

// ─── Shared page skeleton shown while a chunk loads ────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-900">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#fff',
                borderRadius: '12px',
                border: '1px solid rgba(255,107,0,0.2)',
                padding: '12px 16px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />

          {/* Suspense wraps all lazy routes */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes — Navbar + Footer */}
              <Route path="/"           element={<Layout><Home /></Layout>} />
              <Route path="/about"      element={<Layout><About /></Layout>} />
              <Route path="/classes"    element={<Layout><Classes /></Layout>} />
              <Route path="/plans"      element={<Layout><Plans /></Layout>} />
              <Route path="/trainers"   element={<Layout><Trainers /></Layout>} />
              <Route path="/ai-features" element={<Layout><AIFeatures /></Layout>} />

              {/* Auth pages — Navbar, no Footer */}
              <Route path="/login"    element={<Layout hideFooter><Login /></Layout>} />
              <Route path="/register" element={<Layout hideFooter><Register /></Layout>} />
              <Route path="/reset-password" element={<Layout hideFooter><ResetPassword /></Layout>} />

              {/* Protected dashboards — own sidebar layout */}
              <Route path="/dashboard/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/dashboard/member"
                element={
                  <ProtectedRoute requiredRole="member">
                    <MemberDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/dashboard/trainer"
                element={
                  <ProtectedRoute requiredRole="trainer">
                    <TrainerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
